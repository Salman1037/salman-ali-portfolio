import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'src/projects.json'), 'utf8'));
const pages = ['index.html', 'about/index.html', 'projects/index.html', '404.html', ...projects.map((project) => `projects/${project.id}/index.html`)];
for (const page of pages) {
  const html = fs.readFileSync(path.join(output, page), 'utf8');
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) throw new Error(`Expected one main heading: ${page}`);
  if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error(`Unresolved template token: ${page}`);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)/g)) {
    let target = path.join(output, match[1].split('?')[0]);
    if (match[1].endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) throw new Error(`Missing local asset or route ${match[1]} in ${page}`);
  }
  for (const match of html.matchAll(/href="(\/[^"#]*)?#([^"\s]+)"/g)) {
    const route = match[1];
    const targetPage = route ? path.join(output, route, route.endsWith('/') ? 'index.html' : '') : path.join(output, page);
    const targetHtml = fs.readFileSync(targetPage, 'utf8');
    if (!targetHtml.includes(`id="${match[2]}"`)) throw new Error(`Missing anchor ${match[0]} in ${page}`);
  }
}
new Script(fs.readFileSync(path.join(root, 'src/scripts/main.js'), 'utf8'), { filename: 'main.js' });
console.log(`Verified ${pages.length} pages, ${projects.length} case studies, local assets, routes, template tokens, and browser JavaScript syntax.`);
