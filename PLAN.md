# PitStop Seattle — Technical Build Plan

This is the implementation plan to hand to Claude in VS Code (Claude Code), phase by phase. It assumes you've read `BRIEF.md` first — that's the *why*, this is the *how*.

**Suggested workflow:** don't paste this whole file into one prompt. Work through the phases in order, in separate prompts/sessions, and point Claude at this file plus `BRIEF.md` for context each time (e.g. "Read PLAN.md and BRIEF.md, then implement Phase 2"). That keeps changes reviewable and gives you a chance to run the app between phases.

---

## 1. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **React + TypeScript**, via **Vite** | Fast dev server, minimal config, TS keeps the data model honest |
| UI components | **MUI (Material UI) v6** | Explicitly requested — themeable, accessible defaults, good bottom-sheet/drawer primitives |
| Map | **React-Leaflet + Leaflet**, tiles from **CARTO Positron** (or OpenStreetMap standard) | Free, no API key required, supports pinch/finger-zoom out of the box, and Positron's light/clean tile style is the closest free equivalent to Google Maps' look. (Actual Google Maps tiles require a paid API key + billing account — avoid that for a fake-data demo project.) |
| Directions hand-off | Deep link to `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` | No API key needed; opens the user's own Google Maps app/site for real turn-by-turn |
| Routing (screens) | **React Router** | Map view / saved list / add-listing as routes; restroom detail as a bottom sheet driven by URL state (`?restroom=<id>`) so it's shareable and back-button-friendly |
| State & persistence | **React Context + localStorage** | No backend for v1 — saved list, submitted ratings, and user-added pins persist locally in the browser |
| Geolocation | Browser `navigator.geolocation` API | For the "current location" blip and distance/walk-time calculations |
| Fonts | **Open Sans** via `@fontsource/open-sans` (self-hosted, no external request at runtime) | Matches the brief; self-hosting avoids a render-blocking Google Fonts request |
| Icons | `@mui/icons-material` | Ships with MUI, covers everything needed (location, star, share, etc.) |

Everything here is swappable later — this is the fastest path to a working, good-looking, mobile-first demo with zero paid services.

---

## 2. Project structure

```
pitstop-seattle/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # routes + theme provider + layout shell
│   ├── theme.ts                    # MUI theme: palette, typography (Open Sans), component overrides
│   ├── data/
│   │   └── restrooms.json          # fake seed dataset (see §4)
│   ├── types/
│   │   └── restroom.ts             # Restroom, Rating, Amenity types
│   ├── context/
│   │   ├── UserDataContext.tsx     # saved list, submitted ratings, user-added pins (localStorage-backed)
│   │   └── LocationContext.tsx     # current position, permission state
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useGeolocation.ts
│   │   └── useDistance.ts          # haversine distance + walk-time estimate
│   ├── utils/
│   │   ├── hours.ts                # "is it open now?" logic from structured hours
│   │   └── mapsLink.ts             # builds the Google Maps directions URL
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.tsx
│   │   │   ├── RestroomMarker.tsx  # custom high-contrast pin, status-colored
│   │   │   └── UserLocationMarker.tsx
│   │   ├── detail/
│   │   │   ├── RestroomDetailSheet.tsx   # MUI SwipeableDrawer, bottom-anchored
│   │   │   ├── RatingStars.tsx
│   │   │   ├── AmenityChips.tsx
│   │   │   └── RateRestroomForm.tsx
│   │   ├── saved/
│   │   │   └── SavedListDrawer.tsx
│   │   ├── add/
│   │   │   └── AddListingForm.tsx
│   │   └── layout/
│   │       ├── TopBar.tsx          # floating search + filter chips
│   │       └── FloatingActions.tsx # locate-me + add-listing buttons, thumb zone
│   └── pages/
│       ├── MapPage.tsx             # composition root for the main screen
├── public/
└── README.md
```

---

## 3. Data model

Define this in `src/types/restroom.ts` and treat it as the contract the rest of the app is built against.

