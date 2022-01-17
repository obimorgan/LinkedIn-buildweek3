/** @format */
import express from "express";
import ProfilesModel from "./schema.js";
import createHttpError from "http-errors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const profilesRouter = express.Router({ mergeParams: true });

//cloudinary config
const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nft-products-mongo",
  },
});

const parser = multer({ storage: cloudinaryStorage });

//image upload endpoint
profilesRouter.post(
  "/:profileId/imageUpload",
  parser.single("profileImage"),
  async (req, res, next) => {
    try {
      const profile = await ProfilesModel.findById(req.params.profileId);
      if (profile) {
        const profileToEdit = await ProfilesModel.findByIdAndUpdate(
          req.params.profileId,
          { $set: { imageUrl: req.file.path } },
          { new: true }
        );
        await profileToEdit.save();
        res.send(profileToEdit);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} does not exist or has been deleted.`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

profilesRouter
  .route("/")
  .get(async (req, res, next) => {
    try {
      const profiles = await ProfilesModel.find();
      res.status(200).send(profiles);
    } catch (error) {
      console.log(error);
      next(error);
    }
  })

  .post(async (req, res, next) => {
    try {
      const newprofile = await ProfilesModel(req.body).save();
      res.status(201).send(newprofile);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

profilesRouter
  .route("/:profilesId")
  .get(async (req, res, next) => {
    try {
      const profilesId = req.params.profilesId;
      const profiles = await ProfilesModel.findById(profilesId);
      if (profiles) {
        res.status(201).send(profiles);
      } else {
        next(
          createHttpError(
            404,
            `            The profile with this id:
            ${profilesId},
            is not found`
          )
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .put(async (req, res, next) => {
    try {
      const profilesId = req.params.profilesId;
      const editprofiles = await ProfilesModel.findByIdAndUpdate(
        profilesId,
        req.body,
        {
          new: true,
        }
      );
      console.log(editprofiles);
      if (editprofiles) {
        res.status(201).send(editprofiles);
      } else {
        next(
          createHttpError(
            404,
            `The profile with this id:
            ${profilesId}
            is not found`
          )
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const profilesId = req.params.profilesId;
      const deleteProfile = await ProfilesModel.findByIdAndDelete(profilesId, {
        new: true,
      });
      console.log(deleteProfile);
      if (deleteProfile) {
        res.status(204).send(deleteProfile);
      } else {
        next(createHttpError(400, "SyntaxError"));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
export default profilesRouter;
