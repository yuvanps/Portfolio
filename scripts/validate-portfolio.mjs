#!/usr/bin/env node
/**
 * Validates data/portfolio.json and the Markdown write-ups before a build.
 *
 *   npm run validate              offline checks (run automatically by `npm run build`)
 *   npm run validate -- --links   also request every public external URL
 *
 * Messages name the field that is wrong but never print private values.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = join(root, 'data', 'portfolio.json');
const contentDir = join(root, 'src', 'content', 'projects');
const publicDir = join(root, 'public');

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isStrList = (v) => Array.isArray(v) && v.every(isStr);
const isHttps = (v) => {
  try {
    return isStr(v) && new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
};
const DATE = /^(\d{4}(-\d{2}(-\d{2})?)?|present)$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let data;
try {
  data = JSON.parse(readFileSync(dataFile, 'utf8'));
} catch (err) {
  console.error(`✖ data/portfolio.json could not be read as JSON: ${err.message}`);
  process.exit(1);
}

// ---- person ----
const person = data.person ?? {};
if (!isStr(person.name)) fail('person.name is required');
if (!isStr(person.headline)) fail('person.headline is required');
if (!isStr(person.summary)) fail('person.summary is required');
if (person.email !== undefined && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(person.email)) fail('person.email is not an email address');
for (const key of ['github', 'linkedin']) {
  const url = person.links?.[key];
  if (url !== undefined && !isHttps(url)) fail(`person.links.${key} must be an https URL`);
}
if (person.phonePublic === true) {
  warn('person.phonePublic is true, but the site never renders the phone number (it is not in the public allowlist).');
}

// ---- images ----
// Image fields hold the browser URL path ("/images/…"), which maps to public/images/… on disk.
const IMAGE_TYPES = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.svg']);
const IMAGE_WARN_BYTES = 500 * 1024;

/** Returns true when the path is well-formed and the file exists. */
const imagePath = (where, src, { missing = fail } = {}) => {
  if (!isStr(src) || !src.startsWith('/') || src.startsWith('//')) {
    fail(`${where} must be a local path starting with "/" (e.g. "/images/…" for a file in public/images/), not a URL`);
    return false;
  }
  if (src.startsWith('/public/')) {
    fail(`${where} must not include "/public": use the URL path, e.g. "/images/…"`);
    return false;
  }
  if (!IMAGE_TYPES.has(extname(src).toLowerCase())) warn(`${where}: unusual image type "${extname(src)}" (use .webp, .jpg, .png, .avif or .svg)`);
  const file = join(publicDir, src);
  if (!existsSync(file)) {
    missing(`${where} points to a file that does not exist under public/`);
    return false;
  }
  if (statSync(file).size > IMAGE_WARN_BYTES) warn(`${where} is larger than 500 KB; resize or compress it (see docs/IMAGES.md)`);
  return true;
};

// The portrait path is pre-configured so the photo can simply be dropped in
// later; until the file exists this is a note, not an error.
if (person.portrait != null) {
  const present = imagePath('person.portrait', person.portrait, {
    missing: () => warn('person.portrait: file not added yet, so the hero renders without a portrait'),
  });
  if (present && !isStr(person.portraitAlt)) fail('person.portraitAlt is required when the portrait file exists');
}

// ---- projects ----
const projects = Array.isArray(data.projects) ? data.projects : [];
if (projects.length === 0) fail('projects must be a non-empty array');

const slugs = new Set();
projects.forEach((p, i) => {
  const at = isStr(p?.slug) ? `project "${p.slug}"` : `projects[${i}]`;
  if (!isStr(p.slug) || !SLUG.test(p.slug)) fail(`${at}: slug must be lowercase letters, digits and hyphens`);
  else if (slugs.has(p.slug)) fail(`${at}: duplicate slug`);
  else slugs.add(p.slug);

  if (!isStr(p.title)) fail(`${at}: title is required`);
  if (!isStr(p.description)) fail(`${at}: description is required`);
  if (!isStrList(p.tech ?? [])) fail(`${at}: tech must be a list of strings`);
  if (!isStrList(p.highlights ?? [])) fail(`${at}: highlights must be a list of strings`);
  if (!isStrList(p.categories ?? [])) fail(`${at}: categories must be a list of strings`);
  else if ((p.categories ?? []).length === 0) warn(`${at}: no categories, so it only appears under "All" in the archive filter`);
  if (p.featured !== undefined && typeof p.featured !== 'boolean') fail(`${at}: featured must be true or false`);
  for (const key of ['start', 'end']) {
    if (p[key] !== undefined && !DATE.test(String(p[key]))) fail(`${at}: ${key} must be YYYY, YYYY-MM, YYYY-MM-DD or "present"`);
  }

  const links = p.links ?? {};
  for (const key of Object.keys(links)) {
    if (!['repo', 'demo'].includes(key)) warn(`${at}: links.${key} is not a known link type (repo, demo) and is not rendered`);
    else if (links[key] !== null && !isHttps(links[key])) fail(`${at}: links.${key} must be an https URL (or be removed)`);
  }
  if (links.repo && p.repoVisibility !== 'public') {
    warn(`${at}: has links.repo but repoVisibility is not exactly "public", so the repository is not linked`);
  }

  if (p.image != null) {
    imagePath(`${at}: image`, p.image);
    if (!isStr(p.imageAlt)) fail(`${at}: imageAlt is required when image is set`);
    if (p.imagePosition !== undefined && !/^[a-z0-9% .-]+$/i.test(String(p.imagePosition))) fail(`${at}: imagePosition must be a CSS object-position value such as "center 30%"`);
  }
  if (p.gallery !== undefined) {
    if (!Array.isArray(p.gallery)) fail(`${at}: gallery must be a list`);
    else
      p.gallery.forEach((g, n) => {
        imagePath(`${at}: gallery[${n}].src`, g?.src);
        if (!isStr(g?.alt)) fail(`${at}: gallery[${n}].alt is required`);
      });
  }
});

