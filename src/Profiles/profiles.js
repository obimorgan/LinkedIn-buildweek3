/** @format */
import express from "express";
import ProfilesModel from "./schema.js";
import createHttpError from "http-errors";
import { parser, cloudinary } from "../utils/cloudinary.js";

const profilesRouter = express.Router({ mergeParams: true });

profilesRouter.route("/").get(async (req, res, next) => {
  try {
    const profiles = await ProfilesModel.find();
    res.status(200).send(profiles);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

profilesRouter.post(
  "/",
  parser.single("profileImage"),
  async (req, res, next) => {
    try {
      const newprofile = await new ProfilesModel({
        ...req.body,
        image: req.file ? req.file.path : req.body.image,
        filename: req?.file?.filename || "",
      });
      // newprofile.image = req.file ? req.file.path : req.body.image;
      await newprofile.save();
      res.status(201).send(newprofile);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

profilesRouter
  .route("/:profilesId")
  .get(async (req, res, next) => {
    try {
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

  .put(parser.single("profileImage"), async (req, res, next) => {
    try {
      const profilesId = req.params.profilesId;

      const body = {
        ...req.body,
        image: req.file ? req.file.path : req.body.image,
      };
      const editprofiles = await ProfilesModel.findByIdAndUpdate(
        profilesId,
        body,
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
      const deleteProfile = await ProfilesModel.findByIdAndDelete(profilesId)
      console.log(deleteProfile);
      if (deleteProfile) {
        const deleteProfileImage = await cloudinary.uploader.destroy(deleteProfile.filename)
        res.status(204).send();
      } else {
        next(
          createHttpError(400, `We couldnt find this profile id: ${profilesId}`)
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
//   //image upload endpoint
// profilesRouter.post(
//   "/:profileId/imageUpload",
//   parser.single("profileImage"),
//   async (req, res, next) => {
//     try {
//       3;
//       const profile = await ProfilesModel.findById(req.params.profileId);
//       if (profile) {
//         const profileToEdit = await ProfilesModel.findByIdAndUpdate(
//           req.params.profileId,
//           { $set: { imageUrl: req.file.path } },
//           { new: true }
//         );
//         await profileToEdit.save();
//         res.send(profileToEdit);
//       } else {
//         next(
//           createHttpError(
//             404,
//             `Review with id ${req.params.reviewId} does not exist or has been deleted.`
//           )
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );
export default profilesRouter;
