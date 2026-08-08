# CA Course Website — Direction B — Navy Authority

A standalone deployment of the course platform, **locked to Direction B — Navy Authority** (#103A66).

This folder is a complete Next.js app. It is a sibling of `../amber/`,
which is the same product in the other direction, and of the repository root, which is the
switchable build with a direction toggle.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Vercel

1. [vercel.com/new](https://vercel.com/new) → import `CA-Course-website-Demo`
2. **Root Directory** → `navy`   ← the only setting that matters
3. Framework preset: Next.js (auto-detected). No environment variables.
4. Deploy.

Suggest naming the project `ca-course-navy` so the URL reads `ca-course-navy.vercel.app`.

## What differs from the switchable build

- `data-theme="navy"` is hard-set on `<html>` in `app/layout.jsx`
- The demo control bar is removed; `components/DemoBar.jsx` is deleted
- `--demo-h` is `0px`, so the nav sits at the top of the viewport
- `lib/theme.jsx` is a fixed stub — no theme storage, no switching
- No test suite here; it lives at the repository root

Everything else is identical: the same pages, the same admin backend, the same device storage.

## Accent

**#103A66** — Institutional and considered — adjacent to the Big 4 firms whose logos the site displays.

Navy works as both fill and text at AAA in either direction (11.54:1 on white, white on navy 11.54:1). One hex, no contrast traps.

## Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@thinkingbridge.in` | `admin123` |
| Learner (owns Audit) | `learner@thinkingbridge.in` | `learner123` |
| Learner (owns nothing) | `student@thinkingbridge.in` | `student123` |

Listed on the sign-in page as one-click fill buttons. Checkout coupon: **`COMBO30`**.

## Everything else

See the [repository root README](../README.md) for the full architecture, the course player,
device-storage keys, the demo script, and the pre-launch checklist.
