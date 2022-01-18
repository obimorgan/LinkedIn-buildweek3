/** @format */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PofilesModel = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, required: true },
    title: { type: String, required: true },
    area: { type: String, required: true },
    image: { type: String, required: false },
    username: { type: String, required: true },
    // following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
    // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
    experiences: [{
      role: {
          type: String,
          required: true
      },
      company: {
          type: String,
          required: true
      },
      startDate: {
          type: Date,
          required: true
      },
      endDate: Date,
      description: {
          type: String,
          required: true
      },
      area: {
          type: String,
          required: true
      },
      image: String,
      filename: String
  }]
  },
  {
    timestamps: true,
  }
);

export default model("Profile", PofilesModel);
