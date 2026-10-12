# Portfolio website

Static portfolio site for Yuvan Pramesh Selvarangam, built with [Astro](https://astro.build), plain CSS and no client-side framework.

- **Content** lives in `data/portfolio.json` (structured data) and `src/content/projects/*.md` (optional long-form project write-ups).
- **Design** is the "Plum Midnight" token set in `src/styles/tokens.css`.
- **Output** is plain static HTML in `dist/`. There is no backend, CMS or database.

## Requirements

- Node.js 22.12 or newer (`.node-version` pins 24 for hosts that read it)
- npm (the repository uses `package-lock.json`; do not add a yarn or pnpm lockfile)

## Run locally

```bash
npm ci            # install exactly what the lockfile says (use `npm install` after changing dependencies)
npm run dev       # dev server on http://localhost:4321
npm run build     # validate data, build to dist/, then scan dist/ for private data
npm run preview   # serve the built dist/ locally
```

| Command | What it does |
| --- | --- |
| `npm run validate` | Checks `data/portfolio.json` and the Markdown write-ups (slugs, dates, URLs, image paths) |
| `npm run validate -- --links` | The same, plus an HTTP request to every public external URL |
| `npm run check:dist` | Scans the built `dist/` for private values and broken local links |
| `npm run build` | `validate` → `astro build` → `check:dist`; any failure stops the build |

## Where things are

```text
data/portfolio.json            all structured content (single source of truth)
data/portfolio.md              human-readable copy of the data; not used by the site, update by hand
src/lib/portfolio.ts           public allowlist: the only module components read data from
src/content/projects/<slug>.md optional write-up for one project
src/content.config.ts          schema for write-up frontmatter
src/components/                reusable sections and cards
src/layouts/                   BaseLayout (head, header, footer) and ProjectLayout (detail page)
src/pages/                     index, projects/index, projects/[slug], 404, robots.txt
src/styles/                    tokens.css (design tokens), global.css, components.css
public/                        files served as-is (favicon, resume.pdf, images/)
docs/IMAGES.md                 image sizes, formats, filenames and the path convention
image-originals/               untouched source PNGs of converted images; not deployed
scripts/                       validate-portfolio.mjs, check-dist.mjs
```

## Editing content

### Add or update a project

Edit the `projects` array in `data/portfolio.json`. The order of the array is the order on the site.

```json
{
  "slug": "my-project",
  "categories": ["Embedded", "PCB"],
  "title": "My Project",
  "type": "Personal project",
  "start": "2026-01",
  "end": "present",
  "featured": false,
  "tech": ["ESP32", "FreeRTOS"],
  "description": "One factual sentence.",
  "highlights": ["Optional bullet.", "Another bullet."],
  "links": {
    "repo": "https://github.com/user/repo",
    "demo": "https://example.org/"
  },
  "repoVisibility": "public",
  "image": "/images/projects/my-project/cover.jpg",
  "imageAlt": "Assembled board on the bench",
  "gallery": [
    { "src": "/images/projects/my-project/layout.png", "alt": "Top copper layer", "caption": "Optional caption" }
  ]
}
```

Required: `slug` (lowercase, digits, hyphens; unique), `title`, `description`. Everything else is optional. A project with empty `highlights` renders as a compact card. Every project automatically gets a page at `/projects/<slug>/`.

`categories` drive the filter on `/projects/`. A new category name appears as a new filter button automatically.

### Feature or unfeature a project

Set `"featured": true` or remove it. The homepage shows the **first three** featured projects in JSON order (`FEATURED_LIMIT` in `src/lib/portfolio.ts`); the rest appear in the archive.

### Add a repository or live-demo link

- `links.demo`: any `https` URL. It appears as a **Live demo** button on the card and the detail page. Remove the field if the demo goes offline.
- `links.repo`: shown **only** when `repoVisibility` is exactly `"public"`. Any other value (`"private - do not link"`, `"check before publishing"`, or no value) keeps the repository unlinked, and `check:dist` fails the build if that URL appears anywhere in the output.

### Write or expand a project write-up

The detail page for a project is controlled by two files:

1. its entry in `data/portfolio.json` (title, summary, highlights, facts, links, images), and
2. the optional `src/content/projects/<slug>.md` (long-form body).

To add a write-up, copy `src/content/projects/_template.md` to `<slug>.md`, where `<slug>` equals the project's slug, and write Markdown. Use `##` for sections and `###` below that. Use only the sections that have real content, in whatever order suits the project; nothing is rendered for headings you leave out. Tables, code blocks and images work.

Frontmatter (all optional): `slug` (checked against the filename), `summary` (meta description), `draft: true` (hide while drafting).

A project with no Markdown file still gets a page built from its JSON entry. Do not copy the JSON description into the Markdown; the page already shows it.

### Add images

Images are optional everywhere. The full specification (sizes, formats, filenames, per-project suggestions) is in [`docs/IMAGES.md`](docs/IMAGES.md). In short:

1. Save the file under `public/images/…` and reference it by its URL path, which is the same path without `public`: `public/images/projects/my-project/my-project-board-photo.webp` → `/images/projects/my-project/my-project-board-photo.webp`.
2. Choose where it appears:
   - **Portrait** (homepage hero, square): save as `public/images/profile.webp`, ideally 800 × 800 px. It is already configured in `person.portrait`; alt text is `person.portraitAlt`.
   - **Cover**: `"image"` and `"imageAlt"` on the project. Cards crop it to 16:9; the detail page shows the whole image. Optional `"imagePosition"` (e.g. `"center 30%"`) adjusts the card crop.
   - **Gallery** (4:3 tiles at the bottom of the detail page, each linking to the full image): the `"gallery"` list, each item with `src`, `alt` and optional `caption`.
   - **Inline** in a write-up: `![Describe what the image shows](/images/projects/my-project/scope.png)`.
3. Alt text is required. Validation fails if a configured project image is missing its file or alt text. A missing portrait file is only a reminder, and the hero renders without it.

### Resume

Drop the PDF at `public/resume.pdf`. The **Download resume** button appears on the next build and is absent until then.

### Link an experience entry to a project

Add `"relatedProjects": ["<project-slug>"]` to an entry in `experience`. The experience card then links to the project, and the project page shows a "Related experience" link back. Keep the two descriptions distinct rather than copying text between them.

### Other sections

Achievements accept `title`, `where`, `date` and an optional one-sentence `description`.

`person`, `experience`, `skills`, `leadership`, `achievements` and `education` are rendered from the same JSON. To expose a field that is not shown yet, add it to `src/lib/portfolio.ts` first; components never read the raw JSON.

## Privacy checks

- `src/lib/portfolio.ts` copies only approved fields. The phone number, `handle`, every `note` field and `repoVisibility` text are never read by any component, and no raw JSON is shipped to the browser.
- `npm run check:dist` then scans every text file in `dist/` for: the phone number (with any spacing or punctuation), the text of every `note`, the URL of every non-public repository, `repoVisibility` text and the private repository names it lists. Messages name the file and rule, never the value.

Limitations: the scan only knows values that are in `data/portfolio.json`. It cannot catch private details typed directly into a Markdown write-up or component, text inside images or PDFs (including the resume), or a note that has been reworded. Review those by eye.

## SEO and the site URL

Canonical URLs, `og:url`, `sitemap-index.xml` and the `Sitemap:` line in `robots.txt` need the real public address, so they are generated only when the `SITE_URL` environment variable is set at build time:

```bash
SITE_URL=https://your-site.example npm run build
```

Set it in the host's dashboard once the address is known. Without it the site builds and works normally.

## Git workflow

The repository already has a remote (`origin`). After checking the site locally:

```bash
git status
git add -A
git commit -m "Build portfolio site with Astro"
git push origin main
```

`node_modules/`, `dist/` and `.astro/` are ignored and must stay out of version control.

## Deploy to Render (primary)

This is a static site: use a **Static Site**, not a Web Service, and no start command. Reference: <https://render.com/docs/deploy-astro>.

1. Commit and push to the Git repository.
2. Sign in to Render and choose **New → Static Site**.
3. Connect GitHub and select this repository and the `main` branch.
4. **Build Command:** `npm ci && npm run build`
5. **Publish Directory:** `dist`
6. Optional environment variables: `NODE_VERSION` (e.g. `24`, only if the build log shows a Node version older than 22.12) and `SITE_URL` (the `https://….onrender.com` address or your custom domain, once known; redeploy after setting it).
7. Create the site, wait for the deploy to finish, then open the assigned URL and check the homepage, `/projects/`, a few detail pages, images and external links.

**Updates:** edit `data/portfolio.json`, a Markdown file or assets → `npm run build` locally → commit → push. Render rebuilds and publishes automatically on every push to the connected branch.

**Logs and failed builds:** open the site in the Render dashboard → **Events** (or **Logs**) → select the deploy. A failed build leaves the previous version live. Fix the cause (the log shows the same `✖` messages as a local `npm run build`), push again, or use **Manual Deploy → Clear build cache & deploy**. To go back, redeploy an earlier commit from the Events list.

**Custom domain:** site → **Settings → Custom Domains → Add Custom Domain**, then create the DNS records Render shows at your registrar and wait for verification (TLS is issued automatically). Afterwards set `SITE_URL` to the new domain and redeploy.

## Deploy to Vercel (alternative)

Reference: <https://docs.astro.build/en/guides/deploy/vercel/>. No adapter is needed for a static build.

1. Push the repository to GitHub.
2. In Vercel choose **Add New → Project** and import the repository.
3. Vercel detects Astro. Confirm **Build Command** `npm run build` and **Output Directory** `dist`.
4. Deploy and check the resulting URL. Optionally set `SITE_URL` under **Settings → Environment Variables** and redeploy.

Pushes to the production branch trigger a production deployment; other branches and pull requests get preview deployments for checking changes first.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `npm: command not found` or `Node.js vXX is not supported by Astro` | Install Node 22.12+ (which includes npm). On Render set `NODE_VERSION`. |
| `npm ci` fails: lockfile out of sync | Run `npm install` locally and commit the updated `package-lock.json`. |
| `✖ project "x": …` during build | `data/portfolio.json` failed validation; the message names the field. |
| `✖ src/content/projects/x.md: no project with slug` | The Markdown filename must equal a project `slug`. |
| `✖ … points to a file that does not exist under public/` | Image path typo or the file was not committed. Paths are case-sensitive on Render and Vercel. |
| `✖ dist/…: contains prohibited value (…)` | A private value reached the output. Remove it from the named page's source; do not weaken the check. |
| `✖ dist/…: broken local reference` | A link or image in a write-up points to a page or file that does not exist. |
| Image shows locally but not after deploy | The file was not committed, or the path's letter case differs from the filename. |
| Repository button missing | `repoVisibility` is not exactly `"public"`. |
| Resume button missing | `public/resume.pdf` does not exist (exact name). |
| Site deploys but shows a directory listing or 404 | Publish/Output directory is not `dist`. |
| No sitemap or canonical tags | `SITE_URL` is not set for the build. |
