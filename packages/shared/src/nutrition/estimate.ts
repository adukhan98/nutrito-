/**
 * Nutrition Estimation Engine
 *
 * Pure functions for calculating nutrition totals, ranges, and confidence.
 * No I/O - all data is passed in.
 *
 * From the architecture doc (§4):
 * 1. Dish → ingredients (grams from restaurant or guessed)
 * 2. Ingredient → FDC (prefer Foundation, SR Legacy, FNDDS)
 * 3. Scale: nutrient = per-100g × grams / 100
 * 4. Sum to per-serving total
 * 5. Confidence and range based on data quality
 * 6. Official override if restaurant publishes numbers
 */

import type {
  Confidence,
  NutritionPerServing,
  NutritionEstimate,
  FdcNutrient,
  DishIngredient,
  GramsBasis,
} from '../types';

// Engine version for tracking recomputation
export const ENGINE_VERSION = '1.0.0';

// Configuration for confidence and range calculations
export interface EstimationConfig {
  // Percentage of dish mass that must be matched to FDC for 'medium' or higher
  unmatchedMassThresholdPercent: number;
  // Range multipliers for kcal estimates by confidence
  rangeMultipliers: {
    high: number;
    medium: number;
    low: number;
  };
  // Sodium gets wider range due to restaurant variation
  sodiumRangeMultiplier: number;
}

export const DEFAULT_CONFIG: EstimationConfig = {
  unmatchedMassThresholdPercent: 10,
  rangeMultipliers: {
    high: 0.05, // ±5%
    medium: 0.15, // ±15%
    low: 0.30, // ±30%
  },
  sodiumRangeMultiplier: 2.0,
};

// Input for a single ingredient in the estimation
export interface IngredientInput {
  ingredient_id: string;
  grams: number;
  grams_basis: GramsBasis;
  nutrients?: FdcNutrient; // undefined if unmatched
}

// Result of scaling a single ingredient
interface ScaledNutrients {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  grams: number;
  matched: boolean;
  gramsPublished: boolean;
}

/**
 * Scale nutrients from per-100g to actual grams.
 * Returns zeroes if no FDC match.
 */
export function scaleNutrients(
  nutrients: FdcNutrient | undefined,
  grams: number,
  gramsBasis: GramsBasis
): ScaledNutrients {
  if (!nutrients) {
    return {
      kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sodium_mg: 0,
      grams,
      matched: false,
      gramsPublished: gramsBasis === 'published',
    };
  }

  const factor = grams / 100;
  return {
    kcal: nutrients.kcal_per_100g * factor,
    protein_g: nutrients.protein_per_100g * factor,
    carbs_g: nutrients.carbs_per_100g * factor,
    fat_g: nutrients.fat_per_100g * factor,
    fiber_g: nutrients.fiber_per_100g * factor,
    sodium_mg: nutrients.sodium_per_100g * factor,
    grams,
    matched: true,
    gramsPublished: gramsBasis === 'published',
  };
}

/**
 * Sum nutrients from multiple ingredients.
 */
export function sumNutrients(items: ScaledNutrients[]): NutritionPerServing {
  return items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein_g: acc.protein_g + item.protein_g,
      carbs_g: acc.carbs_g + item.carbs_g,
      fat_g: acc.fat_g + item.fat_g,
      fiber_g: acc.fiber_g + item.fiber_g,
      sodium_mg: acc.sodium_mg + item.sodium_mg,
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sodium_mg: 0 }
  );
}

/**
 * Determine confidence level based on ingredient matching and gram sources.
 *
 * Rules from architecture doc:
 * - 'high': all ingredients matched, grams from restaurant
 * - 'medium': all ingredients matched, grams guessed
 * - 'low': meaningful share of mass unmatched
 */
export function determineConfidence(
  items: ScaledNutrients[],
  config: EstimationConfig = DEFAULT_CONFIG
): Confidence {
  if (items.length === 0) return 'low';

  const totalGrams = items.reduce((sum, item) => sum + item.grams, 0);
  const unmatchedGrams = items
    .filter((item) => !item.matched)
    .reduce((sum, item) => sum + item.grams, 0);

  const unmatchedPercent = (unmatchedGrams / totalGrams) * 100;

  // If too much mass is unmatched, confidence is low
  if (unmatchedPercent > config.unmatchedMassThresholdPercent) {
    return 'low';
  }

  // All matched - check if grams are published or guessed
  const allGramsPublished = items.every((item) => item.gramsPublished);

  return allGramsPublished ? 'high' : 'medium';
}

/**
 * Calculate kcal range based on confidence level.
 */
export function calculateRange(
  kcal: number,
  confidence: Confidence,
  config: EstimationConfig = DEFAULT_CONFIG
): { low: number; high: number } {
  if (confidence === 'official') {
    // Official numbers have no range
    return { low: kcal, high: kcal };
  }

  const multiplier = config.rangeMultipliers[confidence];
  return {
    low: Math.round(kcal * (1 - multiplier)),
    high: Math.round(kcal * (1 + multiplier)),
  };
}

/**
 * Main estimation function: compute nutrition from ingredients.
 */
export function estimateNutrition(
  ingredients: IngredientInput[],
  sourceId: string,
  config: EstimationConfig = DEFAULT_CONFIG
): NutritionEstimate {
  // Scale each ingredient
  const scaled = ingredients.map((ing) =>
    scaleNutrients(ing.nutrients, ing.grams, ing.grams_basis)
  );

  // Sum totals
  const totals = sumNutrients(scaled);

  // Determine confidence
  const confidence = determineConfidence(scaled, config);

  // Calculate range
  const range = calculateRange(totals.kcal, confidence, config);

  // Round values
  return {
    kcal: Math.round(totals.kcal),
    protein_g: Math.round(totals.protein_g * 10) / 10,
    carbs_g: Math.round(totals.carbs_g * 10) / 10,
    fat_g: Math.round(totals.fat_g * 10) / 10,
    fiber_g: Math.round(totals.fiber_g * 10) / 10,
    sodium_mg: Math.round(totals.sodium_mg),
    kcal_low: range.low,
    kcal_high: range.high,
    method: 'ingredient_sum',
    confidence,
    source_id: sourceId,
    engine_version: ENGINE_VERSION,
    computed_at: new Date(),
  };
}

/**
 * Create an official estimate from restaurant-published numbers.
 * Keeps computed estimate alongside for comparison (never shown as headline).
 */
export function createOfficialEstimate(
  published: NutritionPerServing,
  sourceId: string
): NutritionEstimate {
  return {
    ...published,
    kcal_low: published.kcal,
    kcal_high: published.kcal,
    method: 'restaurant_published',
    confidence: 'official',
    source_id: sourceId,
    engine_version: ENGINE_VERSION,
    computed_at: new Date(),
  };
}

/**
 * Invariant: adding an unmatched ingredient should never raise confidence.
 * This is enforced by determineConfidence - more unmatched mass = lower confidence.
 */
export function addIngredient(
  currentIngredients: IngredientInput[],
  newIngredient: IngredientInput,
  sourceId: string,
  config: EstimationConfig = DEFAULT_CONFIG
): NutritionEstimate {
  const allIngredients = [...currentIngredients, newIngredient];
  return estimateNutrition(allIngredients, sourceId, config);
}
