# NutriTO

A cross-platform app for finding healthy food in the Greater Toronto Area, featuring:

- **Nutrition per dish**: calories, protein, carbs, fat, fiber, sodium estimates
- **Search by diet goal**: high protein, low carb, and other filters
- **Map of healthy spots**: find restaurants near you

## Status

Early development. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design.

## Project Structure

```
apps/
  mobile/     # Expo app (iOS, Android, Web) with Expo Router
  api/        # Hono API server on Node.js
packages/
  shared/     # Types, theme tokens, nutrition engine
```

## Setup

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (for local Postgres/PostGIS)
- iOS Simulator (macOS) or Android Emulator for mobile dev

### Install Dependencies

```bash
npm install
```

### Start Database

```bash
docker compose up -d
```

### Run Migrations

```bash
npm run db:migrate -w @nutrito/api
```

### Start Development

API server:
```bash
npm run dev:api
```

Mobile app:
```bash
npm run dev:mobile
```

Then press `w` for web, `i` for iOS simulator, or `a` for Android emulator.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev:api` | Start API dev server |
| `npm run dev:mobile` | Start Expo dev server |
| `npm run build:mobile` | Build web export |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | Typecheck all packages |
| `npm run db:migrate` | Run database migrations |
| `npm run db:rollback` | Rollback last migration |

## Data Attribution

- Place data from [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL)
- Nutrition data from [USDA FoodData Central](https://fdc.nal.usda.gov/) (Public Domain)
- Toronto inspection data from [Toronto Open Data](https://open.toronto.ca/) (Open Government Licence – Toronto)

## License

See LICENSE file.
