# Image asset guide

Every image on the site is **optional**. The site builds and looks finished with none. This guide describes what the current components actually do with each image type, so you know what to shoot, export and name.

## One path convention

All images are local files under `public/images/`, committed to the repository. Astro copies `public/` into the built site unchanged, so the file path and the URL differ only by the leading `public`:

| What | Value |
| --- | --- |
| Filesystem path (where you save the file) | `public/images/profile.webp` |
| Browser URL path (what you write in JSON or Markdown) | `/images/profile.webp` |
| Local development URL | `http://localhost:4321/images/profile.webp` |
| Built output | `dist/images/profile.webp` |
| Production URL | the same `/images/profile.webp` path on whatever domain the site is deployed to |

Rules:

- In `data/portfolio.json` and in Markdown, always write the **URL path**: it starts with `/images/` and never contains `public`.
- Do not use external image URLs (`https://…`). The validator rejects them for JSON image fields.
- Paths are case-sensitive on Render and Vercel. Use lowercase names with hyphens: `ticket-booking-seat-map.webp`.
- The site is served from the domain root (`astro.config.mjs` sets no `base`), so root-relative paths work the same in development and production. Images do not depend on `SITE_URL`; that variable only controls canonical tags and the sitemap. If a `base` path is ever added (for example for GitHub Pages project sites), every `/images/…` and internal link would need that prefix, so revisit this guide first.

## Directory layout

```text
public/
  resume.pdf                          optional
  images/
    profile.webp                      portrait (optional)
    projects/
      <project-slug>/                 one folder per project, named exactly like its slug
        <project>-<subject>-<type>.webp   e.g. stepper-driver-pcb-3d-render.webp
```

Current contents:

```text
public/images/
  profile.webp
  projects/
    factory-patrol-drone/
      factory-drone-simulation-gazebo-overview.webp
    stepper-driver-pcb/
      stepper-driver-pcb-3d-render.webp
      stepper-driver-pcb-layout-2d.webp
      stepper-driver-schematic-tb6600-channel.webp
      stepper-driver-schematic-hopper-board-top-level.webp
    ticket-booking-system/
      ticket-booking-seat-map.webp
      ticket-booking-events-home.webp
```

The untouched PNG files these were converted from are kept in `image-originals/` at the repository root, under their original names. That folder is outside `public/`, so it is never deployed. Delete it once you are happy with the converted files, or keep it as your source archive.

Project slugs: `ticket-booking-system`, `nexcook-meal-maker`, `stepper-driver-pcb`, `esp32-s3-carrier-board`, `factory-patrol-drone`, `tinyml-keyword-spotting`, `cellular-network-simulation`, `bio-3d-printer`, `chocogenie`, `spectral-subtraction-matlab`, `generator-issue-detector`, `arduino-fm-radio`, `my-bot`.

Only the portrait has a fixed filename, because it is already configured in the JSON. Name project files in lowercase kebab-case as `project-subject-type.ext`, describing only what is visible: `ticket-booking-seat-map.webp`, not `screenshot2.png`. Which file is the cover is decided by the `"image"` field, not by the filename.

## Image types

### 1. Profile portrait

| | |
| --- | --- |
| Used by | Homepage hero only (`src/components/Hero.astro`) |
| Displayed at | 200 × 200 px beside the intro on screens ≥ 900 px; 96 × 96 px above the name on smaller screens |
| Crop | Square, `object-fit: cover`, centred. Keep your head and shoulders comfortably inside the frame. |
| Export | **800 × 800 px**, WebP (or JPEG), target **under 100 KB**. The current file is 389 × 387 px, which is just under 2× the display size; a higher-resolution original would look sharper on high-density screens. |
| File | `public/images/profile.webp` |
| Configured in | `person.portrait` (already set to `/images/profile.webp`) and `person.portraitAlt` |
| Alt text | `person.portraitAlt`, currently "Portrait of Yuvan Pramesh Selvarangam" |
| Required | No |
| If missing | The hero renders exactly as it does today: text only, no frame, no placeholder. The validator prints a reminder, not an error. |

To use a different filename or format (e.g. `.jpg`), change `person.portrait` to match.

### 2. Project cover (card thumbnail and detail-page cover)

One file serves both places.

| | |
| --- | --- |
| Used by | Project cards on the homepage and `/projects/` (`ProjectVisual.astro`), and the top of `/projects/<slug>/` (`ProjectLayout.astro`) |
| Displayed at | Cards: about 320–600 px wide. Detail page: up to about 870 px wide, never larger than the file's own width. |
| Crop | Cards crop to **16:9** with `object-fit: cover` (presentation only; the file is not modified). The detail page shows the **whole image at its natural aspect ratio**. |
| Export | Ideally **1600 px wide** at or near 16:9, WebP for photos, renders and screenshots, target **under 250 KB**. Other ratios work: a square image loses its top and bottom on cards but is shown in full on the detail page. |
| File | `public/images/projects/<slug>/<descriptive-name>.webp` |
| Configured in | `"image"` and `"imageAlt"` on the project in `data/portfolio.json`. Optional `"imagePosition"` (a CSS `object-position` value such as `"center 30%"`) chooses which part survives the card crop. |
| Alt text | `"imageAlt"` (required whenever `"image"` is set) |
| Required | No |
| If missing | Featured cards on the homepage show the designed grid placeholder with the project number. All other cards and the detail page show no image area at all. |

