import Post from "../models/post.model";
import UserActionController from "../controllers/userAction.controller";

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
    const { author } = req.query;
    const posts = await Post.find({ author });
    res.json({ posts });
  } catch (error) {
    res.json({ error, message: "Posts not found" });
  }
};

const getByPostId = async (req, res) => {
  try {
    const { post_id } = req.query;
    const post = await Post.findOne({ _id: post_id });
    if (post) {
      const comments = await UserActionController.getCommentsByPostId(post_id);
      const likes = await UserActionController.getAmountAction(
        post_id,
        "like",
        false
      );
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
    const { user_id } = req.query;
    const posts = await Post.find({ author: user_id });
    res.json({ posts });
  } catch (error) {
    res.json({ error, message: "Posts not found" });
  }
};
