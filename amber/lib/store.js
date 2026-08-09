'use client';
import { useMemo } from 'react';
import { useStored, read, write, KEYS } from './storage';
import { COURSES as SEED } from './data';
import { DEMO_ACCOUNTS, findAccount } from './accounts';

/* =========================================================
   THE "BACKEND"
   Courses, accounts and purchases all live in device storage.
   The admin panel writes here; the public site reads from here.
   Replace this file with API calls and nothing else changes.
   ========================================================= */

const normalise = (c) => Object.assign({ published: true }, c);
export const seedCourses = () => SEED.map(normalise);

/* ---------------- COURSES (admin writes, site reads) ---------------- */
export function useCourses() {
  const [list, setList, ready] = useStored(KEYS.courses, seedCourses());

  const api = useMemo(() => ({
    all: list,
    published: list.filter(c => c.published !== false),
    get: (id) => list.find(c => c.id === id) || null,

    create: (course) => {
      const c = normalise(Object.assign({ createdAt: Date.now() }, course));
      setList(prev => [c].concat(prev.filter(x => x.id !== c.id)));
      return c;
    },
    update: (id, patch) => setList(prev => prev.map(c => (c.id === id ? Object.assign({}, c, patch) : c))),
    remove: (id) => setList(prev => prev.filter(c => c.id !== id)),
    togglePublish: (id) => setList(prev => prev.map(c => (c.id === id ? Object.assign({}, c, { published: c.published === false }) : c))),
    resetToSeed: () => setList(seedCourses())
  }), [list, setList]);

  return Object.assign(api, { ready });
}

/* Read courses outside React (used by the admin id-uniqueness check) */
export const readCourses = () => read(KEYS.courses, seedCourses());

/* ---------------- AUTH ---------------- */
export function useAuth() {
  const [user, setUser, ready] = useStored(KEYS.user, null);

  const login = (email, password) => {
    const res = findAccount(email, password);
    if (res.error) return res;
    const { account } = res;
    const u = { name: account.name, email: account.email, role: account.role };
    setUser(u);
    // give the demo account its pre-owned courses on first sign-in
    const all = read(KEYS.purchases, {});
    if (!all[u.email]) write(KEYS.purchases, Object.assign({}, all, { [u.email]: account.owns.slice() }));
    return { user: u };
  };

  const signup = ({ name, email }) => {
    const u = { name: name || (email || '').split('@')[0], email: (email || '').trim().toLowerCase(), role: 'user' };
    setUser(u);
    const all = read(KEYS.purchases, {});
    if (!all[u.email]) write(KEYS.purchases, Object.assign({}, all, { [u.email]: [] }));
    return { user: u };
  };

  return {
    user,
    ready,
    isAuthed: !!user,
    isAdmin: !!user && user.role === 'admin',
    login,
    signup,
    logout: () => setUser(null)
  };
}

/* ---------------- PURCHASES (per account) ---------------- */
export function usePurchases() {
  const { user, isAdmin } = useAuth();
  const [all, setAll, ready] = useStored(KEYS.purchases, {});
  const email = user ? user.email : null;
  const list = email ? (all[email] || []) : [];

  const purchase = (id) => {
    if (!email) return;
    setAll(prev => {
      const mine = prev[email] || [];
      if (mine.includes(id)) return prev;
      return Object.assign({}, prev, { [email]: mine.concat([id]) });
    });
  };

  const refund = (id) => {
    if (!email) return;
    setAll(prev => Object.assign({}, prev, { [email]: (prev[email] || []).filter(x => x !== id) }));
  };

  /* free courses count as owned once signed in; admins can open anything */
  const has = (course) => {
    if (!course) return false;
    if (isAdmin) return true;
    if (!email) return false;
    if (course.price === 0) return true;
    return list.includes(course.id);
  };

  return { list, all, purchase, refund, has, ready, email };
}

/* every account's purchases, for the admin students table */
export function useAllStudents() {
  const [all] = useStored(KEYS.purchases, {});
  const known = DEMO_ACCOUNTS.map(a => a.email);
  const emails = Object.keys(all).concat(known.filter(e => !Object.keys(all).includes(e)));
  return emails.map(email => {
    const acc = DEMO_ACCOUNTS.find(a => a.email === email);
    return {
      email,
      name: acc ? acc.name : email.split('@')[0],
      role: acc ? acc.role : 'user',
      courses: all[email] || []
    };
  });
}

/* ---------------- helpers for the editor ---------------- */
export const slugify = (s) => (s || '')
  .toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .slice(0, 40);

export function blankCourse() {
  return {
    id: '', title: '', tag: '', cat: 'flagship', badge: '',
    instructor: '', exFirm: '', initials: '',
    price: 2999, mrp: 4284, hours: 10, templates: 5,
    rating: 4.8, reviews: 0, learners: 0,
    updated: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    level: 'Intermediate', lang: 'English',
    intro: '', outcomes: [''], forWhom: [''],
    sections: [{ title: 'Section 1', lectures: [{ title: '', dur: '10:00', type: 'video', src: '' }] }],
    published: false
  };
}
