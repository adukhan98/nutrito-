/**
 * NutriTO Core Types
 *
 * Based on the architecture document's data model.
 */

// Confidence levels for nutrition estimates
export type Confidence = 'official' | 'high' | 'medium' | 'low';

// Gram basis for dish ingredients
export type GramsBasis = 'published' | 'guessed';

// Source kinds for provenance tracking
export type SourceKind =
  | 'restaurant_published'
  | 'fdc'
  | 'osm'
  | 'dinesafe'
  | 'manual';

// Google Places matching status (for optional M8b)
export type GoogleMatchStatus = 'matched' | 'none' | 'stale';

// Core nutrition data per serving
export interface NutritionPerServing {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
}

// Nutrition estimate with range and confidence
export interface NutritionEstimate extends NutritionPerServing {
  kcal_low: number;
  kcal_high: number;
  method: string;
  confidence: Confidence;
  source_id: string;
  engine_version: string;
  computed_at: Date;
}

// A place (restaurant or shop)
export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  osm_id?: string;
  dinesafe_id?: string;
  chain_name?: string;
  // Google Places fields (M8b only)
  google_place_id?: string;
  google_match_status?: GoogleMatchStatus;
  google_checked_at?: Date;
}

// A dish at a place
export interface Dish {
  id: string;
  place_id: string;
  name: string;
  serving_desc: string;
  serving_g?: number;
  menu_source_url: string;
  menu_checked_at: Date;
  nutrition?: NutritionEstimate;
}

// A canonical ingredient mapped to FDC
export interface Ingredient {
  id: string;
  name: string;
  fdc_id: number;
  match_note?: string;
}

// Recipe line: ingredient in a dish
export interface DishIngredient {
  dish_id: string;
  ingredient_id: string;
  grams: number;
  grams_basis: GramsBasis;
}

// Provenance record
export interface Source {
  id: string;
  kind: SourceKind;
  url?: string;
  retrieved_at: Date;
  license?: string;
  attribution?: string;
}

// FDC food data
export interface FdcFood {
  fdc_id: number;
  description: string;
  data_type: string;
}

// FDC nutrient data (per 100g)
export interface FdcNutrient {
  fdc_id: number;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  sodium_per_100g: number;
}

// Diet goals - named predicates over nutrition
export type DietGoal =
  | 'high_protein'
  | 'low_carb'
  | 'low_calorie'
  | 'high_fiber'
  | 'low_sodium';

export interface DietGoalDefinition {
  id: DietGoal;
  name: string;
  description: string;
  predicate: (nutrition: NutritionPerServing) => boolean;
}

// Search filters
export interface SearchFilters {
  goals?: DietGoal[];
  minConfidence?: Confidence;
  maxKcal?: number;
  minProtein?: number;
  maxCarbs?: number;
  nearbyOnly?: boolean;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
}

// API response types
export interface DishWithPlace extends Dish {
  place: Place;
}

export interface SearchResult {
  dishes: DishWithPlace[];
  total: number;
  offset: number;
  limit: number;
}

export interface PlaceWithDishes extends Place {
  dishes: Dish[];
  dish_count: number;
}

export interface NearbyResult {
  places: PlaceWithDishes[];
  center: { latitude: number; longitude: number };
  radius_meters: number;
}
