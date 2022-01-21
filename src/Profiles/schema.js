import mongoose from "mongoose"

const { Schema, model } = mongoose

const PofilesModel = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true, sparse: true },
    bio: { type: String, required: true },
    title: { type: String, required: true },
    area: { type: String, required: true },
    image: String,
    filename: String,
    username: { type: String, required: true, unique: true, sparse: true },
    likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Posts' }],
    connections: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
    connectionsSent: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
    connectionsReceived: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
    experiences: [{
      role: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: Date,
      description: { type: String, required: true },
      area: { type: String, required: true },
      image: String,
      filename: String
    }],
    applications: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
  }, { timestamps: true })

export default model("Profile", PofilesModel)