```ts
export type AccessType = "fully_public" | "business" | "park" | "transit" | "government";

export interface Hours {
  // 24hr "HH:mm", or null for closed that day; "always" flag for 24/7 spots
  alwaysOpen: boolean;
  schedule?: Partial<Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    { open: string; close: string } | null
  >>;
}

export interface RatingSummary {
  cleanliness: { average: number; count: number };
  safety: { average: number; count: number };     // well-lit / felt-safe
  privacy: { average: number; count: number };     // functioning lock / private
}

export interface Restroom {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  accessType: AccessType;
  requiresPurchase: boolean;       // e.g. cafe restrooms
  accessCode: string | null;       // null if no code needed
  isAdaAccessible: boolean;
  isGenderNeutral: boolean;
  hasBabyChanging: boolean;
  isSingleOccupancy: boolean;
  amenities: string[];             // ["toilet paper", "soap", "hand dryer", "running water"]
  description: string;
  hours: Hours;
  ratings: RatingSummary;
  lastVerified: string;            // ISO date string
  source: "seed" | "user";         // fake seed data vs. user-added
  photoUrl?: string;               // optional placeholder image
}
```

User-generated state (ratings the current user submitted, saved IDs, user-added restrooms) is kept **separate** from the seed data, in `UserDataContext` + `localStorage`, and merged with `restrooms.json` at read time. That keeps the shipped fake dataset immutable and makes it trivial to reset ("clear my data") during testing.

---

## 4. Fake dataset

Seed `src/data/restrooms.json` with **~20–25 entries** spread across real Seattle neighborhoods for visual variety on the map — Downtown/Pike Place, Capitol Hill, Ballard, Fremont, U District, Wallingford, West Seattle, Georgetown, International District, Green Lake, South Lake Union. Use real, plausible Seattle coordinates (approximate is fine — this is a demo dataset, not a verified city feed) and a real mix of `accessType` values so filtering has something to show.

Vary the data deliberately so every UI state gets exercised: some open 24/7, some with restricted hours, some needing a code, some ADA accessible and some not, some with only 1–2 ratings and some with 30+, a couple with no ratings yet, at least one `source: "user"` example.

Example entries to seed the pattern (have Claude generate the rest following this shape):

```json
[
  {
    "id": "sea-001",
    "name": "Cal Anderson Park Restroom",
    "address": "1635 11th Ave, Seattle, WA 98122",
    "neighborhood": "Capitol Hill",
    "lat": 47.6178,
    "lng": -122.3200,
    "accessType": "park",
    "requiresPurchase": false,
    "accessCode": null,
    "isAdaAccessible": true,
    "isGenderNeutral": true,
    "hasBabyChanging": true,
    "isSingleOccupancy": false,
    "amenities": ["toilet paper", "running water", "soap"],
    "description": "Park restroom near the shelterhouse, close to the tennis courts and skate park.",
    "hours": { "alwaysOpen": false, "schedule": {
      "mon": { "open": "06:00", "close": "22:30" }, "tue": { "open": "06:00", "close": "22:30" },
      "wed": { "open": "06:00", "close": "22:30" }, "thu": { "open": "06:00", "close": "22:30" },
      "fri": { "open": "06:00", "close": "22:30" }, "sat": { "open": "06:00", "close": "22:30" },
      "sun": { "open": "06:00", "close": "22:30" }
    }},
    "ratings": {
      "cleanliness": { "average": 3.2, "count": 41 },
      "safety": { "average": 3.6, "count": 30 },
      "privacy": { "average": 3.9, "count": 28 }
    },
    "lastVerified": "2026-07-14",
    "source": "seed"
  },
  {
    "id": "sea-002",
    "name": "Ballard Library Restroom",
    "address": "5614 22nd Ave NW, Seattle, WA 98107",
    "neighborhood": "Ballard",
    "lat": 47.6684,
    "lng": -122.3838,
    "accessType": "government",
    "requiresPurchase": false,
    "accessCode": null,
    "isAdaAccessible": true,
    "isGenderNeutral": false,
    "hasBabyChanging": true,
    "isSingleOccupancy": false,
    "amenities": ["toilet paper", "running water", "soap", "hand dryer"],
    "description": "Inside the Ballard branch library, near the main entrance. Free and open to the public during library hours.",
    "hours": { "alwaysOpen": false, "schedule": {
      "mon": { "open": "10:00", "close": "20:00" }, "tue": { "open": "10:00", "close": "20:00" },
      "wed": { "open": "10:00", "close": "20:00" }, "thu": { "open": "10:00", "close": "20:00" },
      "fri": { "open": "10:00", "close": "18:00" }, "sat": { "open": "10:00", "close": "17:00" },
      "sun": null
    }},
    "ratings": {
      "cleanliness": { "average": 4.4, "count": 19 },
      "safety": { "average": 4.6, "count": 15 },
      "privacy": { "average": 4.1, "count": 12 }
    },
    "lastVerified": "2026-08-02",
    "source": "seed"
  },
  {
    "id": "sea-003",
    "name": "Uptown Espresso Restroom",
    "address": "2504 4th Ave, Seattle, WA 98121",
    "neighborhood": "Belltown",
    "lat": 47.6142,
    "lng": -122.3444,
    "accessType": "business",
    "requiresPurchase": true,
    "accessCode": "1937",
    "isAdaAccessible": false,
    "isGenderNeutral": true,
    "hasBabyChanging": false,
    "isSingleOccupancy": true,
    "amenities": ["toilet paper", "running water", "soap"],
    "description": "Single-occupancy restroom for customers; ask staff or check the door for the current code.",
    "hours": { "alwaysOpen": false, "schedule": {
      "mon": { "open": "06:00", "close": "18:00" }, "tue": { "open": "06:00", "close": "18:00" },
      "wed": { "open": "06:00", "close": "18:00" }, "thu": { "open": "06:00", "close": "18:00" },
      "fri": { "open": "06:00", "close": "18:00" }, "sat": { "open": "07:00", "close": "18:00" },
      "sun": { "open": "07:00", "close": "17:00" }
    }},
    "ratings": {
      "cleanliness": { "average": 3.8, "count": 6 },
      "safety": { "average": 4.0, "count": 5 },
      "privacy": { "average": 4.5, "count": 5 }
    },
    "lastVerified": "2026-06-20",
    "source": "seed"
  }
]
```

