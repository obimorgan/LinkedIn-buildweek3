import express from "express";
import PostModel from './schema.js'
import ProfileModel from '../Profiles/schema.js'
import createHttpError from 'http-errors'
import q2m from 'query-to-mongo'
import { parser, cloudinary } from '../utils/cloudinary.js'
import { validationResult } from 'express-validator'
import { createPostValidator, createCommentValidator } from '../middlewares/validation.js'

const postsRouter = express.Router();

// POSTS ENDPOINTS
postsRouter.post('/:userName', parser.single('postImage'), createPostValidator, async (req, res, next) => {
    try {
        const { userName } = req.params
        if (userName.length < 1) return next(createHttpError(400, 'Invalid ID'))
        const errors = validationResult(req)
        if (!errors.isEmpty()) return next(createHttpError(400, errors))
        const newPost = new PostModel(req.body)
        newPost.username = userName
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
            .sort({ createdAt: -1 })
            .populate('user', { image: 1, _id: 0 })
        res.send({ link: mongoQuery.links('/posts', noOfPosts), pageTotal: Math.ceil(noOfPosts / mongoQuery.options.limit), noOfPosts, posts })
    } catch (error) {
        next(error)
    }
})

postsRouter.route('/:postId')
    .get(async (req, res, next) => {
        try {
            const foundPost = await PostModel.findById(req.params.postId).populate('user', { image: 1, _id: 0 })
            if (!foundPost) return next(createHttpError(404, `This post no longer exists.`))
            res.send(foundPost)
        } catch (error) {
            next(error)
        }
    })
    .put(parser.single('postImage'), async (req, res, next) => {
        try {
            const oldPost = await PostModel.findById(req.params.postId)
            const body = { ...req.body, image: req?.file?.path || oldPost.image, filename: req?.file?.filename || oldPost.filename }
            const editedPost = await PostModel.findByIdAndUpdate(req.params.postId, body, { new: true })
            if (!editedPost) return next(createHttpError(404, `This post no longer exists and cannot be edited.`))
            if (oldPost.filename && req?.file) {
                await cloudinary.uploader.destroy(oldPost.filename)
            }
            res.send(editedPost)
        } catch (error) {
            console.log(error)
            next(error)
        }
    })
    .delete(async (req, res, next) => {
        try {
            const deletedPost = await PostModel.findByIdAndDelete(req.params.postId)
            if (!deletedPost) return next(createHttpError(404, `This post does not exist or has already been deleted.`))
            if (deletedPost.filename) {
                await cloudinary.uploader.destroy(deletedPost.filename)
            }
            res.status(204).send()
        } catch (error) {
            next(error)
        }
    })

// COMMENTS ENDPOINTS
postsRouter.post('/:postId/comments', createCommentValidator, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return next(createHttpError(400, errors))
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


//likes endpoints
postsRouter.post('/:username/:postId/like', async (req, res, next) => {
    try {
        const user = await ProfileModel.findOne({ username: req.params.username })
        const post = await PostModel.findById(req.params.postId)
        if (user && post) {
            const userLikesPost = await PostModel.findOne({ likes: user._id.toString() })
            if (userLikesPost) {
                await PostModel.findByIdAndUpdate(req.params.postId, { $pull: { likes: user._id } })
                await ProfileModel.findOneAndUpdate(req.params.username, { $pull: { likedPosts: post._id } })
                res.send(`You unliked post with id ${ req.params.postId }`)
            } else {
                await PostModel.findByIdAndUpdate(req.params.postId, { $push: { likes: user._id } })
                await ProfileModel.findOneAndUpdate(req.params.username, { $push: { likedPosts: post._id } })
                res.send(`You like post with id ${ req.params.postId }`)
            }
        } else {
            next(createHttpError(404, `Post with id ${ req.params.postId } not found`))
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.post('/:username/:postId/comments/:commentId/like', async (req, res, next) => {
    try {
        const user = await ProfileModel.findOne({ username: req.params.username })
        const post = await PostModel.findById(req.params.postId)
        if (user && post) {
            const commentIndex = post.comments.findIndex(c => c._id.toString() === req.params.commentId)
            if (commentIndex !== -1) {
                if (post.comments[commentIndex].likes.includes(user._id)) {
                    const likerIndex = post.comments[commentIndex].likes.findIndex(l => l.toString() === user._id.toString())
                    post.comments[commentIndex].likes.splice(likerIndex, 1)
                    await post.save()
                    res.send(post.comments[commentIndex])
                } else {
                    post.comments[commentIndex].likes.push(user._id)
                    await post.save()
                    res.send(post.comments[commentIndex])
                }
            } else {
                next(createHttpError(404, `Comment does not exist or has been deleted.`))
            }
        } else {
            next(createHttpError(404, `Post with id ${ req.params.postId } not found`))
        }
    } catch (error) {
        next(error)
    }
})










export default postsRouter;