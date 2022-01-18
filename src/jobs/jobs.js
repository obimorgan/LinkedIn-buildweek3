import { Router } from 'express'
import jobsModel from './schema.js'
import createHttpError from 'http-errors'
import q2m from 'query-to-mongo'

const jobsRouter = Router()

jobsRouter.route('/')
.get(async (req, res, next) => {
    try {
        const query = q2m(req.query)
        console.log(query);
        const { criteria, options, links } = query
        const { sort, skip, limit } = options
        console.log(links)
        const totalJobs = await jobsModel.countDocuments(criteria)
        const jobs = await jobsModel.find(criteria)
        .sort(sort)
        .skip(skip)
        .limit(limit || 10)
        const pages = Math.ceil(totalJobs / limit || 10)
        // FIXME:
        // console.log(links('/jobs', totalJobs))
        res.send({ totalJobs, pages, jobs })
    } catch (error) {
        next(error)
    }
})
.post(async (req, res, next) => {
    try {
        const job = await new jobsModel(req.body).save()
        res.status(201).send(job)
    } catch (error) {
        next(error)
    }
})

jobsRouter.route('/:jobId')
.get(async (req, res, next) => {
    try {
        const { jobId } = req.params
        const job = await jobsModel.findById(jobId)
        if (!job) return next(createHttpError(404, `The Job with id ${jobId} does not exist.`))
        res.send(job)
    } catch (error) {
        next(error)
    }
})
.put(async (req, res, next) => {
    try {
        const { jobId } = req.params
        const job = await jobsModel.findByIdAndUpdate(jobId, req.body, { new: true, runValidators: true })
        if (!job) return next(createHttpError(404, `The Job with id ${jobId} does not exist.`))
        res.send(job)
    } catch (error) {
        next(error)
    }
})
.delete(async (req, res, next) => {
    try {
        const { jobId } = req.params
        const job = await jobsModel.findByIdAndDelete(jobId)
        if (!job) return next(createHttpError(404, `The Job with id ${jobId} does not exist.`))
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

jobsRouter.post(':jobId/apply', async (req, res, next) => {
    try {
        const { jobId } = req.params
        res.status(201).send('Application Succesfful')
    } catch (error) {
        next(error)
    }
})

export default jobsRouter