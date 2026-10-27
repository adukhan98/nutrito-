export {
  ENGINE_VERSION,
  DEFAULT_CONFIG,
  scaleNutrients,
  sumNutrients,
  determineConfidence,
  calculateRange,
  estimateNutrition,
  createOfficialEstimate,
  addIngredient,
} from './estimate';

export type { EstimationConfig, IngredientInput } from './estimate';

export {
  GOAL_THRESHOLDS,
  DIET_GOALS,
  getGoalById,
  meetsGoal,
  getMatchingGoals,
  meetsAllGoals,
  meetsAnyGoal,
} from './goals';
