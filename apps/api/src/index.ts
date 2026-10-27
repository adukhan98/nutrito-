import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import dishes from './routes/dishes.js';
import places from './routes/places.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'NutriTO API',
    version: '0.1.0',
    status: 'ok',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy' });
});

// API routes
app.route('/api/dishes', dishes);
app.route('/api/places', places);

// Start server (only when not imported for testing)
const port = parseInt(process.env.PORT || '3001', 10);

if (process.env.NODE_ENV !== 'test') {
  console.log(`🥗 NutriTO API starting on port ${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;
