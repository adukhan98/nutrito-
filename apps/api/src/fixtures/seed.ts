/**
 * Test fixtures for NutriTO API
 *
 * Small curated dataset for development and testing until the
 * data-pipeline (owned by Codex agent) lands with real GTA data.
 *
 * All data is hand-curated and clearly marked as such.
 * No restaurant-published numbers are claimed.
 */

import type {
  Place,
  Dish,
  NutritionEstimate,
  Confidence,
} from '@nutrito/shared';

// Toronto coordinates (roughly downtown)
const TORONTO_LAT = 43.6532;
const TORONTO_LNG = -79.3832;

export const FIXTURE_PLACES: Omit<Place, 'id'>[] = [
  {
    name: 'Fresh Kitchen',
    address: '123 Queen St W, Toronto, ON M5H 2M9',
    latitude: TORONTO_LAT + 0.002,
    longitude: TORONTO_LNG - 0.005,
    osm_id: 'node/123456789',
  },
  {
    name: 'Green Bowl Co',
    address: '456 King St E, Toronto, ON M5A 1L6',
    latitude: TORONTO_LAT - 0.003,
    longitude: TORONTO_LNG + 0.008,
    osm_id: 'node/987654321',
  },
  {
    name: 'Protein Plus',
    address: '789 Yonge St, Toronto, ON M4W 2G8',
    latitude: TORONTO_LAT + 0.01,
    longitude: TORONTO_LNG + 0.002,
    osm_id: 'node/456789123',
  },
  {
    name: 'The Salad Station',
    address: '321 Bloor St W, Toronto, ON M5S 1W7',
    latitude: TORONTO_LAT + 0.015,
    longitude: TORONTO_LNG - 0.01,
    osm_id: 'node/789123456',
  },
  {
    name: 'Nourish Cafe',
    address: '555 College St, Toronto, ON M6G 1B2',
    latitude: TORONTO_LAT + 0.008,
    longitude: TORONTO_LNG - 0.02,
    osm_id: 'node/321654987',
  },
];

// Fixture nutrition estimates - these are ESTIMATES, not official
// Each is marked with confidence level and method
export interface FixtureDish {
  name: string;
  placeIndex: number; // Index into FIXTURE_PLACES
  serving_desc: string;
  serving_g?: number;
  menu_source_url: string;
  nutrition: {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg: number;
    confidence: Confidence;
  };
}

