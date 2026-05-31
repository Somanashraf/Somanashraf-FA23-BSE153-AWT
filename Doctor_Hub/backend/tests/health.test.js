const request = require('supertest');
const createApp = require('../src/app');

describe('Doctor Hub API', () => {
  it('returns API health', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.service).toBe('Doctor Hub API');
  });
});
