# PitStop Seattle — Product Brief

*(working title — rename freely once you land on something you like)*

## The prompt we're building from

> "Designing for mobile isn't just about making things smaller. It's a completely different context. One hand. Glancing at a screen between tasks. Maybe outside, maybe on a job site. Your build should do one thing well for someone who's probably not sitting at a desk."

Everything below is a translation of that prompt into one specific product.

## What we're building

A mobile-first web app that helps someone in Seattle find a public restroom — fast — see whether they can trust it (clean? has a code? open right now?), get walking directions, and optionally add or rate a spot for the next person. A map-first experience styled after Google Maps, backed by a fake/mock dataset (no real backend required to build and demo it).

## Who this is for, and the moment they're in

This is not a "browse at your leisure" app. Picture the person opening it:

- A dog walker two blocks from home who suddenly needs a bathroom
- A delivery or rideshare driver on a break between stops
- A construction or landscaping worker on a job site without facilities
- A parent with a toddler who "has to go" *right now*
- A tourist near Pike Place who doesn't know the neighborhood
- A cyclist or runner mid-route
- Someone without stable housing looking for a clean, accessible option
- Someone in a wheelchair who needs to know *before* they walk over whether a place is actually accessible

In every case: one hand, phone held at a slight angle, probably walking, possibly stressed, definitely not interested in reading paragraphs of copy.

## The one thing this app has to do well

**Let someone standing on a Seattle sidewalk find, trust, and walk to the nearest public restroom in under ~10 seconds, one-thumb, no login required.**

Every design decision gets tested against that sentence. If a feature doesn't serve it directly, it's secondary and shouldn't compete for space on the primary screen.

## Design principles

1. **Map first, chrome last.** The map is the app, not a tab within it. Search bars, filters, and buttons float on top of it; they never push it into a smaller box.
2. **Thumb-zone UI.** Primary actions (search, locate-me, filters, save, rate) live in the bottom half of the screen. Use a bottom sheet for restroom details instead of a full-screen page or a top-anchored modal — it opens with a thumb-reachable swipe and keeps the map visible underneath for spatial context.
3. **Glanceable, not readable.** Pins communicate status through color/shape alone before someone taps anything. Detail screens lead with the 3–4 facts that matter (open now? clean? has a code? how far?) before anything else.
4. **Outside-readable.** This will be used in direct sun, at night, with wet fingers. High contrast over subtlety — no low-contrast pastel-on-white text, no thin hairline icons as the only signal.
5. **Low-friction contribution.** Rating a restroom or adding a new one should never require creating an account. Friction here means people simply won't do it, and the data set goes stale.
6. **Trust signals over trust claims.** Instead of a single "good/bad," show *why*: cleanliness rating, how recently it was verified, how many people rated it. Let the user decide, don't decide for them.

## Visual direction

- Full-bleed map as the base layer, styled clean and light (think Google Maps' default light theme, not a heavily skinned map).
- High-contrast, unmistakable pins — distinct from a generic map pin so they read instantly at a glance. Color/shape should communicate status (e.g., open vs. closed vs. needs a code vs. unverified) without requiring a tap.
- A floating search + filter bar anchored near the top, and a floating "locate me" + "add a restroom" button anchored bottom-right, within thumb reach.
- Restroom details open in a **bottom sheet** (partial height, swipeable to full height), never a full-page navigation away from the map.
- Typeface: **Open Sans** throughout — headings and body. Favor MUI's default type scale over custom sizes so it stays consistent and legible at small sizes.
- Generous touch targets (44px+), rounded cards, soft elevation on the bottom sheet and floating buttons so they read as "on top of" the map.

## Core features (from the prompt)

- Map centered on the user's current location, pinch/finger-zoomable
- Pins marking public restroom locations
- Tap a pin → detail view with:
  - Address, with a button to open it directly in Google Maps for turn-by-turn directions
  - Hours of availability
  - Description of the facilities
  - Ratings — cleanliness at minimum (see "additional ratings" below)
  - Access code, if the restroom is locked
  - Ability to submit a rating
  - Ability to save the listing to a personal saved list
- A saved list the user can return to
- An "add a restroom" flow for contributing new listings

## Additional details worth including

These extend the core ask in ways that matter for *this specific use case* — someone who urgently needs accurate, trustworthy information:

- **Open-now indicator**, computed from the hours field and shown directly on the pin/card — the single highest-value piece of information after location
- **Distance and walk time** from the user's current location, shown on both the pin (on tap) and the detail sheet
- **Facility type/access tag**: fully public (park, library), business-with-purchase (café, gas station), transit station, etc. — sets expectations before someone walks over
- **Accessibility (ADA) flag** — critical, not optional, for wheelchair users
- **Gender-neutral / family / single-occupancy flag**
- **Amenities checklist**: toilet paper, soap, hand dryer/paper towels, baby-changing station, running water, well-lit
- **A second rating beyond cleanliness** — suggest **safety/well-lit** and **privacy/functioning lock**, since those matter as much as cleanliness for this audience. Keep it to 2–3 rating dimensions max; more than that won't get filled in.
- **"Last verified" timestamp** — even fake/mock data should model this, since restroom availability and codes change and staleness is a real trust problem
- **Report an issue** action (e.g., "code doesn't work," "permanently closed") — cheap to add now as a stub, valuable later
- **Share listing** (native share sheet / copy link) for texting a spot to someone else
- **Offline-friendly / installable (PWA)** — someone who needs this app is often on spotty connectivity; this is a stretch goal, not a v1 requirement, but worth designing toward

## Explicitly out of scope for v1

- Real backend, real accounts/auth, or real user-generated data moderation
- A live, verified feed from the City of Seattle (use a realistic fake dataset instead)
- Payments or any paid tier
- Native iOS/Android builds (build as a responsive, installable web app instead)

## Success criteria

- A first-time user can go from "open the app" to "see directions to the nearest open restroom" without reading any instructions
- Every core interaction is reachable one-handed, thumb-only, in portrait orientation
- The app fully demos on the fake dataset with zero backend setup
- Pins and status are legible at a glance, outdoors, without zooming in to read text first
