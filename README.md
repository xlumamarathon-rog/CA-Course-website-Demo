# Ledgerline — functional client demo

A complete, clickable finance-course platform with a working **admin backend**, built in
**Next.js 15 (App Router)**. No server, no database: courses, accounts, purchases and progress
all live in **device storage** (`localStorage`).

Both approved design directions ship in the same build. A bar at the top of every page switches
the whole site — admin panel included — between **Direction A (Amber)** and **Direction B (Navy)**,
so the client can compare them live and pick one.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

> Course pages resolve at runtime from device storage, so a course created in the admin panel gets
> a working URL immediately. That needs a Next server rather than a static export — which is why
> `output: 'export'` is **not** set. Deploy to Vercel, or any host that runs Node.

---

## The 60-second demo script

1. Open `/` — homepage in Navy. Click **A · Amber** in the top bar; the entire site reskins.
2. Click any course → **Enrol now**. You are not signed in, so it routes to sign-in.
3. On `/login`, under the button, click **Learner — nothing purchased**. Email and password fill in. Sign in.
4. You land back on checkout. Card details are already filled. Apply coupon **`COMBO30`** → 30% comes off.
   **Pay** → success screen.
5. **Start lesson 1** → the player opens. Press play; let it finish → it auto-advances to the next
   chapter with a countdown ring. Take a note; it saves with a timestamp.
6. Go to `/login`, sign out, click **Admin**, sign in. You land on `/admin`.
7. **New course** → give it a title, add a section and a lesson, **Upload video** (pick any mp4),
   → **Publish**.
8. Click **View on site** — it is in the catalogue, buyable, and the uploaded video plays in the player.
9. Back in admin → **Students** shows the learner account and what they bought.

---

## Pages

**Public site**

| Route | What it does |
|---|---|
| `/` | Homepage — hero, hiring logos, live course grid, how-it-works, placements, testimonials, instructors |
| `/courses` | Catalogue with working category filters, live search, 4-way sort. Shows published courses only |
| `/course/[id]` | Sales page — sticky buy card, outcomes, curriculum accordion, instructor, FAQ, mobile buy bar |
| `/learn/[id]` | **Course player** — gated: must be signed in *and* own the course |
| `/checkout/[id]` | Pre-filled details and card, working coupon, GST breakdown → records the purchase |
| `/dashboard` | My Learning — progress per course, resume, notes, device-storage inspector |
| `/jobs` `/about` `/contact` `/login` | Job board, company, counsellor form, sign-in with one-click demo credentials |
| `404` | Branded — keeps the header, footer and type |

**Admin backend** (`admin@ledgerline.in` only)

| Route | What it does |
|---|---|
| `/admin` | Dashboard — courses, lessons, total runtime, accounts, revenue booked, recent courses table |
| `/admin/courses` | Table of every course. Filter live/draft, search, **click the status pill to publish or unpublish**, edit, delete |
| `/admin/courses/new` | Create a course |
| `/admin/courses/[id]` | Edit a course — Details / Curriculum / Marketing copy, with a live card preview |
| `/admin/students` | Every account, role, courses owned, spend, and lessons completed |

Non-admins hitting `/admin` get a proper access-denied screen with the admin credentials shown.

---

## Accounts

Listed on the sign-in page as clickable cards — **clicking one fills the email and password**.

| Role | Email | Password | Starting state |
|---|---|---|---|
| Admin | `admin@ledgerline.in` | `admin123` | Full backend; can preview any course |
| Learner | `learner@ledgerline.in` | `learner123` | Already owns Audit MasterClass + Placement Program |
| Learner | `student@ledgerline.in` | `student123` | Owns nothing — use this to demo the paywall |

Sign-up also works and creates a fresh local learner. Edit the list in `lib/accounts.js`.

**Access rules** (`usePurchases().has(course)` in `lib/store.js`)

- Not signed in → the player shows a "Sign in to start learning" gate that returns you to the lesson afterwards
- Signed in, course not owned, price > 0 → a "You do not own this course yet" gate with the price and a Buy button
- Price 0 → unlocked for any signed-in account
- Admin → can open anything, for previewing

---

## The course player (`/learn/[id]`)