### 3. Project gallery

| | |
| --- | --- |
| Used by | "Gallery" section at the bottom of `/projects/<slug>/` (`ProjectGallery.astro`) |
| Displayed at | 4:3 tiles, about 300–620 px wide. The whole image is always visible (`object-fit: contain`, letterboxed on a plum background) and each tile links to the full-size file. |
| Crop | None. Any aspect ratio works; **4:3** fills the tile exactly, 16:9 leaves thin bars. |
| Export | **1600 px on the long edge** (e.g. 1600 × 1200), target **under 300 KB** each |
| File | `public/images/projects/<slug>/<descriptive-name>.webp` (or `.png`) |
| Configured in | `"gallery"` list on the project: `{ "src": "…", "alt": "…", "caption": "…" }`; `caption` is optional |
| Alt text | `alt` on each gallery item (required) |
| Required | No |
| If missing | No Gallery section is rendered. |

### 4. Inline images in a write-up

| | |
| --- | --- |
| Used by | The Markdown body of `src/content/projects/<slug>.md` |
| Displayed at | Full width of the text column, about 680 px, natural aspect ratio |
| Export | **1400 px wide**, any ratio; keep tall images under about 1400 px high. Target **under 250 KB**. |
| File | Same project folder, e.g. `public/images/projects/<slug>/<project>-architecture-diagram.svg` |
| Configured in | Markdown: `![Alt text](/images/projects/<slug>/<project>-architecture-diagram.svg)` |
| Alt text | The text in the square brackets |
| Required | No |
| If missing | Nothing is shown. If Markdown references a file that does not exist, validation fails and names the file. |

### Format by content

| Content | Format | Notes |
| --- | --- | --- |
| Hardware photographs | WebP (quality about 80) or JPEG | Plain, uncluttered background; even lighting |
| PCB renders (Altium 3D view) | WebP or PNG | Export at 2× then resize; dark or neutral background suits the site |
| PCB layouts and schematics | Lossless WebP or PNG, or SVG if exported as vector | Fine lines and text blur with lossy compression. For the existing layout and schematics, lossless WebP was 55–65% smaller than PNG with identical pixels. |
| Architecture and workflow diagrams | SVG preferred, else PNG | Use light lines and text on a transparent or dark background so they read on the dark page |
| Application and simulation screenshots | WebP (quality about 90) or PNG | Capture at 1600 × 900 or larger, then resize to 1600 wide. Check small text after converting. |
| Charts and test results | SVG or PNG | Include axis labels and units in the image |

The validator warns about any configured image over 500 KB and about unusual file extensions.

## Per-project status and suggestions

Use only real artefacts; do not substitute stock or generated images.

| Project | Has now | Still worth adding |
| --- | --- | --- |
| Ticket Booking System | Seat map (cover), events page | Booking confirmation, admin seat builder, organiser analytics, an architecture diagram |
| Stepper driver PCB | 3D render (cover), 2D layout, two schematic sheets | Assembled board photo if built |
| Factory patrol drone | Gazebo overview (cover) | Patrol trajectory, ROS 2 node graph, system architecture diagram |
| Nexcook meal maker | Nothing | Photo of the machine or control electronics and HMI screens, with client approval |
| ESP32-S3 carrier board | Nothing | Altium 3D render, layout view of the differential pairs, layer stack |
| TinyML keyword spotting | Nothing | A log-mel spectrogram of one clip, or a training-curve plot from your own run |
| Pneumatic Bio 3D Printer | Nothing | Photo of the printer, solenoid valve wiring, a printed test line |
| ChocoGenie | Nothing | Screenshot or photo of the LVGL UI |
| Cellular network simulation | Nothing | Scheduler comparison plots from your simulations |

## Add an image and preview it

1. Export the image to the size in the tables above.
2. Save it under `public/images/…` using the layout above. Create the project folder if needed.
3. Reference it:
   - Portrait: nothing to do if the file is `public/images/profile.webp`.
   - Cover: add `"image": "/images/projects/<slug>/<name>.webp"` and `"imageAlt": "…"` to the project in `data/portfolio.json`.
   - Gallery: add a `"gallery"` list to the project.
   - Inline: add `![alt](/images/projects/<slug>/file.webp)` to the project's Markdown file.
4. Run `npm run dev` and open `http://localhost:4321/`. To test the file on its own, open `http://localhost:4321/images/projects/<slug>/<name>.webp`.
5. Run `npm run build`. It validates that every configured file exists and has alt text, and that every local image reference in the built pages resolves.
6. Optionally run `npm run preview` to view the built `dist/` exactly as it will be served.

## How the image reaches production

Images are ordinary files in the Git repository. Commit the image together with the JSON or Markdown change and push. Render (or Vercel) runs the build, Astro copies `public/images/…` to `dist/images/…`, and the host serves `dist/`. The URL path is identical to the one used locally. No upload step, image host or environment variable is involved.

If an image works locally but not in production, check that the file was committed (`git status`) and that the letter case of the path matches the filename exactly.

## Writing alt text

Describe what the image shows and why it matters: "Top copper layer of the ESP32-S3 carrier board showing the USB differential pairs", not "PCB image". Do not start with "Image of". Keep it to one sentence.
