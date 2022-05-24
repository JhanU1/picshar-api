import UserAction from "../models/userAction.model.js";
import { getUserByToken } from "./user.controller.js";

const createAction = async (req, res, type) => {
  const { token } = req.headers;
  const user = await getUserByToken(token);
  if (user) {
    const user_id = user._id;
    if (type === "comment") {
      try {
        const { post_id, comment } = req.body;
        if (post_id && comment) {
          const newAction = new UserAction({
            user_id,
            post_id,
            comment,
            type,
          });
          await newAction.save();
          res.status(200).json({});
        } else {
          res.status(400).json({
            message: "All fields are required",
          });
        }
      } catch (error) {
        res.json({ error, message: "error" });
      }
    } else {
      try {
        const { post_id } = req.body;
        if (post_id) {
          await UserAction.create({
            type,
            user_id,
            post_id,
          });
          res.json({});
        } else {
          res.json({ error: "Missing fields" });
        }
      } catch (error) {
        res.json({ error, message: "error" });
      }
    }
  } else {
    res.json({ error: "User not found" });
  }
};

const getAction = async (id, type) => {
  try {
    if (id) {
      const posts = await UserAction.aggregate([
        { $match: { user_id: id, type } },
        {
          $project: {
            post_id: {
              $toObjectId: "$post_id",
            },
          },
        },
        {
          $lookup: {
            from: "posts",
            localField: "post_id",
            foreignField: "_id",
            as: "posts",
          },
        },
        { $project: { _id: 0, posts: 1 } },
      ]).exec();
      return { value: posts[0].posts };
    } else {
      return { error: "Missing fields" };
    }
  } catch (error) {
    return { error, message: "error" };
  }
};

export const getAmountAction = async (id, type, isUser = true) => {
  try {
    if (isUser) {
      if (user_id) {
        const amount = await UserAction.countDocuments({
          user_id: id,
          type,
        }).exec();
        return { value: amount };
      } else {
        return { error: "Missing fields" };
      }
    } else {
      if (id) {
        const amount = await UserAction.countDocuments({
          post_id: id,
          type,
        }).exec();
        return { value: amount };
      } else {
        return { error: "Missing fields" };
      }
    }
  } catch (error) {
    return { error, message: "error" };
  }
};

export const getCommentsByPostId = async (post_id) => {
  try {
    if (post_id) {
      const commentsR = await UserAction.find({
        post_id,
        type: "comment",
      });
      const comments = commentsR.map((comment) => {
        comment.comment;
      });

      return { value: comments };
    } else {
      return { error: "Missing fields" };
    }
  } catch (error) {
    return { error, message: "error" };
  }
};

export const like = async (req, res) => {
  await createAction(req, res, "like");
};

export const comment = async (req, res) => {
  await createAction(req, res, "comment");
};

export const save = async (req, res) => {
  await createAction(req, res, "save");
};

export const getSavedPosts = async (req, res) => {
  const { user_id } = req.query;
  const posts = await getAction(user_id, "save");
  if (posts.error) {
    res.status(400).json(posts);
  } else {
    res.status(200).json(posts.value);
  }
};

export const getLikedPosts = async (req, res) => {
  console.log("getLikedPosts");
  const { user_id } = req.query;
  const posts = await getAction(user_id, "like");
  if (posts.error) {
    res.status(400).json(posts);
  } else {
    res.status(200).json(posts.value);
  }
};

export const getCommentedPosts = async (req, res) => {
  const { user_id } = req.query;
  const posts = await getAction(user_id, "comment");
  if (posts.error) {
    res.status(400).json(posts);
  } else {
    res.status(200).json(posts.value);
  }
};