All names, codes, and figures above are invented for demo purposes.

---

## 5. Screens & components

**MapPage (`/`)** — the app's home and default route.
- Full-bleed `MapView` (React-Leaflet), centered on the user's location once granted, falling back to a default Seattle center (e.g. downtown, 47.6062/-122.3321) if permission is denied.
- `TopBar` floats over the map: search box + filter chips (Open now, ADA accessible, Gender-neutral, No code needed). Filters narrow which `RestroomMarker`s render.
- `RestroomMarker` — a custom MUI/SVG pin (not the default Leaflet teardrop), color-coded by status: green = open now, gray = closed, amber outline = needs a code, per the brief's high-contrast requirement. Tapping one opens `RestroomDetailSheet` and updates the URL (`?restroom=<id>`).
- `FloatingActions` — bottom-right stacked buttons: "locate me" (re-centers + re-requests geolocation) and "add a restroom" (opens `AddListingForm`), both within one-thumb reach on a phone held in portrait.
- `UserLocationMarker` — pulsing blip at the user's current coordinates.

**RestroomDetailSheet** — MUI `SwipeableDrawer` anchored `bottom`, opens to ~45% height with a drag handle to expand full-height. Content order (glanceable-first, per the brief):
1. Name, distance + walk time, open-now/closed badge
2. Address row with a "Open in Google Maps" button (`mapsLink.ts` deep link)
3. Cleanliness / safety / privacy star ratings (`RatingStars`, read + submit)
4. Access code (if any), shown prominently, not buried
5. Amenity chips (`AmenityChips`): ADA, gender-neutral, baby-changing, single-occupancy, etc.
6. Full hours (collapsed by default, expandable)
7. Description
8. Actions row: Save / Unsave, Rate, Share, Report an issue
9. "Last verified" timestamp, small, at the bottom

**SavedListDrawer** — a full-height MUI `Drawer`, listing saved restrooms as cards (reuse a condensed version of the detail card); tapping one closes the drawer, pans the map, and opens that restroom's detail sheet.

