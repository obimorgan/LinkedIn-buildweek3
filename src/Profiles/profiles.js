/** @format */
import express from "express";
import ProfilesModel from "./schema.js";
import createHttpError from "http-errors";
import { parser, cloudinary } from '../utils/cloudinary.js'

const profilesRouter = express.Router({ mergeParams: true });

profilesRouter.route("/").get(async (req, res, next) => {
  try {
    const profiles = await ProfilesModel.find()
    .populate('following')
    .populate('followers')
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
      const newprofile = await new ProfilesModel(req.body);
      newprofile.image = req.file ? req.file.path : req.body.image;
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

profilesRouter.post('/:profilesId/follow', async (req, res, next) => {
  try {
    const { profilesId } = req.params
    const { userId } = req.body
    if (profilesId === userId ) return next(createHttpError(400, 'You cannot follow yourself'))
    const follower = await ProfilesModel.findByIdAndUpdate(
      profilesId,
      { $push: { followers: userId } }  
    )
    if (!follower) return next(createHttpError(404, `The user with id ${profilesId} could not be found`))
    const following = await ProfilesModel.findByIdAndUpdate(
      userId,
      { $push: { following: profilesId } }  
    )
    if (!following) return next(createHttpError(404, `The user with id ${userId} could not be found`))
    res.send(`You are now following the user with ID ${profilesId}`)
  } catch (error) {
    next(error)
  }
})

export default profilesRouter;
