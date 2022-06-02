import User from "../models/user.model.js";
import { getAmountAction } from "./userAction.controller.js";
import { getAmountPosts } from "./post.controller.js";
import {
  getAmountFollowersByUserId,
  getAmountFolloweesByUserId,
} from "./follow.controller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getUserByToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findOne({ _id: decoded.user_id });
    return user;
  } catch (error) {
    return undefined;
  }
};

export const getUserById = async (user_id) => {
  try {
    const user = await User.findOne({ _id: user_id });
    return user;
  } catch (error) {
    return undefined;
  }
};

export const create = async (req, res) => {
  try {
    const { username, password, email, birthdate, bio } = req.body;
    if (username && password && email && birthdate && bio) {
      const userU = await User.findOne({ username });
      const userE = await User.findOne({ email });
      if (userU || userE) {
        return res.status(400).json({
          message: "User already exists",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const date = new Date(birthdate);
      const newuser = await User.create({
        username,
        password: encryptedPassword,
        email: email.toLowerCase(),
        birthdate: date,
        bio,
      });
      const token = jwt.sign(
        { user_id: newuser._id },
        process.env.TOKEN_SECRET
      );
      newuser.token = token;
      await newuser.save();
      res.status(201).json({ token });
    } else {
      res.status(400).json({ error: "Missing fields" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "User not created" });
  }
};

const loginCredentials = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_SECRET);
        user.token = token;
        await user.save();
        res.json({ token });
      } else {
        res.status(400).json({ error: "Invalid credentials" });
      }
    } else {
      res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "User not logged in" });
  }
};

const loginToken = async (req, res) => {
  try {
    const user = await getUserByToken(req.body.token);
    if (user) {
      res.json({});
    } else {
      res.status(400).json({ error: "Invalid Token" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "User not logged in" });
  }
};

export const login = async (req, res) => {
  if (req.body.token) {
    loginToken(req, res);
  } else {
    loginCredentials(req, res);
  }
};

const getUser = async (req, res) => {
  try {
    const { user_id } = req.query;
    const user = await User.findOne({ _id: user_id });
    if (user) {
      const { username, email, bio } = user;
      const liked_count = await getAmountAction(user_id, "like");
      const posts_count = await getAmountPosts(user_id);
      const followers_count = await getAmountFollowersByUserId(user_id);
      const followed_count = await getAmountFolloweesByUserId(user_id);
      res.json({
        username,
        email,
        bio,
        liked_count: liked_count.value,
        posts_count,
        followers_count,
        followed_count,
      });
    } else {
      res.status(400).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "User not found" });
  }
};

const getAllUsers = async (_req, res) => {
  const users = await User.find();
  const mapUsers = users.map((user) => {
    const { username, email, bio, _id, token } = user;
    return {
      username,
      email,
      bio,
      _id,
      token,
    };
  });
  res.json(mapUsers);
};

export const get = async (req, res) => {
  if (req.query.user_id) {
    getUser(req, res);
  } else {
    getAllUsers(req, res);
  }
};

export const getUserIdByToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    return decoded.user_id;
  } catch (error) {
    return undefined;
  }
};
