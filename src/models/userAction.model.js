import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userActionSchema = new Schema({
  type: { type: String, required: true },
  user_id: { type: String, required: true },
  post_id: { type: String, required: true },
  comment: { type: String },
});

export default model("UserAction", userActionSchema);
