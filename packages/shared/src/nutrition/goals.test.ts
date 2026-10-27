import { describe, it, expect } from 'vitest';
import {
  DIET_GOALS,
  GOAL_THRESHOLDS,
  getGoalById,
  meetsGoal,
  getMatchingGoals,
  meetsAllGoals,
  meetsAnyGoal,
} from './goals';
import type { NutritionPerServing } from '../types';

// Test fixtures
const highProteinMeal: NutritionPerServing = {
  kcal: 350,
  protein_g: 40,
  carbs_g: 15,
  fat_g: 12,
  fiber_g: 4,
  sodium_mg: 500,
};

const lowCarbMeal: NutritionPerServing = {
  kcal: 280,
  protein_g: 20,
  carbs_g: 10,
  fat_g: 18,
  fiber_g: 3,
  sodium_mg: 400,
};

const balancedMeal: NutritionPerServing = {
  kcal: 500,
  protein_g: 30,
  carbs_g: 45,
  fat_g: 20,
  fiber_g: 8,
  sodium_mg: 700,
};

const highFiberMeal: NutritionPerServing = {
  kcal: 320,
  protein_g: 15,
  carbs_g: 50,
  fat_g: 8,
  fiber_g: 12,
  sodium_mg: 300,
};

const indulgentMeal: NutritionPerServing = {
  kcal: 850,
  protein_g: 35,
  carbs_g: 80,
  fat_g: 45,
  fiber_g: 2,
  sodium_mg: 1500,
};

describe('DIET_GOALS', () => {
  it('has all required goals defined', () => {
    const goalIds = DIET_GOALS.map((g) => g.id);

    expect(goalIds).toContain('high_protein');
    expect(goalIds).toContain('low_carb');
    expect(goalIds).toContain('low_calorie');
    expect(goalIds).toContain('high_fiber');
    expect(goalIds).toContain('low_sodium');
  });

  it('each goal has name, description, and predicate', () => {
    for (const goal of DIET_GOALS) {
      expect(goal.name).toBeTruthy();
      expect(goal.description).toBeTruthy();
      expect(typeof goal.predicate).toBe('function');
    }
  });
});

describe('getGoalById', () => {
  it('returns goal definition for valid id', () => {
    const goal = getGoalById('high_protein');

    expect(goal).toBeDefined();
    expect(goal?.id).toBe('high_protein');
    expect(goal?.name).toBe('High Protein');
  });

  it('returns undefined for invalid id', () => {
    // @ts-expect-error - testing invalid input
    const goal = getGoalById('invalid_goal');

    expect(goal).toBeUndefined();
  });
});

describe('meetsGoal', () => {
  describe('high_protein', () => {
    it('returns true when protein >= threshold', () => {
      expect(meetsGoal(highProteinMeal, 'high_protein')).toBe(true);
      // Exactly at threshold
      expect(
        meetsGoal(
          { ...balancedMeal, protein_g: GOAL_THRESHOLDS.HIGH_PROTEIN_MIN_G },
          'high_protein'
        )
      ).toBe(true);
    });

    it('returns false when protein < threshold', () => {
      expect(meetsGoal(lowCarbMeal, 'high_protein')).toBe(false);
    });
  });

  describe('low_carb', () => {
    it('returns true when carbs <= threshold', () => {
      expect(meetsGoal(lowCarbMeal, 'low_carb')).toBe(true);
      // Exactly at threshold
      expect(
        meetsGoal(
          { ...balancedMeal, carbs_g: GOAL_THRESHOLDS.LOW_CARB_MAX_G },
          'low_carb'
        )
      ).toBe(true);
    });

    it('returns false when carbs > threshold', () => {
      expect(meetsGoal(balancedMeal, 'low_carb')).toBe(false);
    });
  });

  describe('low_calorie', () => {
    it('returns true when kcal <= threshold', () => {
      expect(meetsGoal(lowCarbMeal, 'low_calorie')).toBe(true);
    });

    it('returns false when kcal > threshold', () => {
      expect(meetsGoal(indulgentMeal, 'low_calorie')).toBe(false);
    });
  });

  describe('high_fiber', () => {
    it('returns true when fiber >= threshold', () => {
      expect(meetsGoal(highFiberMeal, 'high_fiber')).toBe(true);
      expect(meetsGoal(balancedMeal, 'high_fiber')).toBe(true); // 8g exactly
    });

    it('returns false when fiber < threshold', () => {
      expect(meetsGoal(lowCarbMeal, 'high_fiber')).toBe(false);
    });
  });

  describe('low_sodium', () => {
    it('returns true when sodium <= threshold', () => {
      expect(meetsGoal(lowCarbMeal, 'low_sodium')).toBe(true);
      expect(meetsGoal(highProteinMeal, 'low_sodium')).toBe(true);
    });

    it('returns false when sodium > threshold', () => {
      expect(meetsGoal(indulgentMeal, 'low_sodium')).toBe(false);
    });
  });
});

