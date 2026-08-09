/* =========================================================
   DEMO ACCOUNTS
   Shown on the sign-in page as one-click fill buttons.
   Nothing is verified against a server — this is a UI demo.
   ========================================================= */
export const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Admin',
    name: 'Archit Agarwal',
    email: 'admin@ledgerline.in',
    password: 'admin123',
    blurb: 'Full backend access — create courses, upload videos, see students',
    owns: []
  },
  {
    role: 'user',
    label: 'Learner — has purchased',
    name: 'Priya Sharma',
    email: 'learner@ledgerline.in',
    password: 'learner123',
    blurb: 'Already owns the Audit MasterClass — opens and plays straight away',
    owns: ['audit', 'placement']
  },
  {
    role: 'user',
    label: 'Learner — nothing purchased',
    name: 'Rahul Verma',
    email: 'student@ledgerline.in',
    password: 'student123',
    blurb: 'Clean account — use this to walk through the paywall and checkout',
    owns: []
  }
];

/* The public sign-in page advertises learner accounts only. The admin
   credential is shown on /admin/login and nowhere else. */
export const PUBLIC_ACCOUNTS = DEMO_ACCOUNTS.filter(a => a.role !== 'admin');
export const ADMIN_ACCOUNTS  = DEMO_ACCOUNTS.filter(a => a.role === 'admin');

export function findAccount(email, password) {
  const e = (email || '').trim().toLowerCase();
  const acc = DEMO_ACCOUNTS.find(a => a.email === e);
  if (!acc) return { error: 'No account found with that email. Use one of the demo logins below.' };
  if (acc.password !== password) return { error: 'Incorrect password for that account.' };
  return { account: acc };
}