const featured = projects.filter((p) => p.featured === true).length;
if (featured > 3) warn(`${featured} projects are featured; the homepage shows the first 3 in JSON order`);

// ---- other sections ----
for (const [section, nameKey] of [['experience', 'company'], ['leadership', 'org'], ['education', 'institution']]) {
  for (const [i, item] of (data[section] ?? []).entries()) {
    if (!isStr(item[nameKey])) fail(`${section}[${i}].${nameKey} is required`);
    for (const key of ['start', 'end']) {
      if (item[key] !== undefined && !DATE.test(String(item[key]))) fail(`${section}[${i}].${key} is not a valid date`);
    }
  }
}
for (const [i, job] of (data.experience ?? []).entries()) {
  if (!isStrList(job.relatedProjects ?? [])) fail(`experience[${i}].relatedProjects must be a list of project slugs`);
  else for (const slug of job.relatedProjects ?? []) if (!slugs.has(slug)) fail(`experience[${i}].relatedProjects: no project with slug "${slug}"`);
}
for (const [i, a] of (data.achievements ?? []).entries()) {
  if (!isStr(a.title)) fail(`achievements[${i}].title is required`);
  if (a.date !== undefined && !DATE.test(String(a.date))) fail(`achievements[${i}].date is not a valid date`);
}
for (const [group, items] of Object.entries(data.skills ?? {})) {
  if (!isStrList(items)) fail(`skills["${group}"] must be a list of strings`);
}

// ---- Markdown write-ups ----
const files = existsSync(contentDir) ? readdirSync(contentDir).filter((f) => f.endsWith('.md') && !f.startsWith('_')) : [];
for (const file of files) {
  const slug = file.slice(0, -3);
  if (!slugs.has(slug)) {
    fail(`src/content/projects/${file}: no project with slug "${slug}" in data/portfolio.json (rename the file or add the project)`);
    continue;
  }
  const text = readFileSync(join(contentDir, file), 'utf8');
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const declared = fm && /^slug:\s*["']?([^"'\s#]+)/m.exec(fm[1]);
  if (declared && declared[1] !== slug) fail(`src/content/projects/${file}: frontmatter slug does not match the filename`);
  // Local images referenced from Markdown must exist.
  for (const m of text.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)/g)) {
    imagePath(`src/content/projects/${file}: image ${m[1]}`, m[1]);
  }
}

// ---- optional: external links ----
if (process.argv.includes('--links')) {
  const urls = new Map();
  const add = (label, url) => isHttps(url) && urls.set(url, label);
  add('person.links.github', person.links?.github);
  add('person.links.linkedin', person.links?.linkedin);
  for (const p of projects) {
    if (p.repoVisibility === 'public') add(`project "${p.slug}" links.repo`, p.links?.repo);
    add(`project "${p.slug}" links.demo`, p.links?.demo);
  }
  await Promise.all(
    [...urls].map(async ([url, label]) => {
      try {
        const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(90_000) });
        if (res.status === 999 || res.status === 403 || res.status === 429) {
          warn(`${label}: the server refuses automated checks (HTTP ${res.status}); open it in a browser`);
        } else if (!res.ok) fail(`${label}: HTTP ${res.status}`);
        else if (new URL(res.url).pathname !== new URL(url).pathname) warn(`${label}: redirects elsewhere; update the URL`);
      } catch (err) {
        fail(`${label}: request failed (${err.name})`);
      }
    }),
  );
  console.log(`  checked ${urls.size} external URLs`);
}

// ---- report ----
for (const msg of warnings) console.warn(`⚠ ${msg}`);
if (errors.length > 0) {
  for (const msg of errors) console.error(`✖ ${msg}`);
  console.error(`\nValidation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`✔ portfolio data valid: ${projects.length} projects, ${files.length} write-up(s), ${warnings.length} warning(s)`);
