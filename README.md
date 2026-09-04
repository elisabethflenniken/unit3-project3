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

Components are grouped by feature/screen, not by type — everything for the
detail sheet lives in one folder, everything for the map lives in another,
and so on. `pages/` holds only the two route-level composition roots; almost
all actual UI lives under `components/`.

```
src/
├── main.tsx                   # entry point — mounts <App>, imports fonts + global CSS
├── App.tsx                    # theme/router/provider setup, top-level layout (routes + bottom nav)
├── theme.ts                   # MUI theme — palette, Manrope typography, component overrides
├── index.css                  # global CSS the theme can't reach (Leaflet's own DOM, font stack)
│
├── pages/                     # one file per route — composition roots, not much logic of their own
│   ├── MapPage.tsx             # "/" — the map, search/filters, floating actions, all the sheets/dialogs
│   └── SavedPage.tsx           # "/saved" — saved-restrooms list
│
├── components/
│   ├── map/                    # the Leaflet map itself and everything drawn on it
│   │   ├── MapView.tsx           # MapContainer + tile layer + fly-to/picker-mode controllers
│   │   ├── RestroomMarker.tsx    # the pin/heart icon, color-coded by state (default/selected/visited)
│   │   ├── UserLocationMarker.tsx  # pulsing "you are here" blip
│   │   └── PickedLocationMarker.tsx  # drop-pin marker used by the add-a-restroom map picker
│   ├── detail/                  # the restroom detail bottom sheet and its pieces
│   │   ├── RestroomDetailSheet.tsx  # the sheet itself — address, hours, actions, etc.
│   │   ├── RatingStars.tsx         # read-only + interactive star rating control
│   │   ├── RateRestroomForm.tsx    # the three rating rows (clean/safety/privacy), wired to context
│   │   └── AmenityChips.tsx        # the amenity/accessibility tag chips
│   ├── add/
│   │   └── AddListingForm.tsx    # full-screen "add a restroom" form + map picker
│   └── layout/                  # chrome shared across the map screen
│       ├── TopBar.tsx             # floating search bar + live results dropdown + filter chips
│       ├── FloatingActions.tsx    # locate-me / add-a-restroom buttons
│       └── BottomNav.tsx          # Map / Saved tab bar
│
├── context/                   # app-wide state, provided once in App.tsx
│   ├── UserDataContext.tsx      # saved ids, ratings, user-added restrooms, reports (localStorage-backed)
│   └── LocationContext.tsx      # wraps useGeolocation so any component can read the user's position
│
├── hooks/
│   ├── useGeolocation.ts        # browser geolocation + Seattle-downtown fallback
│   ├── useDistance.ts           # haversine distance + walk-time formatting
│   └── useLocalStorage.ts       # generic localStorage-backed useState
│
├── utils/                     # pure functions — no React, no state
│   ├── hours.ts                  # open-now / today's-hours / full-schedule formatting
│   ├── mapsLink.ts               # Google Maps directions deep link
│   ├── text.ts                   # toSentenceCase
│   └── chipToggleStyle.ts        # shared two-state (default/selected) chip styling
│
├── types/
│   └── restroom.ts              # the Restroom data model — the contract the rest of the app is built against
│
└── data/
    └── restrooms.json           # fake seed dataset of Seattle restrooms
```

See `PLAN.md` §2–3 for the original planned structure and the `Restroom` data model, and §6 for how the MUI theme is organized so the whole app's look can be customized from one file.

## Notes on the data

All restroom listings, ratings, access codes, and hours in `src/data/restrooms.json` are **fake/invented for demo purposes** — this is not a live or verified feed from the City of Seattle. Locations are placed in real Seattle neighborhoods for a realistic-feeling demo, but addresses and details should not be relied on as accurate.

Anything a user saves, rates, or adds through the app is stored in the browser's `localStorage` only — it's local to that browser/device and isn't shared with anyone else. Clearing site data resets the app back to the original seed dataset.

## Status

Phases 0–5 from `PLAN.md` are built and verified in a mobile-width browser: map with 25 seed restrooms, tap-to-open bottom sheet with ratings/hours/amenities/code/directions, save list, add-a-listing flow, search + filter chips, and localStorage persistence across reloads.

Not yet done: PWA manifest/installability (stretch goal), photo upload, and the "report an issue" flow is a stub (reports are stored but not surfaced anywhere in the UI yet).
