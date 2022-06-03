import Follow from "../models/follow.model.js";
import { getUserIdByToken } from "./user.controller.js";

/*
 * @param {String} followee_id - id of the user that is being followed
 * @param {String} follower_id - id of the user that is following
 */
export const isFollowing = async (followee_id, follower_id) => {
  const follow = await Follow.findOne({
    followee_id,
    follower_id,
    request: false,
  });
  return !!follow;
};

export const followeesByUserId = async (follower_id, token) => {
  try {
    const user_id = await getUserIdByToken(token);
    if (follower_id && user_id) {
      const isFollow = await isFollowing(follower_id, user_id);
      if (isFollow || follower_id === user_id) {
        const users = await Follow.aggregate([
          { $match: { follower_id, request: false } },
          {
            $project: {
              followee_id: {
                $toObjectId: "$followee_id",
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "followee_id",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
        ]).exec();
        const r = users.map((val) => {
          const { _id, username, email, bio } = val.user;
          return {
            _id,
            username,
            email,
            bio,
          };
        });
        return r;
      } else {
        return {
          error: "You are not following this user",
        };
      }
    } else {
      return { error: "Missing fields" };
    }
  } catch (error) {
    return { error };
  }
};

export const getFollowersByUserId = async (req, res) => {
  const { token } = req.headers;
  const user_id = await getUserIdByToken(token);
  const { user_id: followee_id } = req.query;

  if (followee_id && user_id) {
    const isFollow = await isFollowing(followee_id, user_id);
    if (isFollow || followee_id === user_id) {
      const users = await Follow.aggregate([
        { $match: { followee_id, request: false } },
        {
          $project: {
            follower_id: {
              $toObjectId: "$follower_id",
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "follower_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
      ]).exec();
      const r = users.map((val) => {
        const { _id, username, email, bio } = val.user;
        return {
          _id,
          username,
          email,
          bio,
        };
      });
      res.status(200).json(r);
    } else {
      res.status(400).json({
        error: "You are not following this user",
      });
    }
  } else {
    res.status(400).json({ error: "Missing fields" });
  }
};

export const getFolloweesByUserId = async (req, res) => {
  const { token } = req.headers;
  const { user_id: follower_id } = req.query;
  const followees = await followeesByUserId(follower_id, token);
  if (followees.error) {
    res.status(400).json({ error: followees.error });
  } else {
    res.status(200).json(followees);
  }
};

export const getAmountFollowersByUserId = async (user_id) => {
  try {
    const followers = await Follow.countDocuments({
      followee_id: user_id,
      request: false,
    });
    return followers;
  } catch (error) {
    return undefined;
  }
};

export const getAmountFolloweesByUserId = async (user_id) => {
  try {
    const followers = await Follow.countDocuments({
      follower_id: user_id,
      request: false,
    });
    return followers;
  } catch (error) {
    return undefined;
  }
};

export const create = async (req, res) => {
  try {
    const { user_id: followee_id } = req.body;
    const { token } = req.headers;
    const follower_id = await getUserIdByToken(token);
    if (followee_id && follower_id) {
      const isFollow = await Follow.findOne({
        followee_id,
        follower_id,
      });
      if (!isFollow) {
        if (followee_id !== follower_id) {
          await Follow.create({
            followee_id,
            follower_id,
          });
          res.status(200).json({});
        } else {
          res.status(400).json({
            error: "You cannot follow yourself",
          });
        }
      } else {
        res
          .status(400)
          .json({ error: "Already following  Or  request already exists" });
      }
    } else {
      res.status(400).json({ error: "Missing fields" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "error" });
  }
};

export const response = async (req, res) => {
  const { request_id, action } = req.body;
  const { token } = req.headers;
  const followee_id = await getUserIdByToken(token);
  try {
    const follow = await Follow.findOne({
      _id: request_id,
      request: true,
    });
    if (follow) {
      if (follow.followee_id.toString() === followee_id) {
        if (action === "accept") {
          follow.request = false;
          await follow.save();
          res.json({});
        } else if (action === "reject") {
          await follow.remove();
          res.json({});
        } else {
          res.status(400).json({
            error: "Invalid action",
          });
        }
      } else {
        res.status(400).json({ error: "Not your request" });
      }
    } else {
      res.status(400).json({ error: "Follow request not found" });
    }
  } catch (error) {
    res.status(400).json({ error, message: "Follow request not found" });
  }
};
