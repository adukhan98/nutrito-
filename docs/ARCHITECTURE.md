# NutriTO: Architecture

Status: draft v0.2, 2026-10-27. Helps people in the Greater Toronto Area find healthy food.

Three features, built in this order on one shared data core:
1. **Nutrition per dish**: calories, protein, carbs, fat, fiber, sodium. These are estimates unless the restaurant published the numbers.
2. **Search and filter by diet goal**: high protein, low carb, and so on.
3. **Map of healthy spots near the user.**

## 1. Core data model

Postgres tables. Every nutrition number carries its provenance.

| Table | Job | Key fields |
|---|---|---|
| `place` | A restaurant or shop. | `id`, `name`, `geom` (PostGIS point), `address`, `osm_id`, `dinesafe_id?`, `chain_name?`, `google_place_id?`, `google_match_status?`, `google_checked_at?` (only if M8b is built) |
| `dish` | One menu item at one place. | `id`, `place_id`, `name`, `serving_desc`, `serving_g?`, `menu_source_url`, `menu_checked_at` |
| `ingredient` | Our canonical ingredient, mapped to a reference food. | `id`, `name`, `fdc_id`, `match_note` |
| `dish_ingredient` | Recipe line. | `dish_id`, `ingredient_id`, `grams`, `grams_basis` (`published` / `guessed`) |
| `nutrition_estimate` | Result per serving. One current row per dish. | `dish_id`, `kcal`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`, `sodium_mg`, `kcal_low`, `kcal_high`, `method`, `confidence`, `source_id`, `engine_version`, `computed_at` |
| `source` | Provenance record. | `id`, `kind` (`restaurant_published` / `fdc` / `osm` / `dinesafe` / `manual`), `url`, `retrieved_at`, `license`, `attribution` |
| `fdc_food`, `fdc_nutrient` | Local copy of the FDC subset we use. | FDC ids and per-100 g values |

**Confidence** is one enum, and the UI shows it:
- `official`: the restaurant published these numbers. The source URL is stored. Under Ontario's menu-labelling law, chains with 20 or more Ontario locations must post calories only. Protein, sodium and the rest are official only if the restaurant also publishes them.
- `high`: every ingredient is matched to FDC Foundation, SR Legacy or FNDDS data, and gram weights come from the restaurant.
- `medium`: same matches, but weights are guessed.
- `low`: a meaningful share of the dish's mass is unmatched, or the numbers are a dish-type default.

The mass cutoff for `low` and the width of `kcal_low`/`kcal_high` are tunable and must be calibrated (M2). The same applies to the goal thresholds below.

Rule: **anything not `official` is shown as "Estimate"**, with the method one tap away. Sodium is the least reliable nutrient because restaurant salting varies, so it gets the widest range.

## 2. Data sources and caveats

| Source | Use | Terms we checked |
|---|---|---|
| **USDA FoodData Central** | Ingredient nutrition (primary). | Public domain, CC0 1.0; citation requested. The API needs a key. Default limit is 1,000 requests per hour per IP, and DEMO_KEY is far lower. Bulk CSV/JSON downloads exist, so we import a subset and avoid per-request calls. FDC values are a "snapshot in time", and energy is computed with Atwater factors. [api-guide](https://fdc.nal.usda.gov/api-guide/), [faq](https://fdc.nal.usda.gov/faq/) |
| **Open Food Facts** | Packaged-item fallback by barcode (post-v1). | Database is ODbL, contents are DbCL, images are CC BY-SA. Requires attribution and share-alike for derivative works. No accuracy guarantee, and the terms say "must not be used for medical purposes". [terms](https://world.openfoodfacts.org/terms-of-use) |
| **OpenStreetMap, via a regional extract** | Place list and geometry (primary). | ODbL: credit OSM and state the licence. Derived databases must be shared under ODbL. The public Overpass instance asks apps to stay small and cache, says commercial use should self-host or pay, and is overloaded. So we filter a regional dump with osmium instead. OSM itself says it doesn't provide free tiles for third parties, so we need our own tile provider. [copyright](https://www.openstreetmap.org/copyright), [Overpass wiki](https://wiki.openstreetmap.org/wiki/Overpass_API) |
| **Google Places API (New)** | Optional live enrichment only (§5b). Never a data source for our database. | You can't pre-fetch, cache or store Places content, except `place_id`. Lat/lng can be cached for 30 days. Content can't be shown on a non-Google map. Attribution is mandatory. [policies](https://developers.google.com/maps/documentation/places/web-service/policies), [service terms §14](https://cloud.google.com/maps-platform/terms/maps-service-terms), [Maps Platform ToS §3.2.3](https://cloud.google.com/maps-platform/terms) |
| **Toronto Open Data, DineSafe** | Matching key and "has inspection record" signal. It is not a health signal. | Open Government Licence – Toronto: commercial use is allowed. Attribute with "Contains information licensed under the Open Government Licence – Toronto." No personal information, and no implied endorsement. [licence](https://open.toronto.ca/open-data-licence/) The portal page shows the dataset as "Retired", and a City post dated 2026-07-13 announces an upgraded dining-inspections dataset. I didn't confirm which package is current. [dataset](https://open.toronto.ca/dataset/dinesafe/) |
| **Canadian Nutrient File 2026** | Second ingredient source for Canadian foods (post-v1). | Health Canada CSV download, 5,993 foods. **I did not check its licence.** Verify before use. [CNF](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/canadian-nutrient-file-about-us.html) |
| **Delivery apps (DoorDash, Uber Eats)** | **Do not scrape.** | DoorDash terms prohibit scraping or automated collection, compiling directories from its content, copying menu content for republication, and AI training on it. They also say its nutrition data may be AI-generated or not from the merchant. [DoorDash](https://help.doordash.com/legal/document?type=cx-terms-and-conditions&region=US&locale=en-US) The Uber Canada terms prohibit scripts for scraping or data mining. [Uber](https://www.uber.com/legal/en/document/?name=general-terms-of-use&country=canada&lang=en) |
| **Restaurant menus** | Dish names and ingredients. | v1: curated by hand from each restaurant's own published menu, with the URL and date stored. Ask for permission or official numbers where possible. I did not review any restaurant's own site terms. |

## 3. Stack

**Monorepo structure:**
```
apps/
  mobile/     # Expo app (iOS, Android, Web) with Expo Router
  api/        # Hono API server on Node.js