export const FIXTURE_DISHES: FixtureDish[] = [
  // Fresh Kitchen dishes
  {
    name: 'Grilled Chicken Power Bowl',
    placeIndex: 0,
    serving_desc: '1 bowl (400g)',
    serving_g: 400,
    menu_source_url: 'https://example.com/menu/fresh-kitchen',
    nutrition: {
      kcal: 520,
      protein_g: 42,
      carbs_g: 45,
      fat_g: 18,
      fiber_g: 8,
      sodium_mg: 680,
      confidence: 'medium',
    },
  },
  {
    name: 'Mediterranean Quinoa Salad',
    placeIndex: 0,
    serving_desc: '1 bowl (350g)',
    serving_g: 350,
    menu_source_url: 'https://example.com/menu/fresh-kitchen',
    nutrition: {
      kcal: 380,
      protein_g: 14,
      carbs_g: 52,
      fat_g: 15,
      fiber_g: 9,
      sodium_mg: 520,
      confidence: 'medium',
    },
  },
  {
    name: 'Salmon Poke Bowl',
    placeIndex: 0,
    serving_desc: '1 bowl (380g)',
    serving_g: 380,
    menu_source_url: 'https://example.com/menu/fresh-kitchen',
    nutrition: {
      kcal: 480,
      protein_g: 35,
      carbs_g: 48,
      fat_g: 16,
      fiber_g: 5,
      sodium_mg: 890,
      confidence: 'medium',
    },
  },

  // Green Bowl Co dishes
  {
    name: 'Kale Caesar Salad',
    placeIndex: 1,
    serving_desc: '1 large (320g)',
    serving_g: 320,
    menu_source_url: 'https://example.com/menu/green-bowl',
    nutrition: {
      kcal: 340,
      protein_g: 18,
      carbs_g: 22,
      fat_g: 22,
      fiber_g: 6,
      sodium_mg: 720,
      confidence: 'medium',
    },
  },
  {
    name: 'Vegan Buddha Bowl',
    placeIndex: 1,
    serving_desc: '1 bowl (420g)',
    serving_g: 420,
    menu_source_url: 'https://example.com/menu/green-bowl',
    nutrition: {
      kcal: 450,
      protein_g: 16,
      carbs_g: 62,
      fat_g: 18,
      fiber_g: 14,
      sodium_mg: 480,
      confidence: 'medium',
    },
  },
  {
    name: 'Tofu Teriyaki Bowl',
    placeIndex: 1,
    serving_desc: '1 bowl (400g)',
    serving_g: 400,
    menu_source_url: 'https://example.com/menu/green-bowl',
    nutrition: {
      kcal: 520,
      protein_g: 22,
      carbs_g: 68,
      fat_g: 16,
      fiber_g: 7,
      sodium_mg: 980,
      confidence: 'low',
    },
  },

  // Protein Plus dishes
  {
    name: 'Double Chicken Breast Plate',
    placeIndex: 2,
    serving_desc: '1 plate (450g)',
    serving_g: 450,
    menu_source_url: 'https://example.com/menu/protein-plus',
    nutrition: {
      kcal: 580,
      protein_g: 62,
      carbs_g: 35,
      fat_g: 20,
      fiber_g: 5,
      sodium_mg: 750,
      confidence: 'high',
    },
  },
  {
    name: 'Steak & Eggs',
    placeIndex: 2,
    serving_desc: '1 plate (380g)',
    serving_g: 380,
    menu_source_url: 'https://example.com/menu/protein-plus',
    nutrition: {
      kcal: 650,
      protein_g: 55,
      carbs_g: 8,
      fat_g: 45,
      fiber_g: 2,
      sodium_mg: 920,
      confidence: 'medium',
    },
  },
  {
    name: 'Grilled Fish Tacos (3)',
    placeIndex: 2,
    serving_desc: '3 tacos (300g)',
    serving_g: 300,
    menu_source_url: 'https://example.com/menu/protein-plus',
    nutrition: {
      kcal: 420,
      protein_g: 32,
      carbs_g: 36,
      fat_g: 18,
      fiber_g: 4,
      sodium_mg: 680,
      confidence: 'medium',
    },
  },

  // The Salad Station dishes
  {
    name: 'Greek Salad',
    placeIndex: 3,
    serving_desc: '1 large (380g)',
    serving_g: 380,
    menu_source_url: 'https://example.com/menu/salad-station',
    nutrition: {
      kcal: 320,
      protein_g: 12,
      carbs_g: 18,
      fat_g: 24,
      fiber_g: 5,
      sodium_mg: 820,
      confidence: 'medium',
    },
  },
  {
    name: 'Cobb Salad',
    placeIndex: 3,
    serving_desc: '1 large (400g)',
    serving_g: 400,
    menu_source_url: 'https://example.com/menu/salad-station',
    nutrition: {
      kcal: 560,
      protein_g: 38,
      carbs_g: 16,
      fat_g: 40,
      fiber_g: 6,
      sodium_mg: 1100,
      confidence: 'medium',
    },
  },
  {
    name: 'Asian Sesame Chicken Salad',
    placeIndex: 3,
    serving_desc: '1 large (420g)',
    serving_g: 420,
    menu_source_url: 'https://example.com/menu/salad-station',
    nutrition: {
      kcal: 480,
      protein_g: 34,
      carbs_g: 32,
      fat_g: 24,
      fiber_g: 7,
      sodium_mg: 950,
      confidence: 'medium',
    },
  },

  // Nourish Cafe dishes
  {
    name: 'Acai Bowl',
    placeIndex: 4,
    serving_desc: '1 bowl (300g)',
    serving_g: 300,
    menu_source_url: 'https://example.com/menu/nourish-cafe',
    nutrition: {
      kcal: 380,
      protein_g: 8,
      carbs_g: 68,
      fat_g: 12,
      fiber_g: 10,
      sodium_mg: 45,
      confidence: 'medium',
    },
  },
  {
    name: 'Avocado Toast with Egg',
    placeIndex: 4,
    serving_desc: '2 slices (280g)',
    serving_g: 280,
    menu_source_url: 'https://example.com/menu/nourish-cafe',
    nutrition: {
      kcal: 420,
      protein_g: 18,
      carbs_g: 38,
      fat_g: 24,
      fiber_g: 8,
      sodium_mg: 580,
      confidence: 'medium',
    },
  },
  {
    name: 'Green Smoothie Bowl',
    placeIndex: 4,
    serving_desc: '1 bowl (350g)',
    serving_g: 350,
    menu_source_url: 'https://example.com/menu/nourish-cafe',
    nutrition: {
      kcal: 290,
      protein_g: 10,
      carbs_g: 52,
      fat_g: 8,
      fiber_g: 9,
      sodium_mg: 120,
      confidence: 'medium',
    },
  },
];

/**
 * Helper to calculate nutrition estimate fields from base nutrition
 */
export function makeNutritionEstimate(
  dishId: string,
  nutrition: FixtureDish['nutrition'],
  sourceId: string
): Omit<NutritionEstimate, 'computed_at'> & { computed_at: Date } {
  const rangeMultiplier =
    nutrition.confidence === 'high'
      ? 0.05
      : nutrition.confidence === 'medium'
        ? 0.15
        : 0.3;

  return {
    ...nutrition,
    kcal_low: Math.round(nutrition.kcal * (1 - rangeMultiplier)),
    kcal_high: Math.round(nutrition.kcal * (1 + rangeMultiplier)),
    method: 'ingredient_sum',
    source_id: sourceId,
    engine_version: '1.0.0',
    computed_at: new Date(),
  };
}
