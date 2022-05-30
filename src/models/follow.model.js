import mongoose from "mongoose";

const { Schema, model } = mongoose;

// @see https://wikidiff.com/followee/follower

const followSchema = new Schema({
  follower_id: { type: String, required: true },
  followee_id: { type: String, required: true },
  request: { type: Boolean , default: true},
});

export default model("Follow", followSchema);