Modelled on Udemy, built from scratch — no video library.

**Playback** — real HTML5 `<video>` with custom controls: play/pause, scrub-to-seek, ±10s, speed
(1× → 2×), fullscreen. Keyboard: `space`/`k`, `←`/`→`, `n` next, `f` fullscreen.

**Next chapter** — on lesson end the lesson is marked complete, then an **"Up next" overlay** appears
with a 5-second countdown ring and auto-advances ("Play next now" / "Stay here" both work). A permanent
**"Next chapter" strip sits directly below the player** with the next lesson's title, section, duration
and Next/Previous buttons. The last lesson switches to a course-complete state.

**Around it** — curriculum sidebar (collapsible sections, completion checkboxes, current lesson
highlighted, click to jump), live progress bar, and tabs for **Overview**, **Notes** (timestamped,
per course, deletable), **Resources**, **Q&A**.

**Video sources**, in order of precedence:

1. `lesson.src` — set per lesson in the admin curriculum editor (paste a URL, or upload a file)
2. `VID` in `lib/data.js` — the fallback sample used by the seed courses
3. Simulated playback — if the media can't load, or the lesson is a `quiz`/`file` type, the stage
   runs a timed simulation so the demo never dead-ends. Auto-advance still fires.

> Uploads use `URL.createObjectURL`, so an uploaded file **plays immediately in that session** but
> does not survive a reload — there is no storage backend to put it in. Paste a hosted URL
> (Bunny, Cloudflare Stream, S3 + CloudFront) for anything permanent.

---

## Device storage

Namespaced `tb.` so nothing collides. See `lib/storage.js` (primitives) and `lib/store.js` (domain).

| Key | Shape | Holds |
|---|---|---|
| `tb.theme` | `"amber" \| "navy"` | Chosen design direction |
| `tb.courses` | `Course[]` | **The catalogue the admin panel edits and the site reads** |
| `tb.purchases` | `{ "learner@x.in": ["audit"] }` | Purchases per account |
| `tb.user` | `{ name, email, role }` | Current session |
| `tb.progress` | `{ audit: { done:{3:true}, last:3, sec:{3:128} } }` | Completed lessons, last lesson, watch position |
| `tb.notes` | `{ audit: [{ idx, at, text, ts }] }` | Timestamped lesson notes |

**API**

```js
import { useCourses, useAuth, usePurchases, useAllStudents } from '@/lib/store';
import { useProgress, useNotes, dumpAll, clearAll } from '@/lib/storage';

const courses = useCourses();              // .all .published .get(id) .create .update .remove .togglePublish
const { user, isAdmin, login, signup, logout } = useAuth();
const { has, purchase, refund } = usePurchases();
const { done, doneCount, markDone, setLast } = useProgress('audit');
```

- SSR-safe — every read is guarded, so the build never touches `window`
- Hydration-safe — hooks start from the fallback and fill in from the device after mount
- Writes broadcast a `tb:change` event, so every component on that key updates instantly
- `/dashboard` has a **Show stored data** panel and a **Reset this device** button; `/admin` has
  **Reset catalogue** to restore the six seed courses

**Going real:** replace `lib/store.js` with API calls. No component changes.

---

## Design system

`app/globals.css` implements the approved spec.

- **Neutrals** carry ~92% of the page: `#FFFFFF` canvas, `#F7F7F8` surface, `#E3E3E6` border,
  `#6E6E73` muted, `#1D1D1F` ink, `#111113` dark band
- **Accent** is one variable set swapped by `[data-theme]` on `<html>`:
  - Amber `#F0A81C` — fills only, always with **ink** labels (white on amber is 2.03:1 and fails);
    `#8A5D00` for gold text
  - Navy `#103A66` — works as fill *and* text at AAA both ways
- **Type**: Inter only (400/500/600/700). Prices and stats use `font-variant-numeric: tabular-nums`
- **Spacing**: 8pt scale `--s1`…`--s9`; 1200px container; 68ch measure; form fields capped at 440px
- **Elevation**: 1px borders first; shadows only on hover and overlays
- Respects `prefers-reduced-motion`; focus rings never removed

No flash of the wrong accent: an inline script in `app/layout.jsx` reads `tb.theme` before first paint.

