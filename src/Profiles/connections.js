import { Router } from 'express'
import ProfilesModel from './schema.js'

const connectionRouter = Router({ mergeParams: true })

connectionRouter.post('/send-connection', async (req, res, next) => {
    try {
        const { connectionUserId } = req.params
        const { userId } = req.body
        if (connectionUserId === userId ) return next(createHttpError(400, 'You cannot connect with yourself'))
        const connectionReceived = await ProfilesModel.findByIdAndUpdate(
        connectionUserId,
        { $push: { connectionsReceived: userId } }  
        )
        if (!connectionReceived) return next(createHttpError(404, `The user with id ${connectionUserId} could not be found`))
        const connectionSent = await ProfilesModel.findByIdAndUpdate(
        userId,
        { $push: { connectionsSent: connectionUserId } }  
        )
        if (!connectionSent) return next(createHttpError(404, `The user with id ${userId} could not be found`))
        res.send(`You have sent a connection request to the user with ID ${connectionUserId}`)
    } catch (error) {
        console.log(error);
        next(error)
    }
})
  
  connectionRouter.post('/withdraw-connection', async (req, res, next) => {
    try {
        const { connectionUserId } = req.params
        const { userId } = req.body
        if (connectionUserId === userId ) return next(createHttpError(400, 'You cannot withdraw a connection with yourself'))
        const unconnectFrom = await ProfilesModel.findByIdAndUpdate(
        connectionUserId,
        { $pull: { connectionsReceived: userId } }  
        )
        if (!unconnectFrom) return next(createHttpError(404, `The user with id ${connectionUserId} could not be found`))
        const unconnectSender = await ProfilesModel.findByIdAndUpdate(
        userId,
        { $pull: { connectionsSent: connectionUserId } }  
        )
        if (!unconnectSender) return next(createHttpError(404, `The user with id ${userId} could not be found`))
        res.send(`You have withdrawn your connection request to the user with ID ${connectionUserId}`)
    } catch (error) {
        next(error)
    }
})
  
  connectionRouter.post('/accept', async (req, res, next ) => {
    try {
      const { connectionUserId } = req.params
      const { userId } = req.body
      const user = await ProfilesModel.findByIdAndUpdate(
        userId,
        { $pull: { connectionsReceived: connectionUserId } }
      )
      const user2 = await ProfilesModel.findByIdAndUpdate(
        userId,
        { $push: { connections: connectionUserId } }
      )
      if (!user) return next(createHttpError(404, 'Can\'t fiind a user with the ID you provided'))
      const secondUser = await ProfilesModel.findByIdAndUpdate(
        connectionUserId,
        { $pull: { connectionsSent: userId } }
      )
      const secondUser2 = await ProfilesModel.findByIdAndUpdate(
        connectionUserId,
        { $push: { connections: userId } }
      )
      if (!secondUser) return next(createHttpError(404, 'Can\'t fiind a user with the ID you provided'))
      res.send('You are now connected')
    } catch (error) {
      console.log(error);
      next(error)
    }
})
  
  connectionRouter.post('/decline', async (req, res, next ) => {
    try {
      const { connectionUserId } = req.params
      const { userId } = req.body
      const user = await ProfilesModel.findByIdAndUpdate(
        userId,
        { $pull: { connectionsReceived: connectionUserId } }
      )
      if (!user) return next(createHttpError(404, 'Can\'t fiind a user with the ID you provided'))
      const secondUser = await ProfilesModel.findByIdAndUpdate(
        connectionUserId,
        { $pull: { connectionsSent: userId } }
      )
      if (!secondUser) return next(createHttpError(404, 'Can\'t fiind a user with the ID you provided'))
      res.send('You declined the connection request')
    } catch (error) {
      console.log(error);
      next(error)
    }
})
  
  connectionRouter.post('/unconnect', async (req, res, next ) => {
    try {
      const { connectionUserId } = req.params
      const { userId } = req.body
      const user = await ProfilesModel.findByIdAndUpdate(
        userId,
        { $pull: { connections: connectionUserId } }
      )
      if (!user) return next(createHttpError(404, 'Can\'t fiind a user with the ID you provided'))
      const secondUser = await ProfilesModel.findByIdAndUpdate(
        connectionUserId,
        { $pull: { connections: userId } }
      )
      if (!secondUser) return next(createHttpError(404, 'Can\'t fiind a user with the ID you provided'))
      res.send('You are no longer connected with each other')
    } catch (error) {
      console.log(error);
      next(error)
    }
})

export default connectionRouter