/** @format */

import express from "express";
import ProfilesModel from "./schema.js";
import connectionRouter from "./connections.js";
import createHttpError from "http-errors";
import { parser, cloudinary } from "../utils/cloudinary.js";
import { encodeImage, getPDFReadableStream } from "../utils/pdf-tools.js";
import { pipeline } from "stream";

const profilesRouter = express.Router({ mergeParams: true });

profilesRouter.use("/connections/:connectionUserId", connectionRouter);

profilesRouter
  .route("/")
  .get(async (req, res, next) => {
    try {
      const profiles = await ProfilesModel.find()
        .populate("connections")
        .populate("connectionsSent")
        .populate("connectionsReceived")
        .populate("applications");
      res.send(profiles);
    } catch (error) {
      next(error);
    }
  })
  .post(parser.single("profileImage"), async (req, res, next) => {
    try {
      const newprofile = await new ProfilesModel({
        ...req.body,
        image:
          req?.file?.path ||
          "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
        filename: req?.file?.filename || "",
      });
      await newprofile.save();
      res.status(201).send(newprofile);
    } catch (error) {
      next(error);
    }
  });

profilesRouter
  .route("/:userName")
  .get(async (req, res, next) => {
    try {
      const { userName } = req.params;
      const profiles = await ProfilesModel.findOne({ username: userName });
      if (!profiles)
        return next(
          createHttpError(
            404,
            `The user with this userName ${userName} is not found`
          )
        );
      res.status(201).send(profiles);
    } catch (error) {
      next(error);
    }
  })
  .put(parser.single("profileImage"), async (req, res, next) => {
    try {
      const userName = req.params.userName;
      const body = {
        ...req.body,
        image: req.file ? req.file.path : req.body.image,
      };
      const editprofiles = await ProfilesModel.findByIdAndUpdate(
        userName,
        body,
        { new: true }
      );
      if (!editprofiles)
        return next(
          createHttpError(
            404,
            `The user with the username ${userName} is not found`
          )
        );
      res.send(editprofiles);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const userName = req.params.userName;
      const deleteProfile = await ProfilesModel.findByIdAndDelete(userName);
      console.log(deleteProfile);
      if (!deleteProfile)
        return next(
          createHttpError(
            404,
            `The user with the username ${userName} is not found`
          )
        );
      // TODO: WHAT IF THE USER HAS NOT UPLOADED A CLOUDINARY IMAGE, CHECK FILENAME
      const deleteProfileImage = await cloudinary.uploader.destroy(
        deleteProfile.filename
      );
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

profilesRouter.get("/:userName/pdf", async (req, res, next) => {
  try {
    const user = await ProfilesModel.findOne({ username: req.params.userName });
    if (!user)
      return next(
        createHttpError(
          404,
          `The profile with this id: ${profilesId}, is not found`
        )
      );
    const image = await encodeImage(user.image);
    res.setHeader(
      "Content-Disposition",
      `attachment filename=${user.name}.pdf`
    );
    console.log(user);
    const source = getPDFReadableStream(user, image);
    pipeline(source, res, (error) => {
      if (error) return next(error);
    });
  } catch (error) {
    next(error);
  }
});

export default profilesRouter;
