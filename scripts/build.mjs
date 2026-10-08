import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHome, renderAbout, renderProjects, renderProject, renderNotFound, escape } from '../src/render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/site.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(root, 'src/projects.json'), 'utf8'));
site.assetVersion = createHash('sha256').update(fs.readFileSync(path.join(root, 'src/styles/main.css'))).update(fs.readFileSync(path.join(root, 'src/scripts/main.js'))).digest('hex').slice(0, 12);
const platformUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
site.siteUrl = (process.env.SITE_URL || process.env.URL || (platformUrl ? `https://${platformUrl}` : '') || site.siteUrl).replace(/\/$/, '');
const origin = new URL(site.siteUrl);
if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('SITE_URL must be a root HTTP(S) origin, such as https://example.com.');

const ids = new Set();
for (const project of projects) {
  if (!/^[a-z][a-z0-9-]*$/.test(project.id) || ids.has(project.id)) throw new Error(`Invalid or duplicate project id: ${project.id}`);
  ids.add(project.id);
  for (const field of ['title', 'group', 'status', 'summary', 'role', 'context', 'contribution', 'note']) if (!project[field]) throw new Error(`Missing ${field} in ${project.id}`);
  for (const field of ['stack', 'details']) if (!Array.isArray(project[field]) || !project[field].length) throw new Error(`Missing ${field} in ${project.id}`);
  for (const field of ['url', 'altUrl']) if (project[field] && new URL(project[field]).protocol !== 'https:') throw new Error(`Use an HTTPS ${field} in ${project.id}`);
}
for (const project of projects) for (const id of project.related ?? []) if (!ids.has(id)) throw new Error(`Unknown related project ${id}`);

// Only regenerate this project's known output directory; never source or assets.
if (path.dirname(output) !== root || path.basename(output) !== 'dist' || fs.lstatSync(output, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('Unsafe output directory.');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.cpSync(path.join(root, 'public'), output, { recursive: true });
fs.copyFileSync(path.join(root, 'src/styles/main.css'), path.join(output, 'style.css'));
fs.copyFileSync(path.join(root, 'src/scripts/main.js'), path.join(output, 'script.js'));
fs.writeFileSync(path.join(output, 'index.html'), renderHome(projects, site));
fs.writeFileSync(path.join(output, '404.html'), renderNotFound(site));
for (const [route, html] of [['about', renderAbout(site)], ['projects', renderProjects(projects, site)]]) {
  fs.mkdirSync(path.join(output, route), { recursive: true });
  fs.writeFileSync(path.join(output, route, 'index.html'), html);
}
for (const project of projects) {
  const directory = path.join(output, 'projects', project.id);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), renderProject(project, projects, site));
}
const routes = ['/', '/about/', '/projects/', ...projects.map((project) => `/projects/${project.id}/`)];
fs.writeFileSync(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
fs.writeFileSync(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${escape(site.siteUrl + route)}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built portfolio and ${projects.length} case studies into dist/.`);
