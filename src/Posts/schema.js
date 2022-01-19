import mongoose from 'mongoose'

const { Schema, model } = mongoose

const CommentSchema = new Schema({
    text: { type: String, required: true },
    username: String,
    likes: [{ type: Schema.Types.ObjectId, ref: 'Profile' }]
},
    { timestamps: true, toJSON: { virtuals: true } })

const PostSchema = new Schema(
    {
        text: { type: String, required: true },
        image: String,
        filename: String,
        username: String,
        comments: { type: [CommentSchema], default: [] },
        likes: [{ type: Schema.Types.ObjectId, ref: 'Profile' }]
    },
    { timestamps: true, toJSON: { virtuals: true } }
)

PostSchema.virtual('user', { ref: 'Profile', localField: 'username', foreignField: 'username', justOne: true })

PostSchema.virtual('noOfLikes').get(function () { return this.likes.length })

CommentSchema.virtual('noOfLikes').get(function () { return this.likes.length })

export default model('Posts', PostSchema)