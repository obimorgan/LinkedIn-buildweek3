import { Router } from 'express'

const jobsRouter = Router()

jobsRouter.route('/')
.get(async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})
.post(async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})

jobsRouter.route('/:jobId')
.get(async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})
.put(async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})
.delete(async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})

export default jobsRouter