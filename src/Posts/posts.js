/** @format */
import express from "express";
import PostModel from './schema.js'
import createHttpError from 'http-errors'
import q2m from 'query-to-mongo'
import { parser, cloudinary } from '../utils/cloudinary.js'

const postsRouter = express.Router();

//posts endpoints
postsRouter.post('/:username', parser.single('postImage'), async (req, res, next) => {
    try {
        const newPost = new PostModel(req.body)
        newPost.username = req.params.username
        newPost.image = req.file.path || ''
        newPost.filename = req.file.filename || ''
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

postsRouter.get('/:postId', async (req, res, next) => {
    try {
        const foundPost = await PostModel.findById(req.params.postId).populate('user')
        if (foundPost) {
            res.send(foundPost)
        } else {
            next(createHttpError(404, `This post no longer exists.`))
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.put('/:postId', async (req, res, next) => {
    try {
        const body = { ...req.body, image: req.file ? req.file.path : req.body.image }
        const editedPost = await PostModel.findByIdAndUpdate(req.params.postId, body, { new: true })
        if (editedPost) {
            res.send(editedPost)
        } else {
            next(createHttpError(404, `This post no longer exists and cannot be edited.`))
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.delete('/:postId', async (req, res, next) => {
    try {
        const deletedPost = await PostModel.findByIdAndDelete(req.params.postId)
        if (deletedPost) {
            await cloudinary.uploader.destroy(deletedPost.filename)
            res.status(204).send()
        } else {
            next(createHttpError(404, `This post does not exist or has already been deleted.`))
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

export default postsRouter;
