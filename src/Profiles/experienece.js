import { Router } from "express"
import ProfileModel from './schema2.js'

const experienceRouter = Router()

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
        const user = await ProfileModel.findOne({ userName: req.params.userName })
        res.send(user.experiences)
    } catch (error) {
        next(error)
    }
})
.post(async (req, res, next) => {
    try {
        const user = await ProfileModel.findOneAndUpdate(
            { userName: req.params.userName },
            { $push: { experiences: req.body } },
            { new: true, runValidators: true }
        )
        res.send(user)
    } catch (error) {
        next(error)
    }
})

experienceRouter.route("/:userName/experiences/:experienceId")
.get(async (req, res, next) => {
    try {
        const { userName, experienceId } = req.params
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
        const updatedUser = await ProfileModel.findOneAndUpdate(
            { userName: userName }, 
            { $pull: { experiences: { _id: experienceId } } },
            { new: true, runValidators: true }    
        )
        res.send(updatedUser)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

export default experienceRouter
