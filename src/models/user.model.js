import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  birthdate: { type: Date, required: true },
  bio: { type: String, required: true },
  token: { type: String},
  showLikes: { type: Boolean, default: true },
});

export default model("User", userSchema);
