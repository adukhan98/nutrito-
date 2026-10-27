import { describe, it, expect } from 'vitest';
import {
  scaleNutrients,
  sumNutrients,
  determineConfidence,
  calculateRange,
  estimateNutrition,
  createOfficialEstimate,
  addIngredient,
  DEFAULT_CONFIG,
} from './estimate';
import type { FdcNutrient } from '../types';

// Sample FDC nutrient data (per 100g)
const chickenBreast: FdcNutrient = {
  fdc_id: 171077,
  kcal_per_100g: 165,
  protein_per_100g: 31,
  carbs_per_100g: 0,
  fat_per_100g: 3.6,
  fiber_per_100g: 0,
  sodium_per_100g: 74,
};

const brownRice: FdcNutrient = {
  fdc_id: 169704,
  kcal_per_100g: 123,
  protein_per_100g: 2.7,
  carbs_per_100g: 25.6,
  fat_per_100g: 1,
  fiber_per_100g: 1.6,
  sodium_per_100g: 4,
};

const broccoli: FdcNutrient = {
  fdc_id: 170379,
  kcal_per_100g: 34,
  protein_per_100g: 2.8,
  carbs_per_100g: 7,
  fat_per_100g: 0.4,
  fiber_per_100g: 2.6,
  sodium_per_100g: 33,
};

describe('scaleNutrients', () => {
  it('scales nutrients proportionally from per-100g', () => {
    const result = scaleNutrients(chickenBreast, 150, 'published');

    expect(result.kcal).toBeCloseTo(247.5);
    expect(result.protein_g).toBeCloseTo(46.5);
    expect(result.carbs_g).toBeCloseTo(0);
    expect(result.fat_g).toBeCloseTo(5.4);
    expect(result.matched).toBe(true);
    expect(result.gramsPublished).toBe(true);
  });

  it('returns zeros for unmatched ingredients', () => {
    const result = scaleNutrients(undefined, 100, 'guessed');

    expect(result.kcal).toBe(0);
    expect(result.protein_g).toBe(0);
    expect(result.matched).toBe(false);
    expect(result.gramsPublished).toBe(false);
  });

  it('handles zero grams correctly', () => {
    const result = scaleNutrients(chickenBreast, 0, 'published');

    expect(result.kcal).toBe(0);
    expect(result.protein_g).toBe(0);
  });
});

describe('sumNutrients', () => {
  it('sums multiple scaled ingredients', () => {
    const scaled = [
      scaleNutrients(chickenBreast, 150, 'published'),
      scaleNutrients(brownRice, 200, 'published'),
      scaleNutrients(broccoli, 100, 'published'),
    ];

    const result = sumNutrients(scaled);

    // 247.5 + 246 + 34 = 527.5
    expect(result.kcal).toBeCloseTo(527.5);
    // 46.5 + 5.4 + 2.8 = 54.7
    expect(result.protein_g).toBeCloseTo(54.7);
    // 0 + 51.2 + 7 = 58.2
    expect(result.carbs_g).toBeCloseTo(58.2);
  });

  it('handles empty array', () => {
    const result = sumNutrients([]);

    expect(result.kcal).toBe(0);
    expect(result.protein_g).toBe(0);
  });
});

describe('determineConfidence', () => {
  it('returns high when all matched and grams published', () => {
    const scaled = [
      scaleNutrients(chickenBreast, 150, 'published'),
      scaleNutrients(brownRice, 200, 'published'),
    ];

    expect(determineConfidence(scaled)).toBe('high');
  });

  it('returns medium when all matched but grams guessed', () => {
    const scaled = [
      scaleNutrients(chickenBreast, 150, 'guessed'),
      scaleNutrients(brownRice, 200, 'guessed'),
    ];

    expect(determineConfidence(scaled)).toBe('medium');
  });

  it('returns medium when mix of published and guessed', () => {
    const scaled = [
      scaleNutrients(chickenBreast, 150, 'published'),
      scaleNutrients(brownRice, 200, 'guessed'),
    ];

    expect(determineConfidence(scaled)).toBe('medium');
  });

  it('returns low when too much mass is unmatched', () => {
    const scaled = [
      scaleNutrients(chickenBreast, 100, 'published'),
      scaleNutrients(undefined, 50, 'guessed'), // 33% unmatched > 10% threshold
    ];

    expect(determineConfidence(scaled)).toBe('low');
  });

  it('returns low for empty array', () => {
    expect(determineConfidence([])).toBe('low');
  });
});