**AddListingForm** — MUI `Dialog` (full-screen on mobile via `fullScreen` prop) with a form covering every `Restroom` field except `id`, `ratings`, `lastVerified`, `source` (these are set programmatically: new UUID, empty ratings, today's date, `"user"`). Let the user drop a pin by tapping the map (reuse `MapView` in picker mode) or enter an address to geocode — for a fake-data project, a simple lat/lng input pair is a fine fallback if geocoding is out of scope.

---

## 6. MUI theming (`src/theme.ts`)

- `typography.fontFamily`: Open Sans first, with system fallbacks (`'"Open Sans", -apple-system, "Segoe UI", sans-serif'`). Import `@fontsource/open-sans` weights 400/600/700 in `main.tsx`.
- `palette`: a clean, high-contrast light theme close to Google Maps — near-white background (`#F8F9FA`-ish), dark neutral text, and a small deliberate status palette reused everywhere (pins, badges, filter chips) rather than invented per-component:
  - `success` → open now
  - `grey`/`text.disabled` → closed
  - `warning` → needs a code / access-restricted
  - `info` or a custom `unverified` token → not yet rated / stale data
- `shape.borderRadius`: slightly rounded (8–12px) for that soft Google-Maps-card look on the bottom sheet, chips, and buttons.
- Component overrides worth setting once, globally, rather than per-usage: `MuiButton` (rounded, no all-caps), `MuiChip` (used heavily for filters + amenities), `MuiDrawer` (elevation/shadow for the bottom sheet).
- Keep the theme in one file and reference tokens (`theme.palette.success.main`, etc.) from the pin/badge components — don't hardcode hex values in components, since "MUI components I can customize" implies the theme file should be the single place you go to restyle the whole app.

---

## 7. Build phases

Work through these in order; each should leave you with something runnable.

**Phase 0 — Scaffold**
`npm create vite@latest` (react-ts template) → install MUI, Leaflet/React-Leaflet, React Router, `@fontsource/open-sans`, `@mui/icons-material` → set up `theme.ts` and wrap `App.tsx` in `ThemeProvider` + `CssBaseline` → confirm Open Sans renders and the theme's palette is visible somewhere (even a placeholder page).

**Phase 1 — Map + fake pins**
Build `MapView` with React-Leaflet + CARTO tile layer → author `restrooms.json` (~20–25 entries per §4) and `restroom.ts` types → render `RestroomMarker` for each entry with basic status coloring → request geolocation and show `UserLocationMarker`, with a graceful fallback center if denied. **Checkpoint:** you can load the app on a phone (or Chrome DevTools device mode), see pins scattered around Seattle, and pinch-zoom smoothly.

**Phase 2 — Detail sheet**
Build `RestroomDetailSheet` as a bottom-anchored `SwipeableDrawer`, wire pin taps to open it with the right restroom's data, implement `mapsLink.ts` and the "open in Google Maps" button, implement `hours.ts`'s open-now logic and surface it as a badge. **Checkpoint:** tapping any pin shows real address/hours/description/code, and the Google Maps button actually opens directions.

**Phase 3 — Ratings & saved list**
Build `UserDataContext` (localStorage-backed) → `RatingStars` (read-only display + interactive submit variant) → wire rating submission to update the summary average/count for that session → build save/unsave toggle and `SavedListDrawer`. **Checkpoint:** rate a restroom, refresh the page, rating persists; save a restroom, find it in the saved list.

**Phase 4 — Add a listing**
Build `AddListingForm` (tap-to-drop-pin or lat/lng entry) → validate required fields → write new entries into `UserDataContext` state, tagged `source: "user"` → render them on the map with a distinct marker treatment (e.g. a small "new" badge) so seed vs. user-contributed data stays visually distinguishable. **Checkpoint:** add a restroom, see its pin appear immediately, tap it, see your own submission in the detail sheet.

**Phase 5 — Filters, polish, and mobile QA**
Wire up the `TopBar` filter chips (open now / ADA / gender-neutral / no code) against the live pin set → add distance + walk-time to cards (`useDistance.ts`) → pass over touch-target sizes, contrast, and safe-area insets (`env(safe-area-inset-bottom)` for the floating action buttons on notched phones) → test one-handed reachability at common phone widths (360–430px) → optionally add a web app manifest for "add to home screen" installability.

**Stretch goals (post-v1, don't block on these):**
- PWA offline caching of the seed dataset (service worker)
- Photo upload/preview on listings (store as data URL locally — no real upload backend)
- "Report an issue" flow with a lightweight status (e.g., flags stored locally, shown as a small warning badge after N reports)
- Clustering pins when zoomed out over dense areas (e.g. `react-leaflet-cluster`)

---

## 8. Verification checklist (run through before calling a phase "done")

- Loads and is fully usable at a 375–430px wide viewport, portrait
- All primary actions (search, filter, locate-me, save, rate, add, get-directions) are reachable without stretching to the top of the screen
- Pins are readable at a glance against the map background without zooming in
- Works with geolocation denied (sensible fallback center + a way to retry granting permission)
- Refreshing the page doesn't lose saved restrooms, submitted ratings, or user-added listings
- No paid API keys required to run the project from a fresh clone
