# PROSTIR — Urban OS

> **ПРОгресивно. ПРОзоро. ПРОсто.**  
> Your personal urban rhythm.

[![Live Demo](https://img.shields.io/badge/Live-Demo-8B5CF6?style=for-the-badge&logo=github&logoColor=white)](https://shepiitkod.github.io/prostir-web/)

**GitHub → [github.com/shepiitkod/prostir-web](https://github.com/shepiitkod/prostir-web)**

### GitHub Pages

Static UI is deployed from the **`gh-pages`** branch on every push to **`main`** or **`master`** (see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). In the repo **Settings → Pages**, set the source to **Deploy from a branch** → **`gh-pages`** → **`/ (root)`**.

If your fork uses another owner or repository name, update **`homepage`** in [`package.json`](package.json) and the badge URL above. The build uses `GITHUB_REPOSITORY` to prefix asset paths (e.g. `/prostir-web/app.css`).

**Limits on Pages:** there is no Node/Express API on GitHub Pages. Flows that call `/api/…`, Diia auth against your server, and the venue email form need a separate backend (e.g. Render, Fly.io) or localhost.

---

## What is PROSTIR?

PROSTIR is a premium urban operating system for city dwellers. It lets you book a restaurant table, reserve a coworking desk, and connect with people nearby — all verified in 10 seconds through **Diia** (Ukraine's state digital identity app). No passwords. No friction. One tap and you're in.

The product is built as a high-fidelity front-end prototype with a live Node.js/Express backend, demonstrating a complete booking flow from authentication to zero-click **Safe Exit** auto-payment.

---

## Modules

| Module | Description |
|---|---|
| **Dine** | Interactive SVG floor plan for Cafe Aura. Select a table, pick a time slot, sign via Diia. Digital receipt with cinematic reveal animation. |
| **Working** | Coworking desk grid with live availability status. Click a zone card to highlight the corresponding desk area. |
| **Moments** | Privacy-first social discovery. Ghost Mode toggle, opt-in connection requests, Diia-verified profiles only. |
| **Business** | Partner dashboard mockup — live floor plan editor, revenue analytics chart with draw-in animation, customer flow bar chart. |
| **Profile** | User profile page with active bookings, history, settings (Ghost Mode, Safe Exit auto-pay, push notifications), and Diia verification status. |

---

## Key Features

- **Diia Sign-In** — one-tap state-verified authentication, zero passwords
- **Safe Exit** — geofencing auto-closes your tab and sends a push receipt when you leave
- **Live iOS Widgets** — Safe Exit timer, geofence route map, Moments notification
- **Magnetic Buttons** — spring-physics hover effect (Framer Motion-style, vanilla JS)
- **Manifesto Intro** — full-screen word sequence animation on first visit
- **Dark / Light theme** — Noir-Violet (black) and Neoclassical (white) modes
- **UA / EN language** — instant full-page language switching, persisted in localStorage
- **Interactive Pricing** — monthly/yearly toggle with count-up animation, neon border, glassmorphism badge, SVG draw-in checkmarks
- **FAQ Drawer** — slide-up sheet shared across all pages (`faq.js`)
- **Skeleton loaders & empty states** — on Dine and Working modules

---

## Tech Stack

### Frontend
- Vanilla HTML5 / CSS3 / JavaScript (ES6+) — zero frameworks
- CSS custom properties, `clamp()`, `backdrop-filter`, `@property`, `conic-gradient`
- `IntersectionObserver` for scroll-triggered animations
- `requestAnimationFrame` spring physics engine (stiffness 150, damping 15)
- FLIP animation technique for manifesto → logo transition
- SVG: interactive floor plans, animated charts, route maps, icon animations
- `sessionStorage` (intro once) + `localStorage` (theme, language)

### Backend
- **Node.js** + **Express.js**
- `db.json` — flat-file JSON data store (no database dependency)
- CORS-enabled REST API
- Static file serving from `/public`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tables/:venueId` | Get tables for a venue |
| `GET` | `/api/desks/:venueId` | Get coworking desks for a venue |
| `GET` | `/api/apartments` | Get apartment listings |
| `GET` | `/api/bookings` | Get all bookings |
| `POST` | `/api/book` | Create a new booking |
| `DELETE` | `/api/bookings/:id` | Cancel a booking |

---

## Project Structure

```
prostir/
├── public/
│   ├── index.html          # Landing page + Live Widgets + How It Works
│   ├── dine.html           # Restaurant table booking
│   ├── working.html        # Coworking desk booking
│   ├── moments.html        # Social discovery (Ghost Mode)
│   ├── business.html       # Partner / Business page
│   ├── profile.html        # User profile & settings
│   ├── app.css             # Global styles
│   ├── faq.js              # Shared FAQ slide-up drawer
│   ├── delight.js          # Micro-interaction layer
│   └── assets/             # Workspace images
├── server.js               # Express server + REST API
├── db.json                 # Local data store
└── package.json
```

---

## Run Locally

```bash
# Install dependencies
npm install

# Start the server (compile first: npm run build — listens on PORT or 8080, host 0.0.0.0)
npm start
```

Open [http://localhost:8080](http://localhost:8080). For Diia mock redirects when the API is public, set **`PUBLIC_APP_URL`** to that same public URL (e.g. `https://prostir-web-production.up.railway.app` on Railway).

---

## Design System

| Token | Value |
|---|---|
| Accent | `#8B5CF6` Neon Violet |
| Background (light) | `#FFFFFF` Pure White |
| Background (dark) | `#000000` Pure Black |
| Card (dark) | `#0D0D0F` with `32px` radius |
| Font | System UI stack (`-apple-system`, `Inter`, `Segoe UI`) |
| Mono font | `SF Mono`, `JetBrains Mono`, `monospace` |
| Base grid | 8px / 16px |
| Transitions | `cubic-bezier(0.22, 1, 0.36, 1)` |

---

## Status

> **Front-end prototype** — UI/UX complete, mock API live.  
> Backend with real database, Diia OAuth integration, and push notifications are the next milestone.

---

*Built with intent. Designed for Kyiv.*
