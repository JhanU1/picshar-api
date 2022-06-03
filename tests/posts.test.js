import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

import User from '../src/models/user.model.js';
import Post from '../src/models/post.model.js';

const POSTS_PATH = '/posts';

const NEW_USER = {
  username: 'test',
  password: 'password',
  email: 'test@example.com',
  birthdate: '2000-01-01',
  bio: 'I am a test user'
};


describe('Posts routes', () => {
  let author;
  let post;


  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);

    // Create a user
    await request(app).post('/users').send(NEW_USER);
    // Get the user id
    author = await User.findOne({ username: NEW_USER.username });
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  describe('POST /', () => {
    it('Should create post', async () => {
      const response = await request(app).post(POSTS_PATH).send({
        img_url: 'http://www.example.com/image.jpg',
        author: author._id,
        bio: 'I am a test post'
      });
      expect(response.statusCode).toBe(200);
      post = await Post.findOne({ author: author._id });
    });
  });

  describe('GET /', () => {
    it('Should return posts by author', async () => {
      const response = await request(app).get(`${POSTS_PATH}?author=${author._id}`).set('token', author.token);
      expect(response.statusCode).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      const [post_] = response.body.posts;
      expect(post_._id).toBe(post._id.toString());
    });

    it('Should return single post by id', async () => {
      const response = await request(app).get(`${POSTS_PATH}?post_id=${post._id}`).set('token', author.token);
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body._id).toBe(post._id.toString());
    });
  });

  describe('POST /comment', () => {
    it('Should comment a post', async () => {
      const response = await request(app).post(`${POSTS_PATH}/comment`).set('token', author.token).send({
        post_id: post._id,
        comment: 'Awesome post!'
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('POST /like', () => {
    it('Should like a post', async () => {
      const response = await request(app).post(`${POSTS_PATH}/like`).set('token', author.token).send({
        post_id: post._id
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('POST /save', () => {
    it('Should save a post', async () => {
      const response = await request(app).post(`${POSTS_PATH}/save`).set('token', author.token).send({
        post_id: post._id
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('GET /liked-by', () => {
    it('Should return posts liked by author', async () => {
      const response = await request(app).get(`${POSTS_PATH}/liked-by?user_id=${author._id}`).set('token', author.token);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      const [post_] = response.body;
      expect(post_._id).toBe(post._id.toString());
    });
  });

  describe('GET /saved-by', () => {
    it('Should return posts saved by author', async () => {
      const response = await request(app).get(`${POSTS_PATH}/saved-by?user_id=${author._id}`).set('token', author.token);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      const [post_] = response.body;
      expect(post_._id).toBe(post._id.toString());
    });
  });
});
