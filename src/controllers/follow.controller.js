import Follow from "../models/follow.model";
import * as UserActionController from "../controllers/userAction.controller";
import * as UserController from "../controllers/user.controller";

export const isFollowing = async (followee_id, follower_id) => {
    const follow = await Follow.findOne({
        followee_id,
        follower_id,
        request: false,
    });
    return !!follow;
}

export const getFollowerByUserId = async (req, res) => {
    try {
        const { user_id } = req.body;
        if (user_id) {
          const users = await Follow.aggregate([
            { $match: { followee_id: user_id } },
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
                as: "users",
              },
            },
            { $project: { _id: 0, users: 1 } },
          ]).exec();
          return { value: users[0].users };
        } else {
          return { error: "Missing fields" };
        }
      } catch (error) {
        return { error, message: "error" };
      }
}

export const create = async (req, res) => {
    try {
        const { user_id: followee_id } = req.body;
        const { token } = req.headers;
        const follower_id = await UserController.getUserIdByToken(token);
        if (followee_id && follower_id) {
            const isFollowing = await isFollowing(followee_id, follower_id);
            if (!isFollowing) {
                await Follow.create({
                    followee_id,
                    follower_id,
                });
                res.json({});
            } else {
                res.json({ error: "Already following" });
            }
        } else {
            res.json({ error: "Missing fields" });
        }
    } catch (error) {
        res.json({ error, message: "Follow request not created" });
    }
};

export const response = async (req, res) => {
    const { request_id, action } = req.body;
    try {
        const follow = await Follow.findOne({
            _id: request_id,
        });
        if (follow) {
            if (action === "accept") {
                follow.request = false;
                await follow.save();
                res.json({});
            } else {
                await follow.remove();
                res.json({});
            }
        } else {
            res.json({ error: "Follow request not found" });
        }
    } catch (error) {
        res.json({ error, message: "Follow request not found" });
    }
}