describe('getMatchingGoals', () => {
  it('returns all matching goals for a meal', () => {
    const goals = getMatchingGoals(highProteinMeal);

    expect(goals).toContain('high_protein');
    expect(goals).toContain('low_carb');
    expect(goals).toContain('low_calorie');
    expect(goals).toContain('low_sodium');
    expect(goals).not.toContain('high_fiber');
  });

  it('returns empty array when no goals match', () => {
    const goals = getMatchingGoals(indulgentMeal);

    // High protein matches (35g >= 25g)
    expect(goals).toContain('high_protein');
    // But not low calorie, low carb, low sodium, or high fiber
    expect(goals).not.toContain('low_calorie');
    expect(goals).not.toContain('low_carb');
    expect(goals).not.toContain('low_sodium');
    expect(goals).not.toContain('high_fiber');
  });

  it('returns multiple goals for well-rounded healthy meal', () => {
    const healthyMeal: NutritionPerServing = {
      kcal: 350,
      protein_g: 30,
      carbs_g: 18,
      fat_g: 15,
      fiber_g: 10,
      sodium_mg: 400,
    };

    const goals = getMatchingGoals(healthyMeal);

    expect(goals).toContain('high_protein');
    expect(goals).toContain('low_carb');
    expect(goals).toContain('low_calorie');
    expect(goals).toContain('high_fiber');
    expect(goals).toContain('low_sodium');
    expect(goals.length).toBe(5);
  });
});

describe('meetsAllGoals', () => {
  it('returns true when all specified goals are met', () => {
    expect(meetsAllGoals(highProteinMeal, ['high_protein', 'low_carb'])).toBe(true);
  });

  it('returns false when any goal is not met', () => {
    expect(meetsAllGoals(highProteinMeal, ['high_protein', 'high_fiber'])).toBe(false);
  });

  it('returns true for empty goals array', () => {
    expect(meetsAllGoals(indulgentMeal, [])).toBe(true);
  });
});

describe('meetsAnyGoal', () => {
  it('returns true when at least one goal is met', () => {
    expect(meetsAnyGoal(highProteinMeal, ['high_protein', 'high_fiber'])).toBe(true);
  });

  it('returns false when no goals are met', () => {
    const noGoalMeal: NutritionPerServing = {
      kcal: 600,
      protein_g: 15,
      carbs_g: 60,
      fat_g: 30,
      fiber_g: 3,
      sodium_mg: 1000,
    };

    expect(meetsAnyGoal(noGoalMeal, ['low_calorie', 'low_carb', 'high_fiber'])).toBe(false);
  });

  it('returns false for empty goals array', () => {
    expect(meetsAnyGoal(highProteinMeal, [])).toBe(false);
  });
});

describe('boundary conditions', () => {
  it('handles exactly-at-threshold values correctly', () => {
    const atThreshold: NutritionPerServing = {
      kcal: GOAL_THRESHOLDS.LOW_CALORIE_MAX_KCAL,
      protein_g: GOAL_THRESHOLDS.HIGH_PROTEIN_MIN_G,
      carbs_g: GOAL_THRESHOLDS.LOW_CARB_MAX_G,
      fat_g: 10,
      fiber_g: GOAL_THRESHOLDS.HIGH_FIBER_MIN_G,
      sodium_mg: GOAL_THRESHOLDS.LOW_SODIUM_MAX_MG,
    };

    expect(meetsGoal(atThreshold, 'low_calorie')).toBe(true);
    expect(meetsGoal(atThreshold, 'high_protein')).toBe(true);
    expect(meetsGoal(atThreshold, 'low_carb')).toBe(true);
    expect(meetsGoal(atThreshold, 'high_fiber')).toBe(true);
    expect(meetsGoal(atThreshold, 'low_sodium')).toBe(true);
  });

  it('handles one-under-threshold correctly', () => {
    const justUnder: NutritionPerServing = {
      kcal: GOAL_THRESHOLDS.LOW_CALORIE_MAX_KCAL + 1,
      protein_g: GOAL_THRESHOLDS.HIGH_PROTEIN_MIN_G - 1,
      carbs_g: GOAL_THRESHOLDS.LOW_CARB_MAX_G + 1,
      fat_g: 10,
      fiber_g: GOAL_THRESHOLDS.HIGH_FIBER_MIN_G - 1,
      sodium_mg: GOAL_THRESHOLDS.LOW_SODIUM_MAX_MG + 1,
    };

    expect(meetsGoal(justUnder, 'low_calorie')).toBe(false);
    expect(meetsGoal(justUnder, 'high_protein')).toBe(false);
    expect(meetsGoal(justUnder, 'low_carb')).toBe(false);
    expect(meetsGoal(justUnder, 'high_fiber')).toBe(false);
    expect(meetsGoal(justUnder, 'low_sodium')).toBe(false);
  });
});
