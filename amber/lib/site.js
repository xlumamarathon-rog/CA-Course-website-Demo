'use client';
import { useMemo } from 'react';
import { useStored } from './storage';
import { HIRERS } from './data';

/* =========================================================
   SITE SETTINGS
   Everything the marketing layer on the homepage renders is
   driven from here, and the admin panel edits it. Stored on
   the device under tb.site, like the rest of the "backend".
   ========================================================= */

export const SITE_KEY = 'site';

export const DEFAULT_SITE = {
  announcement: {
    on: true,
    message: '30% off all combos',
    code: 'COMBO30',
    ctaLabel: 'Browse courses',
    ctaHref: '/courses',
    showCountdown: true
  },
  batch: {
    mode: 'auto',          // 'auto' = the upcoming 24th | 'fixed'
    date: ''               // YYYY-MM-DD, used when mode === 'fixed'
  },
  hero: {
    eyebrow: 'Practical finance training',
    headline: 'Learn the work,',
    rotate: ['theory.', 'textbook.', 'syllabus.'],
    lede: 'Masterclasses built from real engagement files by CAs who worked at KPMG, Deloitte and EY — so you walk into the job already knowing what week one looks like.',
    primaryLabel: 'Browse masterclasses',
    primaryHref: '/courses',
    secondaryLabel: 'Start free program',
    secondaryHref: '/course/placement'
  },
  ribbon: ['7-day refund', 'Lifetime access', 'Placement support included'],
  stats: [
    { value: 80000, suffix: '+', decimals: 0, label: 'Learners trained' },
    { value: 20000, suffix: '+', decimals: 0, label: 'Placements supported' },
    { value: 4.8,   suffix: '',  decimals: 1, label: 'Average rating' },
    { value: 30,    suffix: '+', decimals: 0, label: 'Masterclasses' }
  ],
  partners: { on: true, items: HIRERS.slice(), speed: 42 },
  sections: {
    stats: true,
    partners: true,
    flagship: true,
    howItWorks: true,
    freeAndTools: true,
    placements: true,
    testimonials: true,
    experts: true,
    closingCta: true
  },
  closing: {
    eyebrow: 'Enrolment closing',
    body: 'Enrol once and keep lifetime access, every future update, and placement support at no extra cost.',
    showCountdown: true,
    primaryLabel: 'Browse masterclasses',
    secondaryLabel: 'Talk to a counsellor'
  },
  motion: {
    reveals: true,       // fade-and-rise on scroll
    counters: true,      // animated stat counters
    marquee: true,       // scrolling partner ribbon
    rotator: true        // rotating word in the headline
  }
};

/* deep-merge stored values over the defaults so older saves keep working
   when new settings are added */
function merge(base, over) {
  if (!over || typeof over !== 'object') return base;
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  Object.keys(over).forEach(k => {
    const b = base ? base[k] : undefined;
    const o = over[k];
    out[k] = (b && typeof b === 'object' && !Array.isArray(b) && o && typeof o === 'object' && !Array.isArray(o))
      ? merge(b, o)
      : o;
  });
  return out;
}

export function useSite() {
  const [raw, setRaw, ready] = useStored(SITE_KEY, DEFAULT_SITE);
  const site = useMemo(() => merge(DEFAULT_SITE, raw), [raw]);

  return {
    site,
    ready,
    /* patch one group: update('hero', { headline: '...' }) */
    update: (group, patch) =>
      setRaw(prev => {
        const cur = merge(DEFAULT_SITE, prev);
        return Object.assign({}, cur, { [group]: Object.assign({}, cur[group], patch) });
      }),
    /* replace a whole group: set('ribbon', [...]) */
    set: (group, value) =>
      setRaw(prev => Object.assign({}, merge(DEFAULT_SITE, prev), { [group]: value })),
    reset: () => setRaw(DEFAULT_SITE)
  };
}

/* Batch date honouring the admin setting. */
export function resolveBatchDate(site, now = new Date()) {
  if (site && site.batch && site.batch.mode === 'fixed' && site.batch.date) {
    const d = new Date(site.batch.date + 'T09:00:00');
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(now.getFullYear(), now.getMonth(), 24, 9, 0, 0);
  if (d.getTime() <= now.getTime()) d.setMonth(d.getMonth() + 1);
  return d;
}
