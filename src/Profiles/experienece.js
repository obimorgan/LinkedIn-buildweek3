import express from "express"
import ProfileModel from './schema2.js'
import createHttpError from "http-errors"
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

const experienceRouter = express.Router()

const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET } = process.env

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SECRET
})

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bw3-linkedin-be',
    },
});

const parser = multer({ storage: cloudinaryStorage });

experienceRouter.route('/')
.get(async (req, res, next) => {
    try {
        const users = await ProfileModel.find()
        res.send(users)
    } catch (error) {
        next(error)
    }
})
.post(async (req, res, next) => {
    try {
        const user = new ProfileModel(req.body)
        user.save()
        res.send(user)
    } catch (error) {
        next(error)
    }
})

experienceRouter.route("/:userName/experiences")
.get(async (req, res, next) => {
    try {
        const { userName } = req.params
        const user = await ProfileModel.findOne({ userName: userName })
        if (!user) return next(createHttpError(404, `The user with username ${userName} does not exist`))
        res.send(user.experiences)
    } catch (error) {
        next(error)
    }
})
.post(parser.single('experienceCover'), async (req, res, next) => {
    try {
        const { role, company } = req.body
        const experience = { 
            ...req.body, 
            image: req?.file?.path || `https://ui-avatars.com/api/?name=${company}+${role}`,
            filename: req.file.filename || ''
        }
        const user = await ProfileModel.findOneAndUpdate(
            { userName: req.params.userName },
            { $push: { experiences: experience } },
            { new: true, runValidators: true }
        )
        if (!user) return next(createHttpError(404, `The user with username ${userName} does not exist`))
        res.send(user)
    } catch (error) {
        next(error)
    }
})

experienceRouter.route("/:userName/experiences/:experienceId")
.get(async (req, res, next) => {
    try {
        const { userName, experienceId } = req.params
        if (experienceId.length !== 24) return next(createHttpError(400, 'Invalid ID'))
        const user = await ProfileModel.findOne({ userName: userName })
        const experience = user.experiences.find(({ _id }) => _id.toString() === experienceId)
        res.send(experience)
    } catch (error) {
        next(error)
    }
})
.put(async (req, res, next) => {
    try {
        const { userName, experienceId } = req.params
        if (experienceId.length !== 24) return next(createHttpError(400, 'Invalid ID'))
        const user = await ProfileModel.findOne({ userName: userName })
        const experienceIndex = user.experiences.findIndex(({ _id }) => _id.toString() === experienceId )
        user.experiences[experienceIndex] = { ...user.experiences[experienceIndex].toObject(), ...req.body }
        user.save()
        res.send(user.experiences[experienceIndex])
    } catch (error) {
        next(error)
    }
})
.delete(async (req, res, next) => {
    try {
        const { userName, experienceId } = req.params
        if (experienceId.length !== 24) return next(createHttpError(400, 'Invalid ID'))
        const updatedUser = await ProfileModel.findOneAndUpdate(
            { userName: userName }, 
            { $pull: { experiences: { _id: experienceId } } },
            { runValidators: true }    
        )
        console.log(updatedUser)
        const oldExperience = updatedUser.experiences.find(({ _id }) => _id.toString() === experienceId )
        await cloudinary.uploader.destroy(oldExperience.filename)
        res.status(204).send()
    } catch (error) {
        console.log(error)
        next(error)
    }
})

export default experienceRouter