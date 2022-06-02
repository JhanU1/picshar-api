import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

const USERS_PATH = '/users';

const NEW_USER = {
  username: 'test',
  password: 'password',
  email: 'test@example.com',
  birthdate: '2000-01-01',
  bio: 'I a a test user'
};

describe('Users routes', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  describe('POST /users', () => {
    it('Should create user', async () => {
      const response = await request(app).post(USERS_PATH).send(NEW_USER);
      expect(response.statusCode).toBe(201);
      expect(response.body.token).toBeDefined();
    });

    it('Should return bad request when missing fields', async () => {
      const response = await request(app).post(USERS_PATH).send({});
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Missing fields');
    });

    it('Should return bad request when user already exists', async () => {
      const response = await request(app).post(USERS_PATH).send(NEW_USER);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /login', () => {
    let token;

    it('Should login user with credentials', async () => {
      const response = await request(app).post(`${USERS_PATH}/login`).send({
        username: NEW_USER.username,
        password: NEW_USER.password
      });
      expect(response.statusCode).toBe(200);
      expect(token = response.body.token).toBeDefined();
    });

    it('Should login user with token', async () => {
      const response = await request(app).post(`${USERS_PATH}/login`).send({ token });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });

  });



  // it('Should return all users', async () => {
  //   const response = await request(app).get(USERS_PATH);
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.length).toBe(0);
  // });
});
