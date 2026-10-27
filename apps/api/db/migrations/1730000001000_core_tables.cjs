/**
 * Core tables for NutriTO
 * Creates tables that the data-pipeline will populate
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  // Source provenance table
  pgm.createTable('source', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    kind: { type: 'varchar(50)', notNull: true },
    url: { type: 'text' },
    retrieved_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    license: { type: 'text' },
    attribution: { type: 'text' },
  });

  // Places table with PostGIS geometry
  pgm.createTable('place', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    address: { type: 'text', notNull: true },
    geom: { type: 'geometry(Point, 4326)', notNull: true },
    osm_id: { type: 'varchar(50)' },
    dinesafe_id: { type: 'varchar(50)' },
    chain_name: { type: 'varchar(255)' },
    google_place_id: { type: 'varchar(255)' },
    google_match_status: { type: 'varchar(20)' },
    google_checked_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('place', 'geom', { method: 'gist' });
  pgm.createIndex('place', 'osm_id');
  pgm.createIndex('place', 'name');

  // FDC food reference table
  pgm.createTable('fdc_food', {
    fdc_id: { type: 'integer', primaryKey: true },
    description: { type: 'text', notNull: true },
    data_type: { type: 'varchar(50)', notNull: true },
  });

  // FDC nutrient data (per 100g)
  pgm.createTable('fdc_nutrient', {
    fdc_id: { type: 'integer', primaryKey: true, references: 'fdc_food', onDelete: 'CASCADE' },
    kcal_per_100g: { type: 'numeric(10,2)', notNull: true },
    protein_per_100g: { type: 'numeric(10,2)', notNull: true },
    carbs_per_100g: { type: 'numeric(10,2)', notNull: true },
    fat_per_100g: { type: 'numeric(10,2)', notNull: true },
    fiber_per_100g: { type: 'numeric(10,2)', notNull: true },
    sodium_per_100g: { type: 'numeric(10,2)', notNull: true },
  });

  // Canonical ingredients mapped to FDC
  pgm.createTable('ingredient', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    fdc_id: { type: 'integer', references: 'fdc_food' },
    match_note: { type: 'text' },
  });

  pgm.createIndex('ingredient', 'name');

  // Dishes at places
  pgm.createTable('dish', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    place_id: { type: 'uuid', notNull: true, references: 'place', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)', notNull: true },
    serving_desc: { type: 'varchar(255)', notNull: true },
    serving_g: { type: 'numeric(10,2)' },
    menu_source_url: { type: 'text', notNull: true },
    menu_checked_at: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('dish', 'place_id');
  pgm.createIndex('dish', 'name');

  // Recipe lines: ingredients in a dish
  pgm.createTable('dish_ingredient', {
    dish_id: { type: 'uuid', notNull: true, references: 'dish', onDelete: 'CASCADE' },
    ingredient_id: { type: 'uuid', notNull: true, references: 'ingredient', onDelete: 'CASCADE' },
    grams: { type: 'numeric(10,2)', notNull: true },
    grams_basis: { type: 'varchar(20)', notNull: true },
  });

  pgm.addConstraint('dish_ingredient', 'dish_ingredient_pkey', {
    primaryKey: ['dish_id', 'ingredient_id'],
  });

  // Nutrition estimates per dish
  pgm.createTable('nutrition_estimate', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    dish_id: { type: 'uuid', notNull: true, references: 'dish', onDelete: 'CASCADE', unique: true },
    kcal: { type: 'integer', notNull: true },
    protein_g: { type: 'numeric(10,1)', notNull: true },
    carbs_g: { type: 'numeric(10,1)', notNull: true },
    fat_g: { type: 'numeric(10,1)', notNull: true },
    fiber_g: { type: 'numeric(10,1)', notNull: true },
    sodium_mg: { type: 'integer', notNull: true },
    kcal_low: { type: 'integer', notNull: true },
    kcal_high: { type: 'integer', notNull: true },
    method: { type: 'varchar(50)', notNull: true },
    confidence: { type: 'varchar(20)', notNull: true },
    source_id: { type: 'uuid', references: 'source' },
    engine_version: { type: 'varchar(20)', notNull: true },
    computed_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('nutrition_estimate', 'dish_id');
  pgm.createIndex('nutrition_estimate', 'confidence');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('nutrition_estimate');
  pgm.dropTable('dish_ingredient');
  pgm.dropTable('dish');
  pgm.dropTable('ingredient');
  pgm.dropTable('fdc_nutrient');
  pgm.dropTable('fdc_food');
  pgm.dropTable('place');
  pgm.dropTable('source');
};