packages/
  shared/     # Types, theme tokens, nutrition engine
```

- **Expo + TypeScript (strict)**: cross-platform mobile app with Expo Router for navigation. Runs on iOS, Android, and web from one codebase.
- **Hono**: lightweight TypeScript API framework for the backend.
- **Postgres + PostGIS**: "places near me" is a `ST_DWithin` query, and the diet filters are plain SQL. Docker Compose for local dev.
- **MapLibre GL** with free OSM-compatible tiles (e.g., Protomaps, Stadia) for the map feature.
- Ingest and estimation are plain TypeScript scripts run from the CLI. No queue or workers in v1.

**Design system** (see `packages/shared/src/theme/`):
- Palette from Bloom moodboard: peach accent `#E8926F`, cream `#F4EEE0`, mid blue `#3173AD`, navy `#193857`
- Light and dark themes with WCAG AA contrast compliance
- Editorial typography: serif display headings, clean sans for UI
- Calm motion: 150-400ms durations, strong ease-out curves

**Mascot**: Rocco, a reformed Toronto raccoon. Used sparingly in onboarding, empty states, loading, and success moments.

Modules, one job each:

| Module | Job |
|---|---|
| `packages/shared/` | Theme tokens, types, nutrition engine, mascot assets |
| `apps/api/db/` | Schema, migrations, typed queries. |
| `apps/api/ingest/fdc` | Import the FDC subset into `fdc_food` and `fdc_nutrient`. |
| `apps/api/ingest/osm` | Extract to `place` rows. |
| `apps/api/ingest/dinesafe` | Match DineSafe records to `place`. |
| `apps/api/curate/` | Validate and load YAML places, dishes and ingredients. |
| `apps/api/routes/` | API endpoints for dishes, places, search. |
| `apps/mobile/` | Screens, components, and map UI. |

