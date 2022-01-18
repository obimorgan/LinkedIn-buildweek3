/** @format */
import mongoose from 'mongoose'

const { Schema, model } = mongoose

const PostSchema = new Schema(
    {
        text: { type: String, required: true },
        image: String,
        filename: String,
        username: String
    },
    { timestamps: true, toJSON: { virtuals: true } }
)

PostSchema.virtual('user', { ref: 'Profile', localField: 'username', foreignField: 'username', justOne: true })

export default model('Posts', PostSchema)