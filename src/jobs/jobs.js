import { Router } from 'express'
import jobsModel from './schema.js'

const jobsRouter = Router()

jobsRouter.route('/')
.get(async (req, res, next) => {
    try {
        const jobs = await jobsModel.find()
        res.send(jobs)
    } catch (error) {
        next(error)
    }
})
.post(async (req, res, next) => {
    try {
        const job = await new jobsModel(req.body)
        await job.save()
        res.status(201).send(job)
    } catch (error) {
        next(error)
    }
})

jobsRouter.route('/:jobId')
.get(async (req, res, next) => {
    try {
        const job = await jobsModel.findById(req.params.jobId)
        res.send(job)
    } catch (error) {
        next(error)
    }
})
.put(async (req, res, next) => {
    try {
        const job = await jobsModel.findByIdAndUpdate(req.params.jobId, req.body, { new: true, runValidators: true })
        res.send(job)
    } catch (error) {
        next(error)
    }
})
.delete(async (req, res, next) => {
    try {
        const job = await jobsModel.findByIdAndDelete(req.params.jobId)
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

export default jobsRouter