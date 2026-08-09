'use client';
import { seedCourses } from './store';
import { DEFAULT_SITE } from './site';
import { SCHEMA_VERSION } from './storage';
import { flatLessons, findCourse } from './data';

/* =========================================================
   SEED PRESETS
   One-click demo states. Each returns a complete database
   document, so loading one puts the whole app into a known
   condition — useful for rehearsing a walkthrough, and for
   resetting between two client meetings.
   ========================================================= */

const doc = (data) => ({ __v: SCHEMA_VERSION, updatedAt: new Date().toISOString(), data });

/* mark the first n lessons of a course complete */
function progressFor(courseId, n) {
  const c = findCourse(courseId);
  if (!c) return {};
  const total = flatLessons(c).length;
  const done = {};
  for (let i = 0; i < Math.min(n, total); i++) done[i] = true;
  return { done, last: Math.min(n, total - 1), sec: {} };
}

export const SEEDS = [
  {
    id: 'fresh',
    name: 'Fresh install',
    blurb: 'Six seed courses, nobody signed in, nothing bought. The state a first-time visitor sees.',
    build: () => doc({
      theme: 'navy',
      courses: seedCourses(),
      site: DEFAULT_SITE,
      purchases: {},
      progress: {},
      notes: {}
    })
  },
  {
    id: 'learner',
    name: 'Learner mid-course',
    blurb: 'Signed in as Priya, owns the Audit MasterClass, five lessons done, two notes saved. Best starting point for demoing the player.',
    build: () => doc({
      theme: 'navy',
      courses: seedCourses(),
      site: DEFAULT_SITE,
      user: { name: 'Priya Sharma', email: 'learner@ledgerline.in', role: 'user' },
      purchases: { 'learner@ledgerline.in': ['audit', 'placement'] },
      progress: { audit: progressFor('audit', 5), placement: progressFor('placement', 2) },
      notes: {
        audit: [
          { idx: 2, at: 184, text: 'Materiality drives the whole sampling plan — come back to this.', ts: Date.now() - 86400000 },
          { idx: 4, at: 42,  text: 'Ask about the revenue cut-off template in the next doubt session.', ts: Date.now() - 3600000 }
        ]
      }
    })
  },
  {
    id: 'admin',
    name: 'Admin with a draft',
    blurb: 'Signed in as the administrator, with an unpublished course waiting in the catalogue. Use this to demo publish → appears on the site.',
    build: () => {
      const courses = seedCourses();
      courses.unshift({
        id: 'transfer-pricing', title: 'Transfer Pricing MasterClass',
        tag: 'Defend a transfer pricing position end to end.',
        cat: 'flagship', badge: 'New',
        instructor: 'CA Sanat Goyal', exFirm: 'Ex-EY', initials: 'SG',
        price: 2999, mrp: 4284, hours: 12, templates: 7,
        rating: 4.8, reviews: 0, learners: 0,
        updated: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        level: 'Advanced', lang: 'English',
        outcomes: ['Build a defensible benchmarking study', 'Draft the local file without a consultant'],
        forWhom: ['CAs moving into transfer pricing'],
        sections: [{ title: 'Foundations', lectures: [
          { title: 'Why transfer pricing exists', dur: '08:30', type: 'video', src: '' },
          { title: 'The arm’s length principle', dur: '11:15', type: 'video', src: '' }
        ] }],
        published: false, lectures: 2
      });
      return doc({
        theme: 'navy',
        courses,
        site: DEFAULT_SITE,
        user: { name: 'Archit Agarwal', email: 'admin@ledgerline.in', role: 'admin' },
        purchases: { 'admin@ledgerline.in': [] },
        progress: {}, notes: {}
      });
    }
  },
  {
    id: 'busy',
    name: 'Busy platform',
    blurb: 'Three accounts with purchases and progress, so the admin dashboard and Students table show real numbers.',
    build: () => doc({
      theme: 'navy',
      courses: seedCourses(),
      site: DEFAULT_SITE,
      user: { name: 'Archit Agarwal', email: 'admin@ledgerline.in', role: 'admin' },
      purchases: {
        'learner@ledgerline.in': ['audit', 'excel', 'placement'],
        'student@ledgerline.in': ['tax', 'placement'],
        'admin@ledgerline.in': []
      },
      progress: {
        audit: progressFor('audit', 12),
        excel: progressFor('excel', 4),
        tax:   progressFor('tax', 9)
      },
      notes: {}
    })
  },
  {
    id: 'amber',
    name: 'Amber walkthrough',
    blurb: 'Same as the learner preset but in Direction A, for showing the amber build.',
    build: () => doc({
      theme: 'amber',
      courses: seedCourses(),
      site: DEFAULT_SITE,
      user: { name: 'Priya Sharma', email: 'learner@ledgerline.in', role: 'user' },
      purchases: { 'learner@ledgerline.in': ['audit'] },
      progress: { audit: progressFor('audit', 3) },
      notes: {}
    })
  }
];

export const findSeed = (id) => SEEDS.find(s => s.id === id) || null;
