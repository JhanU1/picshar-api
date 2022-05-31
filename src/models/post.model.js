import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema({
  img_url: { type: String, required: true },
  author: { type: String, required: true },
  bio: { type: String, required: true },
});

export default model("Post", postSchema);
