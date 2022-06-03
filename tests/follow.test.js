import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

import User from '../src/models/user.model.js';
import Follow from '../src/models/follow.model.js';

const FOLLOWS_PATH = '/follows';

const USER1 = {
  username: 'test 1 from follow',
  password: 'password',
  email: 'test1fromfollow@example.com',
  birthdate: '2000-01-01',
  bio: 'I am a test 1 user from follow'
};

const USER2 = {
  username: 'test 2 from follow',
  password: 'password',
  email: 'test2fromfollow@example.com',
  birthdate: '2000-01-01',
  bio: 'I am a test 2 user from follow'
};

describe('Follows routes', () => {
  let user1;
  let user2;

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);

    await request(app).post('/users').send(USER1);
    user1 = await User.findOne({ username: USER1.username });

    await request(app).post('/users').send(USER2);
    user2 = await User.findOne({ username: USER2.username });
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  describe('POST /request', () => {
    it('Should create a follow request', async () => {
      // USER1 send follow request to USER2
      const response = await request(app).post(`${FOLLOWS_PATH}/request`).send({
        user_id: user2._id,
      }).set('token', user1.token);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('POST /response', () => {
    it('Should accept a follow request', async () => {
      // USER2 accept USER1 follow request
      const followReq = await Follow.findOne({ follower_id: user1._id, followee_id: user2._id, request: true });

      const response = await request(app).post(`${FOLLOWS_PATH}/response`).send({
        request_id: followReq._id,
        action: 'accept',
      }).set('token', user2.token);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('GET /following', () => {
    it('Should get all followees', async () => {
      // USER1 get all followees
      const response = await request(app).get(`${FOLLOWS_PATH}/following?user_id=${user1._id}`).set('token', user1.token);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([{
        _id: user2._id.toString(),
        username: user2.username,
        bio: user2.bio,
        email: user2.email,
      }]);
    });
  });

  describe('GET /followers', () => {
    it('Should get all followers', async () => {
      // USER2 get all followers
      const response = await request(app).get(`${FOLLOWS_PATH}/followers?user_id=${user2._id}`).set('token', user2.token);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([{
        _id: user1._id.toString(),
        username: user1.username,
        bio: user1.bio,
        email: user1.email,
      }]);
    });
  });
});
