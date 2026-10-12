#!/usr/bin/env node
/**
 * Privacy and integrity check of the built site (dist/). Runs after `astro build`.
 *
 * Fails when generated output contains:
 *   - the phone number from data/portfolio.json (any spacing/punctuation)
 *   - the text of any `note` field
 *   - a repository URL, `repoVisibility` text or repo name of a non-public project
 *   - a local link, image or asset that does not exist in dist/
 *
 * Failure messages name the file and the rule, never the sensitive value.
 *
 * Limitations: this only knows the values present in data/portfolio.json. It
 * cannot detect private information typed into a Markdown write-up or a
 * component, text inside images or PDFs, or a reworded note. It does not
 * request external URLs (use `npm run validate -- --links`).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
if (!existsSync(dist)) {
  console.error('✖ dist/ does not exist. Run the build first.');
  process.exit(1);
}

const data = JSON.parse(readFileSync(join(root, 'data', 'portfolio.json'), 'utf8'));
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalise = (s) => s.replace(/\s+/g, ' ').toLowerCase();

/** Each rule: { rule, test(text) }. Rule names are safe to print. */
const rules = [];
const literal = (rule, value) => {
  const needle = normalise(value);
  if (needle.length >= 6) rules.push({ rule, test: (text) => text.includes(needle) });
};

// Phone: match the digits with any separators between them.
if (typeof data.person?.phone === 'string') {
  const digits = data.person.phone.replace(/\D/g, '');
  for (const d of new Set([digits, digits.slice(-10)])) {
    if (d.length >= 7) {
      const re = new RegExp(d.split('').join('[\\s().\\-]*'));
      rules.push({ rule: 'person.phone', test: (text) => re.test(text) });
    }
  }
}

// Every `note` field anywhere in the data.
(function walk(node, path) {
  if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`));
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      const here = path ? `${path}.${key}` : key;
      if (key === 'note' && typeof value === 'string') {
        literal(here, value);
        // Also catch a single sentence of the note being reused.
        for (const sentence of value.split(/(?<=[.!?])\s+/)) if (sentence.length >= 30) literal(here, sentence);
      } else walk(value, here);
    }
  }
})(data, '');

// Repositories that are not explicitly public.
for (const p of data.projects ?? []) {
  if (p.repoVisibility === 'public') continue;
  const at = `project "${p.slug}"`;
  if (typeof p.links?.repo === 'string') {
    const url = normalise(p.links.repo.replace(/\/+$/, ''));
    const re = new RegExp(`${escape(url)}(?![\\w.-])`);
    rules.push({ rule: `${at} non-public repository URL`, test: (text) => re.test(text) });
  }
  if (typeof p.repoVisibility === 'string') {
    literal(`${at} repoVisibility text`, p.repoVisibility);
    // Repo names listed inside the visibility text, e.g. "private repos (Name_A, Name_B)".
    for (const name of p.repoVisibility.match(/\b\w+_\w+\b/g) ?? []) literal(`${at} private repository name`, name);
  }
}

const files = [];
(function collect(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) collect(full);
    else files.push(full);
  }
})(dist);

const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.xml', '.txt', '.svg', '.map', '.webmanifest']);
const problems = [];

for (const file of files) {
  if (!TEXT.has(extname(file))) continue;
  const rel = relative(root, file);
  const raw = readFileSync(file, 'utf8');
  const text = normalise(raw);
  for (const { rule, test } of rules) {
    if (test(text)) problems.push(`${rel}: contains prohibited value (${rule})`);
  }

  // Local references must resolve to a file in dist/.
  if (extname(file) === '.html') {
    for (const m of raw.matchAll(/\s(?:href|src)="(\/[^"#?]*)/g)) {
      const target = decodeURI(m[1]);
      if (target.startsWith('//')) continue;
      const base = join(dist, target);
      const ok = target.endsWith('/') ? existsSync(join(base, 'index.html')) : existsSync(base);
      if (!ok) problems.push(`${rel}: broken local reference ${target}`);
    }
  }
}

if (problems.length > 0) {
  for (const p of [...new Set(problems)]) console.error(`✖ ${p}`);
  console.error(`\ndist/ check failed with ${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`✔ dist/ clean: ${files.length} files scanned against ${rules.length} privacy rules, local links resolve`);
