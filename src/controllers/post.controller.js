import Post from "../models/post.model.js";
import {
  getCommentsByPostId,
  getAmountAction,
  followeesByUserId,
} from "./userAction.controller.js";
import { getfolloweesByUserId, isFollowing } from "./follow.controller.js";
import { getUserIdByToken } from "./user.controller.js";

export const getAmountPosts = async (user_id) => {
  const amount = await Post.countDocuments({ user_id });
  return amount;
};

export const create = async (req, res) => {
  try {
    const { img_url, author, bio } = req.body;
    if (img_url && author && bio) {
      await Post.create({
        img_url,
        author,
        bio,
      });
      res.json({});
    } else {
      res.json({ error: "Missing fields" });
    }
  } catch (error) {
    res.json({ error, message: "Post not created" });
  }
};

const getByAuthor = async (req, res) => {
  try {
    const { token } = req.headers;
    const user_id = await getUserIdByToken(token);
    const isFollow = await isFollowing(user_id, req.params.author);
    const { author } = req.query;
    if (author === user_id || isFollow) {
      const posts = await Post.find({ author });
      res.json({ posts });
    } else {
      res.json({ error: "You are not following this author" });
    }
  } catch (error) {
    res.json({ error, message: "Posts not found" });
  }
};

const getByPostId = async (req, res) => {
  try {
    const { post_id } = req.query;
    const post = await Post.findOne({ _id: post_id });
    if (post) {
      const comments = await getCommentsByPostId(post_id);
      const likes = await getAmountAction(post_id, "like", false);
      res.json({ ...post, likes, comments });
    } else {
      res.json({ error: "Post not found" });
    }
  } catch (error) {
    res.json({ error, message: "Post not found" });
  }
};

export const get = async (req, res) => {
  const { author } = req.query;
  if (author) {
    getByAuthor(req, res);
  } else {
    getByPostId(req, res);
  }
};

export const getTimeLine = async (req, res) => {
  try {
    let { user_id, page } = req.query;
    const followees = await getfolloweesByUserId(user_id);
    page_size = 10;
    if (followees.error) {
      res.json({ error: followees.error });
    } else {
      if (!page) {
        page = 1;
      }
      const posts = await Post.find({ author: { $in: followees } })
        .skip(page_size * page)
        .limit(page_size);
      res.json({ posts });
    }
  } catch (error) {
    res.json({ error, message: "Invalid Request" });
  }
};
