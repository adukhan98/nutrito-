import { Hono } from 'hono';
import { query, queryOne } from '../db/client.js';
import type { DietGoal, Confidence } from '@nutrito/shared';
import { GOAL_THRESHOLDS } from '@nutrito/shared';

const dishes = new Hono();

interface DishRow {
  id: string;
  place_id: string;
  name: string;
  serving_desc: string;
  serving_g: number | null;
  menu_source_url: string;
  menu_checked_at: Date;
  place_name: string;
  place_address: string;
  latitude: number;
  longitude: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  kcal_low: number;
  kcal_high: number;
  confidence: Confidence;
  method: string;
  engine_version: string;
}

// Get dish by ID with full nutrition details
dishes.get('/:id', async (c) => {
  const { id } = c.req.param();

  const dish = await queryOne<DishRow>(
    `SELECT 
      d.id, d.place_id, d.name, d.serving_desc, d.serving_g,
      d.menu_source_url, d.menu_checked_at,
      p.name as place_name, p.address as place_address,
      ST_Y(p.geom) as latitude, ST_X(p.geom) as longitude,
      n.kcal, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g, n.sodium_mg,
      n.kcal_low, n.kcal_high, n.confidence, n.method, n.engine_version
    FROM dish d
    JOIN place p ON d.place_id = p.id
    LEFT JOIN nutrition_estimate n ON d.id = n.dish_id
    WHERE d.id = $1`,
    [id]
  );

  if (!dish) {
    return c.json({ error: 'Dish not found' }, 404);
  }

  return c.json({
    id: dish.id,
    name: dish.name,
    serving_desc: dish.serving_desc,
    serving_g: dish.serving_g,
    menu_source_url: dish.menu_source_url,
    menu_checked_at: dish.menu_checked_at,
    place: {
      id: dish.place_id,
      name: dish.place_name,
      address: dish.place_address,
      latitude: dish.latitude,
      longitude: dish.longitude,
    },
    nutrition: dish.kcal
      ? {
          kcal: dish.kcal,
          protein_g: Number(dish.protein_g),
          carbs_g: Number(dish.carbs_g),
          fat_g: Number(dish.fat_g),
          fiber_g: Number(dish.fiber_g),
          sodium_mg: dish.sodium_mg,
          kcal_low: dish.kcal_low,
          kcal_high: dish.kcal_high,
          confidence: dish.confidence,
          method: dish.method,
          engine_version: dish.engine_version,
        }
      : null,
  });
});

// Search dishes with filters
dishes.get('/', async (c) => {
  const goals = c.req.query('goals')?.split(',') as DietGoal[] | undefined;
  const minConfidence = c.req.query('minConfidence') as Confidence | undefined;
  const placeId = c.req.query('placeId');
  const search = c.req.query('q');
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  // Text search on dish name
  if (search) {
    conditions.push(`d.name ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Filter by place
  if (placeId) {
    conditions.push(`d.place_id = $${paramIndex}`);
    params.push(placeId);
    paramIndex++;
  }

  // Filter by confidence level
  if (minConfidence) {
    const confidenceLevels: Record<Confidence, number> = {
      official: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    const minLevel = confidenceLevels[minConfidence];
    conditions.push(
      `CASE n.confidence 
        WHEN 'official' THEN 4 
        WHEN 'high' THEN 3 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 1 
        ELSE 0 
      END >= $${paramIndex}`
    );
    params.push(minLevel);
    paramIndex++;
  }

  // Filter by diet goals
  if (goals && goals.length > 0) {
    const goalConditions: string[] = [];

    for (const goal of goals) {
      switch (goal) {
        case 'high_protein':
          goalConditions.push(`n.protein_g >= ${GOAL_THRESHOLDS.HIGH_PROTEIN_MIN_G}`);
          break;
        case 'low_carb':
          goalConditions.push(`n.carbs_g <= ${GOAL_THRESHOLDS.LOW_CARB_MAX_G}`);
          break;
        case 'low_calorie':
          goalConditions.push(`n.kcal <= ${GOAL_THRESHOLDS.LOW_CALORIE_MAX_KCAL}`);
          break;
        case 'high_fiber':
          goalConditions.push(`n.fiber_g >= ${GOAL_THRESHOLDS.HIGH_FIBER_MIN_G}`);
          break;
        case 'low_sodium':
          goalConditions.push(`n.sodium_mg <= ${GOAL_THRESHOLDS.LOW_SODIUM_MAX_MG}`);
          break;
      }
    }

    if (goalConditions.length > 0) {
      conditions.push(`(${goalConditions.join(' AND ')})`);
    }
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM dish d
     LEFT JOIN nutrition_estimate n ON d.id = n.dish_id
     ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0]?.count || '0', 10);

  // Get dishes
  params.push(limit, offset);
  const dishes = await query<DishRow>(
    `SELECT 
      d.id, d.place_id, d.name, d.serving_desc, d.serving_g,
      d.menu_source_url, d.menu_checked_at,
      p.name as place_name, p.address as place_address,
      ST_Y(p.geom) as latitude, ST_X(p.geom) as longitude,
      n.kcal, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g, n.sodium_mg,
      n.kcal_low, n.kcal_high, n.confidence, n.method, n.engine_version
    FROM dish d
    JOIN place p ON d.place_id = p.id
    LEFT JOIN nutrition_estimate n ON d.id = n.dish_id
    ${whereClause}
    ORDER BY d.name
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return c.json({
    dishes: dishes.map((dish) => ({
      id: dish.id,
      name: dish.name,
      serving_desc: dish.serving_desc,
      place: {
        id: dish.place_id,
        name: dish.place_name,
        address: dish.place_address,
      },
      nutrition: dish.kcal
        ? {
            kcal: dish.kcal,
            protein_g: Number(dish.protein_g),
            carbs_g: Number(dish.carbs_g),
            fat_g: Number(dish.fat_g),
            fiber_g: Number(dish.fiber_g),
            sodium_mg: dish.sodium_mg,
            confidence: dish.confidence,
          }
        : null,
    })),
    total,
    limit,
    offset,
  });
});

export default dishes;
