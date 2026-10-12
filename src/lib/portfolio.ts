/**
 * Public projection of data/portfolio.json.
 *
 * Components must import from this module, never from the raw JSON. Every
 * field that reaches the site is copied explicitly below (an allowlist), so
 * private values (phone number, `note` reminders, non-public repository
 * URLs, `repoVisibility` text) cannot leak by accident when the JSON grows.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { imageMetadata } from 'astro/assets/utils';
import raw from '../../data/portfolio.json';

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
  /** Intrinsic pixel size, read from the file so the browser can reserve space. */
  width?: number;
  height?: number;
  /** Optional CSS object-position for cropped slots (cards), e.g. "center 30%". */
  position?: string;
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  type?: string;
  featured: boolean;
  categories: string[];
  tech: string[];
  description: string;
  highlights: string[];
  period?: string;
  links: { repo?: string; demo?: string };
  image?: ProjectImage;
  gallery: ProjectImage[];
  /** Experience entries that list this project under `relatedProjects`. */
  relatedExperience: { company: string; role?: string }[];
}

type Raw = Record<string, any>;

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(str).filter((s): s is string => s !== undefined) : [];

const httpsUrl = (v: unknown): string | undefined => {
  const s = str(v);
  if (!s) return undefined;
  try {
    return new URL(s).protocol === 'https:' ? s : undefined;
  } catch {
    return undefined;
  }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-05" -> "May 2026", "2024-10-21" -> "21 Oct 2024", "present" -> "Present". */
export function formatDate(value: unknown): string | undefined {
  const s = str(value);
  if (!s) return undefined;
  if (s.toLowerCase() === 'present') return 'Present';
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(s);
  if (!m) return s;
  const [, y, mo, d] = m;
  const month = mo ? MONTHS[Number(mo) - 1] : undefined;
  return [d ? String(Number(d)) : undefined, month, y].filter(Boolean).join(' ');
}

export function formatPeriod(start: unknown, end: unknown): string | undefined {
  const a = formatDate(start);
  const b = formatDate(end);
  if (a && b) return `${a} – ${b}`;
  return a ?? b;
}

/**
 * Local images live in public/ and are referenced by their URL path, which is
 * the file path without the leading "public" (public/images/a.webp -> /images/a.webp).
 * An image whose file is missing, or that has no alt text, is treated as absent.
 */
async function image(src: unknown, alt: unknown, caption?: unknown, position?: unknown): Promise<ProjectImage | undefined> {
  const s = str(src);
  const a = str(alt);
  if (!s || !a || !s.startsWith('/')) return undefined;
  const file = join(process.cwd(), 'public', s);
  if (!existsSync(file)) return undefined;
  let size: { width?: number; height?: number } = {};
  try {
    const meta = await imageMetadata(readFileSync(file));
    size = { width: meta.width, height: meta.height };
  } catch {
    // Unknown format: render without intrinsic dimensions.
  }
  return { src: s, alt: a, caption: str(caption), position: str(position), ...size };
}

const data = raw as Raw;

async function project(p: Raw, i: number): Promise<Project> {
  // Only an explicit "public" marks a repository as linkable. Anything else
  // ("private…", "check before publishing", missing) means no link.
  const repoIsPublic = str(p.repoVisibility) === 'public';
  return {
    slug: String(p.slug),
    index: String(i + 1).padStart(2, '0'),
    title: String(p.title),
    type: str(p.type),
    featured: p.featured === true,
    categories: list(p.categories),
    tech: list(p.tech),
    description: str(p.description) ?? '',
    highlights: list(p.highlights),
    period: formatPeriod(p.start, p.end),
    links: {
      repo: repoIsPublic ? httpsUrl(p.links?.repo) : undefined,
      demo: httpsUrl(p.links?.demo),
    },
    image: await image(p.image, p.imageAlt, undefined, p.imagePosition),
    gallery: (
      await Promise.all((Array.isArray(p.gallery) ? p.gallery : []).map((g: Raw) => image(g?.src, g?.alt, g?.caption)))
    ).filter((g: ProjectImage | undefined): g is ProjectImage => g !== undefined),
    relatedExperience: (data.experience as Raw[])
      .filter((e) => list(e.relatedProjects).includes(String(p.slug)))
      .map((e) => ({ company: String(e.company), role: str(e.role) })),
  };
}

// Deliberately omitted: person.phone, person.phonePublic, person.handle,
// person.links.githubSecondary and every `note` field.
export const person = {
  name: String(data.person.name),
  location: str(data.person.location),
  email: str(data.person.email),
  headline: str(data.person.headline) ?? '',
  summary: str(data.person.summary) ?? '',
  interests: list(data.person.interests),
  links: {
    github: httpsUrl(data.person.links?.github),
    linkedin: httpsUrl(data.person.links?.linkedin),
  },
  /** Present only once the file exists (default: public/images/profile.webp). */
  portrait: await image(data.person.portrait, data.person.portraitAlt),
};

export const projects: Project[] = await Promise.all((data.projects as Raw[]).map(project));

/** How many featured projects the homepage shows (first N in JSON order). */
export const FEATURED_LIMIT = 3;
export const featuredProjects = projects.filter((p) => p.featured).slice(0, FEATURED_LIMIT);

/** Categories in first-seen order, for the archive filter. */
export const categories = [...new Set(projects.flatMap((p) => p.categories))];

export const experience = (data.experience as Raw[]).map((e) => ({
  company: String(e.company),
  role: str(e.role),
  period: formatPeriod(e.start, e.end),
  summary: str(e.summary),
  highlights: list(e.highlights),
  tech: list(e.tech),
  relatedProjects: list(e.relatedProjects)
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is Project => p !== undefined)
    .map((p) => ({ slug: p.slug, title: p.title })),
}));

export const skills = Object.entries(data.skills as Record<string, unknown>).map(([group, items]) => ({
  group,
  items: list(items),
}));

export const leadership = (data.leadership as Raw[]).map((l) => ({
  org: String(l.org),
  role: str(l.role),
  period: formatPeriod(l.start, l.end),
  highlights: list(l.highlights),
}));

export const achievements = (data.achievements as Raw[]).map((a) => ({
  title: String(a.title),
  where: str(a.where),
  date: formatDate(a.date),
  description: str(a.description),
}));

export const education = (data.education as Raw[]).map((e) => ({
  institution: String(e.institution),
  degree: str(e.degree),
  period: formatPeriod(e.start, e.end),
  cgpa: str(e.cgpa),
  coursework: list(e.coursework),
}));

/** The resume button appears only once public/resume.pdf actually exists. */
export const RESUME_PATH = '/resume.pdf';
export const hasResume = existsSync(join(process.cwd(), 'public', 'resume.pdf'));
