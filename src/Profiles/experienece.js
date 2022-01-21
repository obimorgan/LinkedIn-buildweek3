import { Router } from "express"
import ProfilesModel from "./schema.js"
import createHttpError from "http-errors"
import { parser, cloudinary } from "../utils/cloudinary.js"
import { getExpCsv } from "../utils/csv.js"
import { validationResult } from "express-validator"
import { createExperienceValidator } from "../middlewares/validation.js"

const experienceRouter = Router()

experienceRouter.get("/:userName/experiences/csv", async (req, res, next) => {
  try {
    const { userName } = req.params
    const user = await ProfilesModel.findOne({ userName: userName })
    if (!user) return next(createHttpError(404, `The user with username ${userName} does not exist`))
    const field = Object.keys(user.experiences[0].toObject())
    const csvBuffer = getExpCsv(field, user.experiences)
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", 'attachment filename="experience.csv"')
    res.send(csvBuffer)
  } catch (error) {
    next(error)
  }
})

experienceRouter.route("/:userName/experiences")
.get(async (req, res, next) => {
  try {
    const { userName } = req.params
    const user = await ProfilesModel.findOne({ username: userName })
    if (!user) return next(createHttpError(404,`The user with username ${userName} does not exist`))
    res.send(user.experiences)
  } catch (error) {
    next(error)
  }
})
.post(parser.single("experienceCover"), createExperienceValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return next(createHttpError(400, errors))
    const { role, company } = req.body
    console.log(req.file)
    const experience = {
      ...req.body,
      image: req?.file?.path || `https://ui-avatars.com/api/?name=${company}+${role}`,
      filename: req?.file?.filename || "",
    }
    // FIXME: 
    console.log(req.body)
    const user = await ProfilesModel.findOneAndUpdate(
      { userName: req.params.userName },
      { $push: { experiences: experience } },
      { new: true, runValidators: true }
    )
    if (!user) return next(createHttpError(404,`The user with username ${userName} does not exist`))
    res.send(experience)
  } catch (error) {
    next(error)
  }
})

experienceRouter.route("/:userName/experiences/:experienceId")
.get(async (req, res, next) => {
  try {
    const { userName, experienceId } = req.params
    if (experienceId.length !== 24) return next(createHttpError(400, "Invalid ID"))
    const user = await ProfilesModel.findOne({ userName: userName })
    const experience = user.experiences.find(({ _id }) => _id.toString() === experienceId)
    res.send(experience)
  } catch (error) {
    next(error)
  }
})
.put(parser.single("experienceCover"), async (req, res, next) => {
  try {
    const { userName, experienceId } = req.params
    if (experienceId.length !== 24) return next(createHttpError(400, "Invalid ID"))
    const user = await ProfilesModel.findOne({ username: userName })
    const experienceIndex = user.experiences.findIndex(({ _id }) => _id.toString() === experienceId)
    user.experiences[experienceIndex] = {
      ...user.experiences[experienceIndex].toObject(),
      ...req.body,
    }
    user.save()
    res.send(user.experiences[experienceIndex])
  } catch (error) {
    next(error)
  }
})
.delete(async (req, res, next) => {
  try {
    const { userName, experienceId } = req.params
    if (experienceId.length !== 24) return next(createHttpError(400, "Invalid ID"))
    const user = await ProfilesModel.findOneAndUpdate(
      { userName: userName },
      { $pull: { experiences: { _id: experienceId } } },
      { runValidators: true }
    )
    const oldExperience = user.experiences.find(({ _id }) => _id.toString() === experienceId)
    if (!oldExperience) return next(createHttpError(404, 'This Experience does not exist'))
    if (oldExperience.filename) {
      await cloudinary.uploader.destroy(oldExperience.filename)
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default experienceRouter
