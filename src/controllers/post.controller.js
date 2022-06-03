import Post from "../models/post.model.js";
import {
  getCommentsByPostId,
  getAmountAction,
} from "./userAction.controller.js";
import { followeesByUserId, isFollowing } from "./follow.controller.js";
import { getUserIdByToken } from "./user.controller.js";

export const getAmountPosts = async (author) => {
  const amount = await Post.countDocuments({ author });
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
      res.status(400).json({ error: "Missing fields" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "Post not created" });
  }
};

const getByAuthor = async (req, res) => {
  try {
    const { token } = req.headers;
    const { author } = req.query;
    const user_id = await getUserIdByToken(token);
    const isFollow = await isFollowing(user_id, author);
    if (author === user_id || isFollow) {
      const posts = await Post.find({ author });
      res.json({ posts });
    } else {
      res.status(400).json({ error: "You are not following this author" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "Posts not found" });
  }
};

const getByPostId = async (req, res) => {
  try {
    const { post_id } = req.query;
    const post = await Post.findOne({ _id: post_id });
    if (post) {
      const comments = await getCommentsByPostId(post_id);
      const likes = await getAmountAction(post_id, "like", false);
      if (comments.error || likes.error) {
        res.status(400).json({
          error: comments.error || likes.error,
        });
      } else {
        res.status(200).json({
          ...post._doc,
          likes: likes.value,
          comments: comments.value,
        });
      }
    } else {
      res.status(400).json({ error: "Post not found" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "Post not found" });
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
  let { page } = req.query;
  const { token } = req.headers;
  const user_id = await getUserIdByToken(token);
  const followees = await followeesByUserId(user_id, token);
  const followeesIds = followees.map((followee) => followee._id.toString());
  const page_size = 10;
  if (followees.error) {
    res.status(400).json({ error: followees.error });
  } else {
    if (!page) {
      page = 0;
    }
    const posts = await Post.find({ author: { $in: followeesIds } })
      .skip(page_size * (page - 1))
      .limit(page_size);
    res.json({ posts });
  }
};
