import request from 'supertest';

import app from '../app.js';

describe('Index routes', () => {
  it('Should return Hello world', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Hello World');
  });
});