---

## Structure

```
app/
  layout.jsx                 shell: fonts, theme boot script, demo bar, nav
  globals.css                the whole design system
  page.jsx                   homepage
  courses/                   catalogue
  course/[id]/               sales page
  learn/[id]/                player route (gated)
  checkout/[id]/             checkout route (gated)
  dashboard, jobs, about, contact, login, not-found
  admin/
    page.jsx                 dashboard
    courses/page.jsx         course table
    courses/new/page.jsx     create
    courses/[id]/page.jsx    edit
    students/page.jsx        accounts
components/
  Player.jsx                 the course player
  CourseEditor.jsx           admin course + curriculum editor with upload
  AdminShell.jsx             admin layout + role guard
  Checkout.jsx               checkout, pre-filled card, coupon, success
  Gate.jsx                   sign-in / purchase gates
  Nav, Footer, DemoBar, CourseCard, BuyCard, MobileBuyBar, Accordion, Faq, Thumb, Stars
lib/
  data.js                    seed courses, alumni, jobs, FAQs + helpers
  store.js                   courses CRUD, auth, purchases  ← swap for an API
  storage.js                 device-storage primitives
  accounts.js                demo credentials
  theme.jsx                  theme context + pre-paint script
```

Thumbnails are drawn in CSS (`components/Thumb.jsx`) rather than loaded as images — a demo with
broken image links is worse than no images. Swap for `next/image` when real artwork exists.

---

---

## Three deployable builds

The repository holds the same product three ways. Pick per audience.

| Folder | Build | Deploy when |
|---|---|---|
| **`/`** (root) | Both directions, with a live A/B toggle bar | Presenting to the client so they can compare and choose |
| **`/amber`** | Locked to Direction A — Amber `#F0A81C` | The chosen direction is amber; a clean client-facing URL |
| **`/navy`** | Locked to Direction B — Navy `#103A66` | The chosen direction is navy; a clean client-facing URL |

The two locked folders drop the demo bar entirely, hard-set `data-theme` on `<html>`, and set
`--demo-h: 0px` so the nav sits at the top. Everything else — pages, admin backend, player,
device storage — is identical.

### Hosting both on Vercel

Two projects from one repository, distinguished only by **Root Directory**:

| | Project 1 | Project 2 |
|---|---|---|
| Repository | `CA-Course-website-Demo` | `CA-Course-website-Demo` |
| **Root Directory** | `amber` | `navy` |
| Suggested name | `ca-course-amber` | `ca-course-navy` |
| Result | `ca-course-amber.vercel.app` | `ca-course-navy.vercel.app` |

Steps for each: [vercel.com/new](https://vercel.com/new) → import the repo → expand
**Root Directory** → choose the folder → Deploy. Framework auto-detects as Next.js and there are
no environment variables. About 90 seconds per project.

To also host the switchable build, add a third project and leave Root Directory at the repo root.

### A note on the duplication

`amber/` and `navy/` are full copies, so a change to a shared component has to be applied in both
(plus the root). That is the tradeoff for two independent URLs with no toggle bar in front of the
client. Once a direction is chosen, delete the other two and promote the winner to the root.

## Demo stubs — not production

1. **Payment** — `Checkout` records the purchase locally. Wire Razorpay/Stripe in `pay()`.
2. **Auth** — passwords are compared against `lib/accounts.js` in the browser. Replace with
   NextAuth/Clerk and move the role check server-side. **The admin guard is client-side only.**
3. **Video hosting** — uploads are session-only blob URLs; no transcoding, no CDN.
4. **Forms** — Contact, Q&A and newsletter show success states without sending.
5. **Downloads** — resource buttons are inert.
6. **Certificates** — described in copy, not generated.

## Before going live

- [ ] Remove `<DemoBar />` from `app/layout.jsx` and hard-set one `data-theme`
- [ ] Move auth, roles and the admin guard to the server; delete `lib/accounts.js`
- [ ] Replace `lib/store.js` with a real API and database
- [ ] Add real video hosting and course artwork
- [ ] Wire payment and the form endpoints
- [ ] Add analytics, `sitemap.js`, `robots.txt`
- [ ] Re-check contrast if the accent shifts at all
