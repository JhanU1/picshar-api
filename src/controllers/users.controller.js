import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const create = async (req, res) => {
  try {
    const { username, password, email, birthdate, bio } = req.body;
    if (username && password && email && birthdate && bio) {
      const userU = await User.findOne({ username });
      const userE = await User.findOne({ email });
      if (userU || userE) {
        return res.status(400).json({
          message: "Username already exists",
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
      res.json({ token });
    } else {
      res.json({ error: "Missing fields" });
    }
  } catch (error) {
    res.json({ error, message: "User not created" });
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
        res.json({ error: "Invalid credentials" });
      }
    } else {
      res.json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.json({ error, message: "User not logged in" });
  }
};

const loginToken = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findOne({ _id: decoded.user_id });
    if (user) {
      res.json({});
    } else {
      res.json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.json({ error, message: "User not logged in" });
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
      // TODO: calculate liked_count, posts_count, followers_count, followed_count
      let [liked_count, posts_count, followers_count, followed_count] = [
        0, 0, 0, 0,
      ];
      res.json({
        username,
        email,
        bio,
        liked_count,
        posts_count,
        followers_count,
        followed_count,
      });
    } else {
      res.json({ error: "User not found" });
    }
  } catch (error) {
    res.json({ error, message: "User not found" });
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
  console.log("Entered get");
  if (req.query.user_id) {
    getUser(req, res);
  } else {
    getAllUsers(req, res);
  }
};
