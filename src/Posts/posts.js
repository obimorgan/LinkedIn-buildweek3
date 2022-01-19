import express from "express";
import PostModel from './schema.js'
import createHttpError from 'http-errors'
import q2m from 'query-to-mongo'
import { parser, cloudinary } from '../utils/cloudinary.js'

const postsRouter = express.Router();

// POSTS ENDPOINTS
postsRouter.post('/:username', parser.single('postImage'), async (req, res, next) => {
    try {
        const newPost = new PostModel(req.body)
        newPost.username = req.params.username
        newPost.image = req?.file?.path || ''
        newPost.filename = req?.file?.filename || ''
        await newPost.save()
        res.status(201).send(newPost)
    } catch (error) {
        next(error)
    }
})

postsRouter.get('/', async (req, res, next) => {
    try {
        const mongoQuery = q2m(req.query)
        const noOfPosts = await PostModel.countDocuments(mongoQuery.criteria)
        const posts = await PostModel.find(mongoQuery.criteria)
            .limit(mongoQuery.options.limit)
            .skip(mongoQuery.options.skip)
            .sort(mongoQuery.options.sort)
            .populate('user')
        res.send({ link: mongoQuery.links('/posts', noOfPosts), pageTotal: Math.ceil(noOfPosts / mongoQuery.options.limit), noOfPosts, posts })
    } catch (error) {
        next(error)
    }
})

postsRouter.route(':postId')
.get(async (req, res, next) => {
    try {
        const foundPost = await PostModel.findById(req.params.postId).populate('user')
        if (!foundPost) return next(createHttpError(404, `This post no longer exists.`))
        res.send(foundPost)            
    } catch (error) {
        next(error)
    }
})
.put(async (req, res, next) => {
    try {
        const body = { ...req.body, image: req.file ? req.file.path : req.body.image }
        const editedPost = await PostModel.findByIdAndUpdate(req.params.postId, body, { new: true })
        if (!editedPost) return next(createHttpError(404, `This post no longer exists and cannot be edited.`))
        res.send(editedPost)
    } catch (error) {
        next(error)
    }
})
.delete(async (req, res, next) => {
    try {
        const deletedPost = await PostModel.findByIdAndDelete(req.params.postId)
        if (!deletedPost) return next(createHttpError(404, `This post does not exist or has already been deleted.`))
        // TODO: CHECK IF POST HAS FILENAME
        await cloudinary.uploader.destroy(deletedPost.filename)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// COMMENTS ENDPOINTS
postsRouter.post('/:username/:postId', async (req, res, next) => {
    try {
        const postToCommentOn = await PostModel.findByIdAndUpdate(req.params.postId, { $push: { comments: req.body } }, { new: true })
        if (!postToCommentOn) return next(createHttpError(404, `This post does not exist or has been deleted.`))
        postToCommentOn.username = req.params.username
        res.send(postToCommentOn)
    } catch (error) {
        next(error)
    }
})

postsRouter.get('/:postId/comments', async (req, res, next) => {
    try {
        const mongoQuery = q2m(req.query)
        const post = await PostModel.find({ _id: req.params.postId }, { comments: { $slice: mongoQuery.options.limit } })
        console.log(post)
        post ? res.send(post[0].comments) : next(createHttpError(404, `This post does not exist or has been deleted.`))
    } catch (error) {
        next(error)
    }
})

postsRouter.put('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const post = await PostModel.findById(req.params.postId)
        if (post) {
            const commentIndex = post.comments.findIndex(c => c._id.toString() === req.params.commentId)
            if (commentIndex !== -1) {
                post.comments[commentIndex] = { ...post.comments[commentIndex].toObject(), ...req.body }
                await post.save()
                res.send(post)
            } else {
                next(createHttpError(404, `Comment does not exist or has been deleted.`))
            }
        } else {
            next(createHttpError(404, `This post does not exist or has been deleted.`))
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

postsRouter.delete('/:postId/comments/:commentId', async (req, res, next) => {
    const modifiedPost = await PostModel.findByIdAndUpdate(req.params.postId, { $pull: { comments: { _id: req.params.commentId } } }, { new: true })
    modifiedPost ? res.send(modifiedPost) : next(createHttpError(404, `This post does not exist or has been deleted.`))
})

export default postsRouter;
