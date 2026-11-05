/**
 * Shared server-side helpers for the `relics` collection: /works, the Trial pages (/works/<slug>),
 * /cv and /lab all read relics through these, so they agree on order, art and missing facts.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { works } from '@/data/works';

export type Relic = CollectionEntry<'relics'>;

/** Published relics (no drafts), in their `order`. */
export async function getRelics(): Promise<Relic[]> {
  return (await getCollection('relics', ({ data }) => !data.draft)).sort(
    (a, b) => a.data.order - b.data.order,
  );
}

/** A frontmatter value still waiting for Akrem ("TODO …") counts as missing: it is never shown. */
export const known = (value?: string): string | undefined =>
  value && !/^\s*TODO\b/i.test(value) ? value : undefined;

const warned = new Set<string>();
/**
 * The relic's `image` if that file is really in public/ (served from the site root), else
 * undefined: the relic then shows its sigil instead of a broken image. Warns once per build.
 */
export function relicImage(relic: Relic): string | undefined {
  const { image } = relic.data;
  if (!image) return undefined;
  if (existsSync(join(process.cwd(), 'public', image))) return image;
  if (!warned.has(relic.id)) {
    warned.add(relic.id);
    console.warn(`[relics] ${relic.id}: ${image} is not in public/ yet, showing its sigil`);
  }
  return undefined;
}

/** The relic's links that exist (live site, source, demo), with their plain labels. */
export function relicLinks(relic: Relic): { href: string; label: string }[] {
  const keys = Object.keys(works.links.labels) as (keyof typeof works.links.labels)[];
  return keys
    .filter((k) => relic.data.links[k])
    .map((k) => ({ href: relic.data.links[k]!, label: works.links.labels[k] }));
}

export interface Chapter {
  id: string; // the heading's id, from Astro's Markdown (e.g. "the-foe")
  title: string; // the H2's text, e.g. "The Foe"
  html: string; // everything under it, up to the next H2
  empty: boolean; // nothing written yet (only TODO notes, which are stripped)
}

/**
 * Splits a relic's rendered case study at its H2s, so each chapter can carry its plain label and
 * chapters still empty can be left out. HTML comments (the TODO notes left for Akrem in the
 * Markdown) are dropped: they must never reach a visitor, not even in the page source.
 */
export function splitChapters(html: string): { intro: string; chapters: Chapter[] } {
  const parts = html.replace(/<!--[\s\S]*?-->/g, '').split(/(?=<h2[\s>])/);
  const intro = parts[0] && !parts[0].startsWith('<h2') ? parts.shift()!.trim() : '';
  const chapters = parts.map((part) => {
    const head = /^<h2([^>]*)>([\s\S]*?)<\/h2>/.exec(part)!;
    const body = part.slice(head[0].length).trim();
    return {
      id: /\bid="([^"]+)"/.exec(head[1] ?? '')?.[1] ?? '',
      title: (head[2] ?? '').replace(/<[^>]+>/g, '').trim(),
      html: body,
      empty: isEmpty(body),
    };
  });
  return { intro: isEmpty(intro) ? '' : intro, chapters };
}

/** No text and no media: only tags and whitespace left. */
const isEmpty = (html: string) =>
  !html.replace(/<[^>]+>/g, '').trim() && !/<(img|picture|video|iframe|table|svg)\b/i.test(html);
