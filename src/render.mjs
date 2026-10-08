import fs from 'node:fs';

const template = (name) => fs.readFileSync(new URL(`./templates/${name}.html`, import.meta.url), 'utf8');
export const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const external = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
const tags = (items) => `<div class="tags">${items.map((item) => `<span>${escape(item)}</span>`).join('')}</div>`;
const list = (items) => `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>`;
const related = (project, projects) => (project.related ?? []).map((id) => projects.find((item) => item.id === id)).filter(Boolean);

function fill(source, site, extra = {}) {
  const values = { NAME: site.name, EMAIL: site.email, GITHUB: site.github, LINKEDIN: site.linkedin, PORTRAIT: site.portrait, RESUME: site.resume, ...extra };
  return source.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Unknown template token: ${key}`);
    return key === 'PROJECT_CATALOG' ? values[key] : escape(values[key]);
  });
}

function layout({ title, description, pathname, body, site, person = false }) {
  const canonical = `${site.siteUrl}${pathname}`;
  const schema = person ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: site.name, jobTitle: 'Full-Stack Developer', url: site.siteUrl, email: site.email, address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressCountry: 'PK' }, sameAs: [site.github, site.linkedin] }).replace(/</g, '\\u003c')}</script>` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#101210">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)}</title>
  <link rel="canonical" href="${escape(canonical)}">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:type" content="${person ? 'profile' : 'website'}">
  <meta property="og:url" content="${escape(canonical)}">
  <meta property="og:image" content="${escape(site.siteUrl + site.portrait)}">
  <meta property="og:image:alt" content="Portrait of ${escape(site.name)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css?v=${site.assetVersion}">
  ${schema}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress" aria-hidden="true"></div>
  <header>${fill(template('header'), site).replace(`href="${pathname}"`, `href="${pathname}" aria-current="page"`)}</header>
  <main id="main">${body}</main>
  <footer>${fill(template('footer'), site)}</footer>
  <script src="/assets/vendor/gsap.min.js" defer></script>
  <script src="/script.js?v=${site.assetVersion}" defer></script>
</body>
</html>`;
}

function projectCard(project, index, projects) {
  const url = `/projects/${project.id}/`;
  const connections = related(project, projects);
  const preview = project.image
    ? `<img src="/assets/${escape(project.image)}" alt="Public ${escape(project.title)} website screenshot" loading="lazy" width="1280" height="800">`
    : `<span class="type-label">${escape(project.group)}</span><strong>${escape(project.title)}</strong><span class="type-footer">${escape(project.stack.slice(0, 3).join(' / '))}</span>`;
  return `<article class="project-card reveal" data-category="${escape(project.group)}">
    <a class="project-preview ${project.image ? '' : 'type-preview'}" href="${url}" aria-label="Read ${escape(project.title)} case study">
      ${preview}<span class="preview-badge">${escape(project.status)}</span>
    </a>
    <div class="card-body">
      <div class="card-title"><h3><a href="${url}">${escape(project.title)}</a></h3><span class="card-num">${String(index + 1).padStart(2, '0')}</span></div>
      <p>${escape(project.summary)}</p>
      <p class="project-role">${escape(project.role)}</p>
      ${tags(project.stack)}
      <details class="scope-disclosure">
        <summary>Project scope</summary>
        ${list(project.scope ?? project.details)}
        <p class="scope-note">${escape(project.status)}${connections.length ? ` · Related work: ${escape(connections.map((item) => item.title).join(', '))}` : ''}</p>
      </details>
      <div class="card-links"><a href="${url}">Case study <span>+</span></a>${project.url ? external(project.url, 'Visit project') : ''}</div>
    </div>
  </article>`;
}

function explorationCard(project, index) {
  return `<a class="exploration reveal" href="/projects/${project.id}/">
    <span>${String(index + 1).padStart(2, '0')} / ${escape(project.status)}</span>
    <h3>${escape(project.title)}</h3><p>${escape(project.summary)}</p>
    <p class="project-role">${escape(project.role)}</p>${tags(project.stack)}<strong>Explore project +</strong>
  </a>`;
}

function projectCatalog(projects) {
  const filters = ['All work', 'Full-stack', 'Healthcare', 'AI & Web3', 'Websites'];
  return `<section id="work" class="section">
    <div class="section-head reveal"><div><p class="eyebrow">01 / SELECTED WORK</p><h2>Real projects.<br><span class="dim">Complete experiences.</span></h2></div><p>Healthcare, business systems, AI,<br>and the connections between them.</p></div>
    <div class="project-overview"><span>Websites, applications &amp; related workflows</span><span>Prototypes &amp; concepts below</span></div>
    <p class="project-context">Related CRM, commerce, and parental-control entries link to one another. These are project and scope entries, not a count of independently completed products.</p>
    <div class="filters" role="group" aria-label="Filter professional projects">${filters.map((item, index) => `<button data-filter="${index ? escape(item) : 'all'}" class="${index ? '' : 'active'}" aria-pressed="${index === 0}">${escape(item)}</button>`).join('')}</div>
    <p class="sr-only" id="filter-status" aria-live="polite"></p>
    <div class="projects">${projects.filter((project) => project.group !== 'Explorations').map((project, index) => projectCard(project, index, projects)).join('')}</div>
    <div class="exploration-heading reveal"><p class="eyebrow">EXPLORATIONS / PROTOTYPES &amp; CONCEPTS</p><h3>Room to experiment.</h3><p>Mobile, commerce, games, and automation. Prototype, academic, architecture, and proposed work are labeled individually.</p></div>
    <div class="explorations">${projects.filter((project) => project.group === 'Explorations').map(explorationCard).join('')}</div>
  </section>`;
}

export function renderHome(projects, site) {
  const featured = projects.filter(project => ['hired-billing-support', 'workdeskva', 'hbs-crm', 'revex'].includes(project.id));
  const showcase = `<section id="work" class="section"><div class="section-head reveal"><div><p class="eyebrow">01 / FEATURED WORK</p><h2>Interfaces to infrastructure.<br><span class="dim">Work across the stack.</span></h2></div><a class="button secondary" href="/projects/">All projects <span>↗</span></a></div><div class="projects">${featured.map((project, index) => projectCard(project, index, projects)).join('')}</div></section>`;
  return layout({ title: site.title, description: site.description, pathname: '/', body: fill(template('home'), site, { PROJECT_CATALOG: showcase }), site, person: true });
}

export function renderAbout(site) {
  return layout({ title: `About — ${site.name}`, description: 'Meet Salman Ali: full-stack developer in Lahore. Explore his background, skills, professional experience, education, and development approach.', pathname: '/about/', body: fill(template('about'), site), site });
}

export function renderProjects(projects, site) {
  const intro = `<section class="section page-intro"><a class="back-link" href="/">Portfolio home</a><p class="eyebrow">PROJECTS / THE PORTFOLIO</p><h1>Built. Connected.<br><span class="violet">Explored.</span></h1><p class="lead">Business websites, complete application systems, and ideas in development.</p><p>Explore each project’s technologies, scope, and my involvement. Professional contributions, related workflows, prototypes, and concepts are labeled individually.</p></section>`;
  return layout({ title: `Projects — ${site.name}`, description: 'Explore Salman Ali’s full-stack, healthcare, CRM, AI, Web3, website, and prototype projects with detailed case studies.', pathname: '/projects/', body: intro + projectCatalog(projects), site });
}

export function renderProject(project, projects, site) {
  const connections = related(project, projects);
  const unconfirmed = ['In development', 'Related CRM scope', 'Related CRM workflow', 'Proposed platform', 'System architecture', 'Architecture concept', 'Portfolio concept', 'Website concept', 'Proposed automation', 'Application concept', 'Academic concept'].includes(project.status);
  const body = `<div class="case-study">
    <a class="back-link" href="/projects/">All projects</a>
    <div class="case-heading">
      <p class="eyebrow">${escape(project.group)} / ${escape(project.status)}</p>
      <h1>${escape(project.title)}</h1><p class="lead">${escape(project.summary)}</p>${tags(project.stack)}
      <div class="case-facts"><div><span>INVOLVEMENT</span><strong>${escape(project.role)}</strong></div><div><span>PROJECT STAGE</span><strong>${escape(project.status)}</strong></div></div>
      <div class="case-actions">${project.url ? external(project.url, 'Open project website') : ''}${project.altUrl ? external(project.altUrl, 'Alternate supplied CRM URL') : ''}${external(site.github, 'GitHub profile')}</div>
    </div>
    ${project.image ? `<figure class="case-image"><img src="/assets/${escape(project.image)}" alt="Public ${escape(project.title)} website screenshot" width="1280" height="800"><figcaption>Public website capture · October 2026${project.id === 'hbs-crm' ? ' · Authentication screen only' : ''}</figcaption></figure>` : ''}
    <div class="case-content">
      <section><p class="eyebrow">01 / CONTEXT</p><h2>The project</h2><p>${escape(project.context)}</p></section>
      <section><p class="eyebrow">02 / PRODUCT SCOPE</p><h2>What it covers</h2>${list(project.scope ?? project.details)}<p class="scope-note">${unconfirmed ? 'This describes the intended or related scope. It is not a claim that every feature is complete.' : 'The product scope is separate from my individual contribution described below.'}</p></section>
      <section><p class="eyebrow">03 / CONTRIBUTION</p><h2>My involvement</h2><p>${escape(project.contribution)}</p></section>
      <section><p class="eyebrow">04 / DEVELOPMENT DETAILS</p><h2>${project.id === 'hbs-crm' ? 'Verified entry point &amp; unconfirmed scope' : 'Work in focus'}</h2>${list(project.details)}</section>
      <aside class="project-note"><h3>Project status</h3><p>${escape(project.note)}</p></aside>
      ${connections.length ? `<section class="related-projects"><p class="eyebrow">RELATED WORK</p><h2>Connected project scope</h2><p>These entries explore related parts of the same project family.</p><div>${connections.map((item) => `<a href="/projects/${item.id}/">${escape(item.title)}</a>`).join('')}</div></section>` : ''}
    </div>
    <div class="case-end"><h2>Have a related challenge?</h2><a class="button" href="/#contact">Let’s talk <span>+</span></a></div>
  </div>`;
  return layout({ title: `${project.title} — ${site.name}`, description: project.summary, pathname: `/projects/${project.id}/`, body, site });
}

export function renderNotFound(site) {
  return layout({ title: `Page not found — ${site.name}`, description: 'Return to Salman Ali’s portfolio.', pathname: '/404.html', body: '<section class="section"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>Let’s get you back.</h1><p>The page you’re looking for isn’t here.</p><a class="button" href="/">Portfolio home</a></section>', site });
}
