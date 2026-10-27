/**
 * Diet Goals - Named predicates over per-serving nutrients
 *
 * Thresholds documented below. These are per-serving values,
 * designed to help users find dishes that fit their dietary patterns.
 *
 * Rationale for thresholds:
 * - High Protein: ≥25g is roughly 50% of a typical 50g daily target in one meal
 * - Low Carb: ≤20g aligns with keto-friendly per-meal limits
 * - Low Calorie: ≤400 kcal is a reasonable light meal
 * - High Fiber: ≥8g is ~25-30% of daily 25-30g recommendation
 * - Low Sodium: ≤600mg is under 25% of 2300mg daily limit
 */

import type { DietGoal, DietGoalDefinition, NutritionPerServing } from '../types';

// Threshold constants - easily adjustable
export const GOAL_THRESHOLDS = {
  HIGH_PROTEIN_MIN_G: 25,
  LOW_CARB_MAX_G: 20,
  LOW_CALORIE_MAX_KCAL: 400,
  HIGH_FIBER_MIN_G: 8,
  LOW_SODIUM_MAX_MG: 600,
} as const;

export const DIET_GOALS: DietGoalDefinition[] = [
  {
    id: 'high_protein',
    name: 'High Protein',
    description: `At least ${GOAL_THRESHOLDS.HIGH_PROTEIN_MIN_G}g protein per serving`,
    predicate: (n: NutritionPerServing) =>
      n.protein_g >= GOAL_THRESHOLDS.HIGH_PROTEIN_MIN_G,
  },
  {
    id: 'low_carb',
    name: 'Low Carb',
    description: `${GOAL_THRESHOLDS.LOW_CARB_MAX_G}g or fewer carbs per serving`,
    predicate: (n: NutritionPerServing) =>
      n.carbs_g <= GOAL_THRESHOLDS.LOW_CARB_MAX_G,
  },
  {
    id: 'low_calorie',
    name: 'Low Calorie',
    description: `${GOAL_THRESHOLDS.LOW_CALORIE_MAX_KCAL} kcal or fewer per serving`,
    predicate: (n: NutritionPerServing) =>
      n.kcal <= GOAL_THRESHOLDS.LOW_CALORIE_MAX_KCAL,
  },
  {
    id: 'high_fiber',
    name: 'High Fiber',
    description: `At least ${GOAL_THRESHOLDS.HIGH_FIBER_MIN_G}g fiber per serving`,
    predicate: (n: NutritionPerServing) =>
      n.fiber_g >= GOAL_THRESHOLDS.HIGH_FIBER_MIN_G,
  },
  {
    id: 'low_sodium',
    name: 'Low Sodium',
    description: `${GOAL_THRESHOLDS.LOW_SODIUM_MAX_MG}mg or fewer sodium per serving`,
    predicate: (n: NutritionPerServing) =>
      n.sodium_mg <= GOAL_THRESHOLDS.LOW_SODIUM_MAX_MG,
  },
];

/**
 * Get goal definition by ID
 */
export function getGoalById(id: DietGoal): DietGoalDefinition | undefined {
  return DIET_GOALS.find((g) => g.id === id);
}

/**
 * Check if nutrition meets a specific goal
 */
export function meetsGoal(nutrition: NutritionPerServing, goalId: DietGoal): boolean {
  const goal = getGoalById(goalId);
  if (!goal) return false;
  return goal.predicate(nutrition);
}

/**
 * Get all goals that a dish meets
 */
export function getMatchingGoals(nutrition: NutritionPerServing): DietGoal[] {
  return DIET_GOALS.filter((goal) => goal.predicate(nutrition)).map((g) => g.id);
}

/**
 * Check if nutrition meets all specified goals
 */
export function meetsAllGoals(
  nutrition: NutritionPerServing,
  goals: DietGoal[]
): boolean {
  return goals.every((goalId) => meetsGoal(nutrition, goalId));
}

/**
 * Check if nutrition meets any of the specified goals
 */
export function meetsAnyGoal(
  nutrition: NutritionPerServing,
  goals: DietGoal[]
): boolean {
  return goals.some((goalId) => meetsGoal(nutrition, goalId));
}
