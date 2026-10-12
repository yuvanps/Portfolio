# Portfolio website: Yuvan Pramesh Selvarangam

Build a personal portfolio website. All content lives in `data/portfolio.json` (single source of truth) and a readable copy is in `data/portfolio.md`. Do not invent projects, metrics, dates or employers; if something is missing, leave a clearly marked placeholder or ask me.

## Audience
Recruiters and engineers hiring for embedded, firmware, hardware and systems-software roles (also software/cybersecurity). They skim, so the first screen must say who I am and show 3 featured projects.

## Suggested stack
- Static site: Astro (preferred) or Next.js with static export. No backend needed.
- Plain CSS or Tailwind. Light/dark support is optional.
- Deployable to GitHub Pages or Vercel. Add the deploy config once the site works.
- Load data from `data/portfolio.json` so I can edit content without touching components.

## Pages / sections
1. **Hero**: name, headline, one-line summary, links (GitHub, LinkedIn, email), "Download resume" button (I will drop a PDF into `public/`).
2. **Featured projects**: cards for projects with `"featured": true`. Show tech tags and 2-3 highlights.
3. **All projects**: filterable by tech (C/C++, Embedded, PCB, Robotics, Software). Individual project pages or expandable cards using `slug`.
4. **Experience**: Towardz Solutions internship.
5. **Skills**: grouped as in `skills`.
6. **Leadership and achievements**: HumanoidX, InnovDrive, Linux Club, NetSim hackathon win, Nokia events.
7. **Education**: VIT, CGPA, coursework.
8. **Contact**: email and social links. No contact form.

## Rules about the data
- `phonePublic` is false: do NOT show the phone number anywhere on the site.
- Respect `repoVisibility`. Never link private repos; for those projects show the write-up only.
- Fields named `note` are my reminders to myself. Do not render them; list them to me as open questions instead.
- Projects with empty `highlights` should render as compact cards, not padded with invented detail.

## Style
- Clean, fast, accessible (semantic HTML, alt text, keyboard navigation, good contrast).
- My resumes are black-and-white; a restrained, mostly monochrome look suits me. Propose a design before polishing.
- Project images: none yet. Use a tasteful placeholder and tell me which projects need photos or PCB renders.

## Working agreement
- Start with a short plan and the folder structure, then build the hero and featured projects first so I can review.
- Keep commits small and descriptive.
- Run the build and a Lighthouse check before calling it done.