describe('calculateRange', () => {
  it('returns no range for official confidence', () => {
    const range = calculateRange(500, 'official');

    expect(range.low).toBe(500);
    expect(range.high).toBe(500);
  });

  it('returns ±5% for high confidence', () => {
    const range = calculateRange(500, 'high');

    expect(range.low).toBe(475);
    expect(range.high).toBe(525);
  });

  it('returns ±15% for medium confidence', () => {
    const range = calculateRange(500, 'medium');

    expect(range.low).toBe(425);
    expect(range.high).toBe(575);
  });

  it('returns ±30% for low confidence', () => {
    const range = calculateRange(500, 'low');

    expect(range.low).toBe(350);
    expect(range.high).toBe(650);
  });
});

describe('estimateNutrition', () => {
  it('produces complete estimate from ingredients', () => {
    const ingredients = [
      { ingredient_id: '1', grams: 150, grams_basis: 'published' as const, nutrients: chickenBreast },
      { ingredient_id: '2', grams: 200, grams_basis: 'published' as const, nutrients: brownRice },
      { ingredient_id: '3', grams: 100, grams_basis: 'published' as const, nutrients: broccoli },
    ];

    const result = estimateNutrition(ingredients, 'source-1');

    expect(result.kcal).toBe(528); // Rounded
    expect(result.protein_g).toBe(54.7);
    expect(result.confidence).toBe('high');
    expect(result.method).toBe('ingredient_sum');
    expect(result.source_id).toBe('source-1');
    expect(result.kcal_low).toBeLessThan(result.kcal);
    expect(result.kcal_high).toBeGreaterThan(result.kcal);
  });

  it('handles dishes with unmatched ingredients', () => {
    const ingredients = [
      { ingredient_id: '1', grams: 150, grams_basis: 'published' as const, nutrients: chickenBreast },
      { ingredient_id: '2', grams: 50, grams_basis: 'guessed' as const, nutrients: undefined },
    ];

    const result = estimateNutrition(ingredients, 'source-2');

    // Unmatched ingredient contributes 0 calories but counts toward mass
    expect(result.kcal).toBe(248); // Only chicken
    expect(result.confidence).toBe('low'); // Too much unmatched mass
  });
});

describe('createOfficialEstimate', () => {
  it('creates official estimate from published numbers', () => {
    const published = {
      kcal: 450,
      protein_g: 35,
      carbs_g: 40,
      fat_g: 15,
      fiber_g: 5,
      sodium_mg: 800,
    };

    const result = createOfficialEstimate(published, 'restaurant-source');

    expect(result.kcal).toBe(450);
    expect(result.confidence).toBe('official');
    expect(result.kcal_low).toBe(450);
    expect(result.kcal_high).toBe(450);
    expect(result.method).toBe('restaurant_published');
  });
});

describe('addIngredient invariant', () => {
  it('adding unmatched ingredient never raises confidence', () => {
    const initial = [
      { ingredient_id: '1', grams: 150, grams_basis: 'published' as const, nutrients: chickenBreast },
      { ingredient_id: '2', grams: 200, grams_basis: 'published' as const, nutrients: brownRice },
    ];

    const initialEstimate = estimateNutrition(initial, 'test');
    expect(initialEstimate.confidence).toBe('high');

    // Add unmatched ingredient
    const newIngredient = {
      ingredient_id: '3',
      grams: 50,
      grams_basis: 'guessed' as const,
      nutrients: undefined,
    };

    const withNew = addIngredient(initial, newIngredient, 'test');

    // Confidence should not increase
    const confidenceOrder = ['low', 'medium', 'high', 'official'];
    const initialIndex = confidenceOrder.indexOf(initialEstimate.confidence);
    const newIndex = confidenceOrder.indexOf(withNew.confidence);

    expect(newIndex).toBeLessThanOrEqual(initialIndex);
  });

  it('adding matched ingredient can maintain confidence', () => {
    const initial = [
      { ingredient_id: '1', grams: 150, grams_basis: 'published' as const, nutrients: chickenBreast },
    ];

    const newIngredient = {
      ingredient_id: '2',
      grams: 100,
      grams_basis: 'published' as const,
      nutrients: broccoli,
    };

    const initialEstimate = estimateNutrition(initial, 'test');
    const withNew = addIngredient(initial, newIngredient, 'test');

    expect(withNew.confidence).toBe(initialEstimate.confidence);
  });
});
