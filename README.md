# ALPHA EVENTS

**DISCOVER · PARTICIPATE · CREATE MEMORIES**

The official event discovery and registration platform for **Alpha Arts and Science College, Porur** — a static, GitHub Pages‑ready frontend built with plain HTML, CSS and JavaScript.

---

## 1. What's included

```
alpha-events/
├── index.html          → the entire app (all views live in one page)
├── css/
│   └── style.css        → design system, layout, dark/light themes, motion
├── js/
│   └── script.js         → routing, data model, all app logic
├── assets/
│   ├── images/           → put your hero/campus photos here
│   ├── gallery/          → put real event photos here
│   ├── events/           → put real event poster images here
│   ├── icons/            → optional custom icons
│   └── logo/
│       └── favicon.svg   → the Alpha emblem used in the tab icon & intro
└── README.md
```

Everything is wired together already: navigation, registration, dashboard, search, gallery, notifications, dark mode and localStorage persistence all work out of the box with realistic **sample data** — no build step, no server, no dependencies.

## 2. About the images

I was not able to verify or source an actual photograph of the Alpha Arts and Science College, Porur campus, so the hero banner, event cards and gallery currently use **clearly-stylised gradient placeholders** instead of a real (or worse, unrelated/mis-attributed) photo. This is intentional — it's safer than guessing.

To finish the visual identity:

1. Add a real campus photo as `assets/images/hero-campus.jpg` (recommended size: 1600×1000px or larger, landscape).
2. Open `css/style.css`, find the `.hero-bg` rule, and add `background-image:url('../assets/images/hero-campus.jpg');background-size:cover;background-position:center;` alongside the existing gradient (keep the gradient as an `::after` overlay for legibility).
3. For events and gallery photos, drop files into `assets/events/` and `assets/gallery/`, then in `js/script.js` replace the relevant `image: gradientFor(...)` / gradient values with `image: "url('assets/events/your-file.jpg')"` (the code already treats `image` as a CSS `background-image` value, so a URL works exactly like a gradient).
4. Never use scraped Google Maps imagery — the location section already uses a legitimate embedded map instead.

## 3. Running it locally

No installation needed. Two options:

**Option A — just open it**
Double-click `index.html`. Everything works, though some browsers restrict certain features (like `localStorage`) when opened via `file://`. If anything looks off, use Option B.

**Option B — local server (recommended)**
```bash
cd alpha-events
python3 -m http.server 8080
# then open http://localhost:8080 in your browser
```

## 4. Testing checklist

- [ ] Intro plays once on load, and "Skip" works
- [ ] Toggle dark/light mode — theme persists after refresh
- [ ] Browse Home → tap a category chip → lands filtered on Events
- [ ] Open an event → View Details modal shows every field
- [ ] Complete Register flow end-to-end (all 6 steps) → see the success screen with a generated `ALPHA-EVT-2026-000X` ID
- [ ] Create an account, sign out, sign back in
- [ ] Signed-in profile shows the registration you just completed
- [ ] Notifications bell shows an unread dot after registering; "Mark All As Read" clears it
- [ ] Gallery filters by category and opens the lightbox (prev/next)
- [ ] Dashboard stat cards animate in, charts fill in, and searching by name/register no./event/department instantly filters the table (desktop) / cards (mobile)
- [ ] Tapping a dashboard row opens the full student detail modal
- [ ] Resize to a phone width — bottom nav appears with an animated active pill; resize to desktop — it switches to the top nav
- [ ] Contact page map embed loads and "Get Directions" opens Google Maps

## 5. Deploying to GitHub Pages

1. Create a new GitHub repository, e.g. `alpha-events`.
2. Push this folder's contents to the repository root:
   ```bash
   cd alpha-events
   git init
   git add .
   git commit -m "Alpha Events — initial launch"
   git branch -M main
   git remote add origin https://github.com/<your-username>/alpha-events.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source → Deploy from a branch**, choose branch `main` and folder `/ (root)`, then **Save**.
4. Your site will be live at `https://<your-username>.github.io/alpha-events/` within a minute or two.
5. Whenever you push new commits to `main`, GitHub Pages redeploys automatically.

## 6. Important notes on data & security

- This is a **frontend-only demo**. All accounts, registrations, notifications and saved events are stored in your browser's `localStorage` — nothing is sent to a server.
- Sign-in here is **not secure** — passwords are stored in plain text in the browser for demo purposes only. Do not reuse a real password, and do not use real student personal data.
- Because storage is per-browser, registrations made on one device/browser won't appear on another. For a real college deployment, replace the storage layer with a proper backend (e.g. Node/Express or Django), a database, and secure authentication (hashed passwords, sessions or JWTs, HTTPS).
- Clearing your browser's site data will reset the app back to the sample dataset.

## 7. Customizing the sample events

All demo events, gallery items and starter notifications are generated once in `js/script.js` inside `seedEvents()`, `seedGallery()` and `seedNotifications()`, then written to `localStorage`. To change them:

1. Edit the arrays inside those functions.
2. In your browser's console, run `localStorage.clear()` and refresh — the seed functions will run again with your changes.

---

Built for Alpha Arts and Science College, Porur. *Your Campus. Your Events. Your Memories.*