## 4. How estimation works

1. **Dish to ingredients.** Each `dish_ingredient` has grams, from the restaurant if published (`published`) or our guess (`guessed`).
2. **Ingredient to FDC.** Each `ingredient` points at one `fdc_id`. Prefer Foundation, SR Legacy or FNDDS. Use Branded only for chain products. Prefer the cooked FDC entry when the dish is cooked. We don't model cooking loss in v1.
3. **Scale.** Nutrient = per-100 g value × grams / 100, for each of the six nutrients.
4. **Sum** to a per-serving total.
5. **Confidence and range.** Apply the rules in §1. Unmatched mass widens the range, and sodium gets a wider range than the other nutrients.
6. **Official override.** If the restaurant publishes numbers, store those as `official` with the source URL. Keep the computed estimate alongside for comparison, never shown as the headline. Published calories are rounded under O. Reg. 50/16 s.6, so we don't expect an exact match. [reg](https://www.ontario.ca/laws/regulation/160050)
7. **Version.** Each row stores `engine_version`, so we can recompute when FDC data or rules change.

**Diet goals** (see `packages/shared/src/nutrition/goals.ts`) are named predicates over per-serving nutrients:
- High Protein: ≥25g protein
- Low Carb: ≤20g carbs
- Low Calorie: ≤400 kcal
- High Fiber: ≥8g fiber
- Low Sodium: ≤600mg sodium

Dishes with `low` confidence are shown with a warning in results, and the user can hide them.

## 5. Milestones (each is one draft PR, merged to main)

| # | PR | Tested by |
|---|---|---|
| M0 | Scaffold: Expo + Hono monorepo, TS strict, lint, CI, Postgres/PostGIS in Docker, base migration, theme tokens | Migrations apply and roll back. Typecheck passes. Tests pass. |
| M1 | `ingest/fdc`: import the subset, store attribution | Fixture CSV in, expected rows out. Re-import is idempotent. |
| M2 | `estimate/`: totals, range, confidence (in shared package) | Hand-calculated golden dishes. Linear scaling of grams. Adding an unmatched ingredient never raises confidence. |
| M3 | `curate/`: YAML loader and validator, seed about 20 places and 100 dishes | Schema rejects bad rows. A seed dish's computed totals match a hand check. |
| M4 | **Feature 1.** Dish detail screen with nutrition panel and Estimate label | Component tests. Playwright: label shown unless `official`, and the source link works. |
| M5 | `goals/` and `search/` SQL | Table-driven boundary tests. SQL results equal the in-memory predicate on seed data. |
| M6 | **Feature 2.** Search screen, goal chips, hide-low-confidence toggle | API test against seeded DB. Playwright: filter changes the result list. |
| M7 | `ingest/osm` (GTA extract via osmium) and `ingest/dinesafe` matching | Small fixture extract. Dedupe test. Attribution strings present. |
| M8 | **Feature 3.** MapLibre map with `ST_DWithin` nearby query | Query returns the expected ids for a fixture point. Playwright: pins render, attribution visible. |
| M8b | *Optional.* Google Places enrichment behind a flag (§5b) | Flag off: zero requests to Google. Matching fixtures. Nothing from Google persisted. Playwright with Google mocked. |
| M9 | Hardening: rate limits, disclaimers page, privacy | Location is never stored (checked in a test). Limits enforced. |

## 5b. Optional: Google Places enrichment (M8b, after M8, before M9)

