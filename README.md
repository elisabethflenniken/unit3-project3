# PitStop Seattle

*(working title)*

A mobile-first web app for finding public restrooms in Seattle — map-first, one-thumb usable, styled after Google Maps. Built on a fake/mock dataset, so it runs fully with no backend and no API keys.

See [`BRIEF.md`](./BRIEF.md) for the product vision and design principles, and [`PLAN.md`](./PLAN.md) for the full technical build plan and phase-by-phase implementation steps.

## Tech stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [MUI](https://mui.com/) (Material UI) for components and theming
- [React-Leaflet](https://react-leaflet.js.org/) + Leaflet for the map (OpenStreetMap standard tiles — free, no API key; CARTO's free Positron tiles now watermark anonymous requests)
- React Router for screen navigation
- Manrope (`@fontsource/manrope`)
- Local component state + `localStorage` for saved listings, ratings, and user-added restrooms (no backend in v1)

## Prerequisites

- Node.js 18+ and npm
- A modern mobile browser or desktop browser with device emulation for testing (Chrome DevTools → device toolbar recommended)

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`) and, for the mobile-first experience this app is built for, switch your browser into a mobile device emulation view (or open it on an actual phone on the same network).

Grant location access when prompted so the map centers on you and distance/walk-time figures are accurate; without it, the map falls back to a default downtown Seattle center.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server with hot reload |
| `npm run build` | Type-check and build a production bundle to `dist/` |
| `npm run preview` | Serve the production build locally, for a final check before deploying |
| `npm run lint` | Run linting (if configured — add ESLint during Phase 0 if not scaffolded by default) |

## Project structure

```
src/
├── data/restrooms.json     # fake seed dataset of Seattle restrooms
├── types/restroom.ts       # Restroom data model
├── context/                # saved list / ratings / user-added pins (localStorage-backed)
├── hooks/                  # geolocation, distance calc, localStorage helper
├── utils/                  # open-now logic, Google Maps deep-link builder
├── components/
│   ├── map/                # map + pins
│   ├── detail/              # restroom detail bottom sheet
│   ├── saved/               # saved list drawer
│   ├── add/                 # add-a-listing form
│   └── layout/               # floating search/filter bar and action buttons
├── pages/                  # top-level route screens
└── theme.ts                 # MUI theme — palette, Manrope typography, component overrides
```

See `PLAN.md` §2–3 for the full structure and the `Restroom` data model, and §6 for how the MUI theme is organized so the whole app's look can be customized from one file.

## Notes on the data

All restroom listings, ratings, access codes, and hours in `src/data/restrooms.json` are **fake/invented for demo purposes** — this is not a live or verified feed from the City of Seattle. Locations are placed in real Seattle neighborhoods for a realistic-feeling demo, but addresses and details should not be relied on as accurate.

Anything a user saves, rates, or adds through the app is stored in the browser's `localStorage` only — it's local to that browser/device and isn't shared with anyone else. Clearing site data resets the app back to the original seed dataset.

## Status

Phases 0–5 from `PLAN.md` are built and verified in a mobile-width browser: map with 25 seed restrooms, tap-to-open bottom sheet with ratings/hours/amenities/code/directions, save list, add-a-listing flow, search + filter chips, and localStorage persistence across reloads.

Not yet done: PWA manifest/installability (stretch goal), photo upload, and the "report an issue" flow is a stub (reports are stored but not surfaced anywhere in the UI yet).
