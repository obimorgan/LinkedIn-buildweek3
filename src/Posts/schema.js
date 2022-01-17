/** @format */
import mongoose from 'mongoose'

const { Schema, model } = mongoose

const PostSchema = new Schema(
    {
        text: { type: String, required: true },
        username: { type: String },
        image: { type: String },
        user: { type: Schema.Types.ObjectId, ref: "Profile", required: true }
    },
    { timestamps: true }
)

export default model('Posts', PostSchema)