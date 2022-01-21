import express from "express"
import ProfilesModel from "./schema.js"
import connectionRouter from "./connections.js"
import createHttpError from "http-errors"
import { parser, cloudinary } from '../utils/cloudinary.js'
import { encodeImage, getPDFReadableStream } from '../utils/pdf-tools.js'
import { pipeline } from "stream"
import { createProfileValidator } from '../middlewares/validation.js'
import { validationResult } from "express-validator"

const profilesRouter = express.Router({ mergeParams: true })

profilesRouter.use('/connections/:connectionUserId', connectionRouter)

profilesRouter.get('/email', async (req, res, next) => {
  try {
    const user = await ProfilesModel.findOne({ email: req.query.email })
    if (!user) return next(createHttpError(400, 'No user found'))
    res.send(user)
  } catch (error) {
    next(error)
  }
})

profilesRouter.route("/")
.get(async (req, res, next) => {
  try {
    const profiles = await ProfilesModel.find()
    .populate('connections')
    .populate('connectionsSent')
    .populate('connectionsReceived')
    .populate('applications')
    res.send(profiles)
  } catch (error) {
    next(error)
  }
})
.post(parser.single("profileImage"), createProfileValidator, async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return next(createHttpError(400, errors))
      const { name, surname } = req.body
      const newprofile = await new ProfilesModel({
        ...req.body,
        username: req.body.username.split(' ').join(''),
        image: req?.file?.path || `https://ui-avatars.com/api/?name=${name}+${surname}`,
        filename: req?.file?.filename || "",
      })
      await newprofile.save()
      res.status(201).send(newprofile)
    } catch (error) {
      // FIXME:
      console.log(error)
      next(error)
    }
})

profilesRouter.route("/:userName")
.get(async (req, res, next) => {
  try {
    const { userName } = req.params
    const profiles = await ProfilesModel.findOne({ username: userName })
    if (!profiles) return next(createHttpError(404,`The user with this userName ${userName} is not found`))
    res.status(201).send(profiles)
  } catch (error) {
    next(error)
  }
})
.put(parser.single("profileImage"), async (req, res, next) => {
  try {
    const { userName } = req.params
    const body = {
      ...req.body,
      image: req?.file?.path || req.body.image,
    }
    const editprofiles = await ProfilesModel.findOneAndUpdate(userName, body, { new: true })
    if (!editprofiles) return next(createHttpError(404, `The user with the username ${userName} is not found`))
    res.send(editprofiles)
  } catch (error) {
    console.log(error)
    next(error)
  }
})
.delete(async (req, res, next) => {
  try {
    const { userName } = req.params
    const deleteProfile = await ProfilesModel.findOneAndDelete(userName)
    console.log(deleteProfile)
    if (!deleteProfile) return next(createHttpError(404, `The user with the username ${userName} is not found`))
    if (deleteProfile.filename) {
      const deleteProfileImage = await cloudinary.uploader.destroy(deleteProfile.filename)
    }
    res.sendStatus(204)
  } catch (error) {
    next(error);
  }
});


profilesRouter.get('/:userName/pdf', async (req, res, next) => {
  try {
    const user = await ProfilesModel.findOne({ username: req.params.userName })
    if (!user) return next(createHttpError(404, `The profile with this id: ${ profilesId }, is not found`))
    const image = await encodeImage(user.image)
    res.setHeader('Content-Disposition', `attachment filename=${ user.name }.pdf`)
    console.log(user)
    const source = getPDFReadableStream(user, image)
    pipeline(source, res, error => {
      if (error) return next(error)
    })
  } catch (error) {
    next(error);
  }
});

export default profilesRouter