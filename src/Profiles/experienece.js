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
        const user = await ProfileModel.findOne({userName: req.params.userName})
        res.send(user.experiences)
    } catch (error) {
        next(error)
    }
})
.post(async (req, res, next) => {
    try {
        res.send('OK')
    } catch (error) {
        next(error)
    }
})

experienceRouter.route("/:userName/experiences/:experienceId")
.get(async (req, res, next) => {
    try {
        res.send('OK')
    } catch (error) {
        next(error)
    }
})
.put(async (req, res, next) => {
    try {
        res.send('OK')
    } catch (error) {
        next(error)
    }
})
.delete(async (req, res, next) => {
    try {
        res.send('OK')
    } catch (error) {
        next(error)
    }
})

export default experienceRouter
