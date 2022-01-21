import { Router } from 'express'
import ProfilesModel from '../Profiles/schema.js'
import q2m  from 'query-to-mongo'

const searchRouter = Router() 

searchRouter.get('/', async (req, res, next) => {
    try {
        const query = q2m(req.query)
        const users = await ProfilesModel.find(query.criteria, { name: 1, surame: 1, bio: 1, image: 1 })
        res.send(users)
    } catch (error) {
        next(error)
    }
})

export default searchRouter