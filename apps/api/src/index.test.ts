import { describe, it, expect } from 'vitest';
import app from './index.js';

interface HealthResponse {
  status: string;
}

interface ApiInfoResponse {
  name: string;
  version: string;
  status: string;
}

describe('API', () => {
  it('returns health status', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const data = (await res.json()) as HealthResponse;
    expect(data.status).toBe('healthy');
  });

  it('returns API info at root', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);

    const data = (await res.json()) as ApiInfoResponse;
    expect(data.name).toBe('NutriTO API');
    expect(data.status).toBe('ok');
  });

  it('has dishes route', async () => {
    const res = await app.request('/api/dishes');
    // Will fail without DB but should not 404
    expect(res.status).not.toBe(404);
  });

  it('has places route', async () => {
    const res = await app.request('/api/places');
    // Will fail without DB but should not 404
    expect(res.status).not.toBe(404);
  });
});
