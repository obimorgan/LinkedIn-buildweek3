import mongoose from 'mongoose'

const { Schema, model } = mongoose

const CommentSchema = new Schema({
    text: { type: String, required: true },
    username: String
}, { timestamps: true })

const PostSchema = new Schema({
    text: { type: String, required: true },
    image: String,
    filename: String,
    username: String,
    comments: { type: [CommentSchema], default: [] }
}, { timestamps: true, toJSON: { virtuals: true } })

PostSchema.virtual('user', { ref: 'Profile', localField: 'username', foreignField: 'username', justOne: true })

export default model('Posts', PostSchema)