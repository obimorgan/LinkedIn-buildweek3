/** @format */

import { Router } from "express";
import PofilesModel from "./schema.js";
import createHttpError from "http-errors";
import { parser, cloudinary } from "../utils/cloudinary.js";
import { getExpCsv } from "../utils/csv.js";

const experienceRouter = Router();
experienceRouter
.route("/:userName/experiences/csv")
  .get(async (req, res, next) => {
    try {
      const { userName } = req.params;
      const user = await PofilesModel.findOne({ userName: userName });
      if (user) {
        console.log(user.experiences);
        const field = Object.keys(user.experiences[0].toObject());
        console.log(field)
        const csvBuffer = getExpCsv(field, user.experiences);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="experience.csv"'
        );
        res.send(csvBuffer);
      } else {
        return next(
          createHttpError(
            404,
            `The user with username ${userName} does not exist`
          )
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

experienceRouter
  .route("/:userName/experiences")
  .get(async (req, res, next) => {
    try {
      const { userName } = req.params;
      const user = await PofilesModel.findOne({ userName: userName });
      if (!user)
        return next(
          createHttpError(
            404,
            `The user with username ${userName} does not exist`
          )
        );
      res.send(user.experiences);
    } catch (error) {
      next(error);
    }
  })
  .post(parser.single("experienceCover"), async (req, res, next) => {
    try {
      const { role, company } = req.body;
      const experience = {
        ...req.body,
        image:
          req?.file?.path ||
          `https://ui-avatars.com/api/?name=${company}+${role}`,
        filename: req?.file?.filename || "",
      };
      const user = await PofilesModel.findOneAndUpdate(
        { userName: req.params.userName },
        { $push: { experiences: experience } },
        { new: true, runValidators: true }
      );
      if (!user)
        return next(
          createHttpError(
            404,
            `The user with username ${userName} does not exist`
          )
        );
      res.send(user);
    } catch (error) {
      next(error);
    }
  });

experienceRouter
  .route("/:userName/experiences/:experienceId")
  .get(async (req, res, next) => {
    try {
      const { userName, experienceId } = req.params;
      if (experienceId.length !== 24)
        return next(createHttpError(400, "Invalid ID"));
      const user = await PofilesModel.findOne({ userName: userName });
      const experience = user.experiences.find(
        ({ _id }) => _id.toString() === experienceId
      );
      res.send(experience);
    } catch (error) {
      next(error);
    }
  })
  .put(async (req, res, next) => {
    try {
      const { userName, experienceId } = req.params;
      if (experienceId.length !== 24)
        return next(createHttpError(400, "Invalid ID"));
      const user = await PofilesModel.findOne({ userName: userName });
      const experienceIndex = user.experiences.findIndex(
        ({ _id }) => _id.toString() === experienceId
      );
      user.experiences[experienceIndex] = {
        ...user.experiences[experienceIndex].toObject(),
        ...req.body,
      };
      user.save();
      res.send(user.experiences[experienceIndex]);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const { userName, experienceId } = req.params;
      if (experienceId.length !== 24)
        return next(createHttpError(400, "Invalid ID"));
      const updatedUser = await PofilesModel.findOneAndUpdate(
        { userName: userName },
        { $pull: { experiences: { _id: experienceId } } },
        { runValidators: true }
      );
      console.log(updatedUser);
      const oldExperience = updatedUser.experiences.find(
        ({ _id }) => _id.toString() === experienceId
      );
      await cloudinary.uploader.destroy(oldExperience.filename);
      res.status(204).send();
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

export default experienceRouter;
