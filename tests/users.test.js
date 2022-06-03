import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../src/models/user.model.js';
import express from 'express';

const USERS_PATH = '/users';

const NEW_USER = {
  username: 'test',
  password: 'password',
  email: 'test@example.com',
  birthdate: '2000-01-01',
  bio: 'I am a test user'
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

    it('Should return bad request when invalid credentials', async () => {
      const response = await request(app).post(`${USERS_PATH}/login`).send({
        username: "invalidUsername",
        password: "invalidPassword"
      });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('Should return bad request when invalid credentials', async () => {
      const response = await request(app).post(`${USERS_PATH}/login`).send({
        username: NEW_USER.username,
        password: "invalidPassword"
      });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Invalid password');
    });

    it('Should return bad request when invalid token', async () => {
      const response = await request(app).post(`${USERS_PATH}/login`).send({
        token: "invalidToken"
      });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Invalid Token');
    });
  });

  describe('GET /users', () => {
    it('Should not return user password and birthdate', async () => {
      const user = await User.findOne({ username: NEW_USER.username });
      const response = await request(app).get(`${USERS_PATH}/?user_id=${user._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.password).not.toBeDefined();
      expect(response.body.birthdate).not.toBeDefined();
    });

    it('Should return user posts number', async () => {
      const user = await User.findOne({ username: NEW_USER.username });
      const response = await request(app).get(`${USERS_PATH}/?user_id=${user._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.posts_count).toBe(0);
    });

    it('Should return user liked posts number', async () => {
      const user = await User.findOne({ username: NEW_USER.username });
      const response = await request(app).get(`${USERS_PATH}/?user_id=${user._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.liked_count).toBe(0);
    });

    it('Should return user followers number', async () => {
      const user = await User.findOne({ username: NEW_USER.username });
      const response = await request(app).get(`${USERS_PATH}/?user_id=${user._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.followers_count).toBe(0);
    });

    it('Should return user followed number', async () => {
      const user = await User.findOne({ username: NEW_USER.username });
      const response = await request(app).get(`${USERS_PATH}/?user_id=${user._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.followed_count).toBe(0);
    });
  });

  // it('Should return all users', async () => {
  //   const response = await request(app).get(USERS_PATH);
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.length).toBe(0);
  // });
});
