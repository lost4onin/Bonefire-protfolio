/**
 * Third-party assets used on the site, rendered on /credits (linked from every page's footer).
 * Keep in sync with docs/ASSETS.md → licence logs. CC BY needs: title, author, source, licence, changes.
 */

export type Credit = {
  what: string; // where it appears on the site
  title: string;
  author: string;
  authorUrl?: string;
  source?: string;
  licence: string;
  licenceUrl?: string;
  changes?: string;
};

export const credits: Credit[] = [
  {
    what: 'Bonfire 3D model (home page)',
    title: 'Dark Souls - Bonfire',
    author: 'UselessViking',
    authorUrl: 'https://sketchfab.com/UselessViking',
    source: 'https://sketchfab.com/3d-models/dark-souls-bonfire-b0d68c8f4cd0487da3d1fb8327ab1044',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    changes:
      'Materials converted to metal/rough, textures reduced to 512px, geometry compressed. Flames and sparks added in code.',
  },
  {
    what: 'Boss art (Hackathons) and ring art (Skills)',
    title: 'Dark Souls III',
    author: 'FromSoftware, Inc. / Bandai Namco Entertainment',
    licence:
      'All rights reserved by their owners. Used as non-commercial fan homage; no affiliation or endorsement.',
  },
  {
    what: 'Gauntlet cursor set',
    title: 'Fan-made gauntlet cursor pack',
    author: 'TODO(Akrem): author name',
    source: undefined, // TODO(Akrem): download page URL
    licence: 'Free to use, as stated by the author',
  },
];
