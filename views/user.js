/** @format */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserModel = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});
export default model("User", UserModel);
