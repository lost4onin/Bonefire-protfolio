/**
 * Identity, links and the bonfire network (navigation).
 * Source: Akrem's CV (public/cv/akrem-medimagh-cv.pdf). Keep in sync with docs/CONTENT.md.
 */

export const site = {
  name: 'Akrem Medimagh',
  role: 'Software Engineering Student',
  roleLore: 'Keeper of the First Flame',
  tagline: 'AI, software and smart systems. Four-time hackathon victor.',
  school: 'INSAT — National Institute of Applied Sciences and Technology',
  location: 'Tunis, Tunisia',
  seeking: 'Seeking a summer 2026 internship',
  email: 'akrem.medimagh@gmail.com',
  // Phone deliberately NOT published on the site (spam). It stays in the PDF CV only.
  links: {
    github: 'https://github.com/lost4onin',
    linkedin: 'https://www.linkedin.com/in/akrem-medimagh-96495a32a',
    cv: '/cv/akrem-medimagh-cv.pdf',
  },
  summary:
    'Second-year engineering student with a multidisciplinary focus on AI, software development, and smart systems design. A multi-hackathon winner recognized across various engineering disciplines.',
} as const;

/**
 * Every section is a bonfire. Order = order in the Travel menu.
 * `lore` is one in-world line; `section` is the plain label recruiters read.
 */
export type Bonfire = {
  id: string;
  href: string;
  name: string; // in-world location name (title card)
  section: string; // plain label, always visible next to the lore name
  lore: string;
  hasScene3D: boolean;
};

export const bonfires: Bonfire[] = [
  {
    id: 'first-flame',
    href: '/',
    name: 'The First Flame',
    section: 'Home',
    lore: 'Where every journey begins.',
    hasScene3D: true,
  },
  {
    id: 'pilgrim',
    href: '/about',
    name: 'The Pilgrim',
    section: 'About',
    lore: 'Who keeps this flame, and why.',
    hasScene3D: false,
  },
  {
    id: 'works',
    href: '/works',
    name: 'Hall of Works',
    section: 'Projects',
    lore: 'Relics forged in past campaigns.',
    hasScene3D: true,
  },
  {
    id: 'victories',
    href: '/victories',
    name: 'Bosses Vanquished',
    section: 'Hackathons',
    lore: 'Four trials. Four victories.',
    hasScene3D: false,
  },
  {
    id: 'armoury',
    href: '/armoury',
    name: 'The Armoury',
    section: 'Skills',
    lore: 'Arms and disciplines, honed.',
    hasScene3D: false,
  },
  {
    id: 'post',
    href: '/contact',
    name: "The Messenger's Post",
    section: 'Contact',
    lore: 'Send word. Replies come swiftly.',
    hasScene3D: false,
  },
];

export const recruiterRoute = { href: '/cv', label: 'Skip the journey' } as const;
