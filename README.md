# Salman Ali Portfolio

A responsive charcoal, lime, and lavender portfolio with an edited portrait, 22 project and concept entries, individual case studies, project filters, GSAP motion, contact links, and a downloadable résumé.

## Pages

- `/`: introduction, four featured projects, services, contact.
- `/about/`: background, skills, experience, workflow, education, and résumé.
- `/projects/`: the full catalog with filters, contributions, status labels, and concepts.
- `/projects/<id>/`: each individual case study.

## Run locally

Use Node.js 20 or newer; Node.js 22 is recommended. There are no npm dependencies to install.

```sh
npm run build
npm run check
npm run preview
```

Open `http://127.0.0.1:4173`. `npm run dev` builds and starts the same preview. It does not watch files: rebuild after edits and refresh the browser. Set `PORT` if 4173 is already in use.

## Where to edit

| File or directory | Purpose |
| --- | --- |
| `src/site.json` | Name, title, description, email, professional links, public URL, portrait, résumé |
| `src/projects.json` | Project names, summaries, scope, technologies, contribution, status, related work, screenshots, live links |
| `src/templates/home.html` | Homepage hero, featured work, short introduction, services, and contact |
| `src/templates/about.html` | Dedicated About page, skills, experience, workflow, and education |
| `src/templates/header.html` and `footer.html` | Shared navigation and footer |
| `src/render.mjs` | Shared page structure, project cards, case studies, metadata |
| `src/styles/main.css` | Colors, layouts, typography, responsive rules |
| `src/scripts/main.js` | Navigation, project filters, email drafts, motion |
| `public/` | Portrait, real project screenshots, résumé, favicon, bundled GSAP |
| `scripts/` | Build, verification, local static server |
| `dist/` | Generated static website; deploy this directory and regenerate it after edits |

Project ids form the page URLs. Keep them unique and lowercase. The build validates required content and related-project ids. Do not edit generated HTML in `dist/`; it will be replaced during the next build.

## Deploy on Vercel

Import this folder or its Git repository. The included `vercel.json` selects the **Other** framework preset, runs `npm run build`, and publishes `dist`. Set `SITE_URL` to your final root domain, such as `https://salman.example`, for canonical links and sitemap URLs. If omitted, the build can use Vercel's supplied production/deployment domain.

## Deploy on Netlify

Import the repository. `netlify.toml` supplies the build command `npm run build`, publish directory `dist`, and Node.js 22. Set `SITE_URL` to your final root domain. Netlify's `URL` environment variable is used when `SITE_URL` is absent. For a manual drag-and-drop deployment, build locally and upload `dist`.

## Other static hosts

Build and upload the contents of `dist` to a host that serves directory index files. The website uses root-relative asset links and is intended for a root domain, not a repository subdirectory. Set `SITE_URL` before building. A custom 404 page is included.

Official references: [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build), [Vercel JSON settings](https://vercel.com/docs/project-configuration/vercel-json), [Netlify file-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/).

## Contact behavior and content accuracy

The contact form prepares a draft in the visitor's email application. It does not silently deliver messages or store enquiry data. The visitor sends the email. To add server-side delivery later, integrate a provider and update the form behavior and wording together.

Production websites, contributions, prototypes, proposed products, and related workflows have distinct status labels. Overlapping CRM, commerce, and parental-control entries link to each other. They are not a count of separately completed applications. Confirm private CRM feature completion and education progression before changing their status. No personal achievement metrics or testimonials were invented.

The supplied REVEX and AIPrognoza URLs were unavailable during the October 2026 review; their status notes describe that review, not a permanent availability claim. WorkdeskVA uses the confirmed URL `https://www.workdeskva.com/` and a public screenshot.

## Assets and external services

The portrait is a generative edit of the supplied photograph, styled with charcoal clothing/background and restrained lime lighting. Review facial details before professional reuse; generative editing cannot guarantee pixel-exact identity preservation. The website uses a compressed WebP version. Project screenshots are public-page captures, with no private CRM data.

GSAP 3.14.2 is bundled under `public/assets/vendor/`; its copyright/license header is preserved. See [GSAP's standard license](https://gsap.com/standard-license). Fonts are fetched from Google Fonts; system fallbacks remain available. No generated image prompt, original photograph, temporary scripts, credentials, Git history, or Sites settings are included in the portable export.

The included Vercel/Netlify settings are prepared for deployment. They have not been published to those accounts as part of this task.