**OSM stays the source of truth** for place identity, location, search and the MapLibre map. Google adds rating, opening hours and photos to one screen, live, on request. With the flag off, the app is exactly the M8 app.

**Rules (from the terms, re-read 2026-10-27):**
- **Nothing cached except IDs.** We store only `place.google_place_id`, `google_match_status` (`matched` / `none` / `stale`) and `google_checked_at`. Place IDs are exempt from the caching ban. The service terms (§14.3) allow lat/lng to be cached "temporarily … up to 30 consecutive calendar days"; we cache none, because our coordinates come from OSM. No Google content goes into the DB, search index, logs or the estimate engine. Using Google content to create other content is barred (ToS §3.2.3(c)), so Google data never feeds search, ranking or goal tags.
- **Google map only.** Google content appears only on the place detail page, next to a Google map (Maps JavaScript API). ToS §3.2.3(e) bars Places content on a non-Google map and bars Google and non-Google maps together. So the detail page has no MapLibre map, and the M8 map never shows Google data.
- **Attribution and terms.** Show Google's attribution unaltered. Our terms page must say the app uses Google Maps and link the Google Maps End User Additional Terms and Google Privacy Policy (ToS §3.2.2(a)); this goes into M9. Photos carry author attribution.
- **Fields requested:** `rating`, `userRatingCount`, `regularOpeningHours`, `photos`, `googleMapsUri`, plus `displayName` and `location` for match checking only. No reviews or AI summaries (extra attribution rules, higher SKU).
- **No user location is sent to Google.** Only the place ID.

**Feature flag.** `GOOGLE_PLACES_ENABLED` (default `false`) and `GOOGLE_MAPS_API_KEY` must both be set. When off, the enrichment route returns 404, the panel isn't rendered, and the Maps JS script isn't loaded.

**Unresolved risk.** ToS §3.2.3(d)(iii) says the Core Services must not be used "in a listings or directory service". A restaurant finder could be read that way. Our argument is that nutrition data gives the app substantial independent value, but that is not a guarantee. Get counsel's view, or Google's, before building M8b.

## 6. Non-goals for v1

- No ordering or delivery.
- No scraping of any delivery app.
- No medical or allergen advice. A wrong allergen estimate is dangerous, so allergens are out entirely.
- No photo-based or AI-guessed dishes shown as facts.
- No user accounts, reviews or ratings.
- No Google Places data in the core. Optional live enrichment only (§5b).
- No mobile-only features (uses Expo for cross-platform including web).
- No full-GTA menu coverage. v1 is curated, with a small seed.

## 7. Top risks

1. **Estimate error read as fact.** Restaurant portions, oils and salt vary. Mitigation: the confidence label, ranges, and an "official" tier.
2. **Menu data supply.** Hand curation doesn't scale, and the legal route to bulk menus is unclear. We have to choose a path (partnerships, restaurant submissions, or published nutrition PDFs).
3. **Licence obligations.** ODbL share-alike (OSM, OFF) and attribution everywhere. Whether our combined database counts as a derivative of OSM needs a lawyer's view before publishing data.
4. **Source drift.** The DineSafe dataset's status is unclear. Overpass and OSM tile policies limit us, so we need our own extract and tiles.
5. **Google terms.** The "directory service" clause (§5b) could block M8b. Google can also change prices or terms.
6. **"Healthy" is contested.** Wrong thresholds mislead people. Mitigation: show the numbers next to every tag, and keep the thresholds configurable.

## 8. Open questions

- Which tile provider? What is the cost?
- Goal thresholds: are they per serving or per 100 kcal, and who decides?
- Which DineSafe dataset and package is current?
- Is the CNF licence compatible with our use?
- Which route for menu data: restaurant submissions, partnerships, or manual only?
- Is M8b allowed for a restaurant finder, given the directory-service clause?
- Name: NutriTO is the working title.
