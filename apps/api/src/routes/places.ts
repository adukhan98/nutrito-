import { Hono } from 'hono';
import { query, queryOne } from '../db/client.js';

const places = new Hono();

interface PlaceRow {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  osm_id: string | null;
  dinesafe_id: string | null;
  chain_name: string | null;
  dish_count: number;
}

interface PlaceWithDistanceRow extends PlaceRow {
  distance_meters: number;
}

// Get place by ID with dish list
places.get('/:id', async (c) => {
  const { id } = c.req.param();

  const place = await queryOne<PlaceRow>(
    `SELECT 
      p.id, p.name, p.address,
      ST_Y(p.geom) as latitude, ST_X(p.geom) as longitude,
      p.osm_id, p.dinesafe_id, p.chain_name,
      (SELECT COUNT(*) FROM dish d WHERE d.place_id = p.id) as dish_count
    FROM place p
    WHERE p.id = $1`,
    [id]
  );

  if (!place) {
    return c.json({ error: 'Place not found' }, 404);
  }

  // Get dishes at this place
  const dishes = await query<{
    id: string;
    name: string;
    serving_desc: string;
    kcal: number;
    protein_g: number;
    confidence: string;
  }>(
    `SELECT 
      d.id, d.name, d.serving_desc,
      n.kcal, n.protein_g, n.confidence
    FROM dish d
    LEFT JOIN nutrition_estimate n ON d.id = n.dish_id
    WHERE d.place_id = $1
    ORDER BY d.name`,
    [id]
  );

  return c.json({
    id: place.id,
    name: place.name,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    osm_id: place.osm_id,
    dinesafe_id: place.dinesafe_id,
    chain_name: place.chain_name,
    dish_count: Number(place.dish_count),
    dishes: dishes.map((d) => ({
      id: d.id,
      name: d.name,
      serving_desc: d.serving_desc,
      nutrition: d.kcal
        ? {
            kcal: d.kcal,
            protein_g: Number(d.protein_g),
            confidence: d.confidence,
          }
        : null,
    })),
  });
});

// Get nearby places
places.get('/nearby', async (c) => {
  const lat = parseFloat(c.req.query('lat') || '0');
  const lng = parseFloat(c.req.query('lng') || '0');
  const radiusMeters = Math.min(
    parseInt(c.req.query('radius') || '1000', 10),
    10000
  );
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);

  if (!lat || !lng) {
    return c.json({ error: 'lat and lng are required' }, 400);
  }

  const places = await query<PlaceWithDistanceRow>(
    `SELECT 
      p.id, p.name, p.address,
      ST_Y(p.geom) as latitude, ST_X(p.geom) as longitude,
      p.osm_id, p.dinesafe_id, p.chain_name,
      (SELECT COUNT(*) FROM dish d WHERE d.place_id = p.id) as dish_count,
      ST_Distance(
        p.geom::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
      ) as distance_meters
    FROM place p
    WHERE ST_DWithin(
      p.geom::geography,
      ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
      $3
    )
    ORDER BY distance_meters
    LIMIT $4`,
    [lat, lng, radiusMeters, limit]
  );

  return c.json({
    places: places.map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      dish_count: Number(p.dish_count),
      distance_meters: Math.round(p.distance_meters),
    })),
    center: { latitude: lat, longitude: lng },
    radius_meters: radiusMeters,
  });
});

// List all places
places.get('/', async (c) => {
  const search = c.req.query('q');
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`p.name ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM place p ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0]?.count || '0', 10);

  // Get places
  params.push(limit, offset);
  const places = await query<PlaceRow>(
    `SELECT 
      p.id, p.name, p.address,
      ST_Y(p.geom) as latitude, ST_X(p.geom) as longitude,
      p.osm_id, p.dinesafe_id, p.chain_name,
      (SELECT COUNT(*) FROM dish d WHERE d.place_id = p.id) as dish_count
    FROM place p
    ${whereClause}
    ORDER BY p.name
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return c.json({
    places: places.map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      dish_count: Number(p.dish_count),
    })),
    total,
    limit,
    offset,
  });
});

export default places;
