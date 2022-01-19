/** @format */
import express from "express";
import ProfilesModel from "./schema.js";
import createHttpError from "http-errors";
import { parser, cloudinary } from "../utils/cloudinary.js";
import { encodeImage, getPDFReadableStream } from "../utils/pdf-tools.js";
import { pipeline } from "stream";

const profilesRouter = express.Router({ mergeParams: true });

profilesRouter.route("/").get(async (req, res, next) => {
  try {
    const profiles = await ProfilesModel.find()
      .populate("following")
      .populate("followers")
      .populate("applications");
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
        image:
          req?.file?.path ||
          "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
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
  .route("/:userName")
  .get(async (req, res, next) => {
    try {
      const profiles = await ProfilesModel.findOne({
        username: req.params.userName,
      });
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
      const userName = req.params.userName;

      const body = {
        ...req.body,
        image: req.file ? req.file.path : req.body.image,
      };
      const editprofiles = await ProfilesModel.findOneAndUpdate(
        userName,
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
      const deleteProfile = await ProfilesModel.findByIdAndDelete(profilesId);
      console.log(deleteProfile);
      if (deleteProfile) {
        await cloudinary.uploader.destroy(deleteProfile.filename);
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

profilesRouter.get("/:userName/pdf", async (req, res, next) => {
  const user = await ProfilesModel.findOne({ username: req.params.userName });
  if (user) {
    const image = await encodeImage(user.image);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${user.name}.pdf`
    );
    console.log(user);
    console.log(user.toObject().experiences);
    const source = getPDFReadableStream(user.toObject(), image);
    pipeline(source, res, (error) => {
      if (error) next(error);
    });
  } else {
    next(
      createHttpError(
        404,
        `The profile with this id: ${profilesId}, is not found`
      )
    );
  }
});

// TODO: If User is following someone then they must unfollow them if they hit the endpoint again
profilesRouter.post("/:profilesId/follow", async (req, res, next) => {
  try {
    const { profilesId } = req.params;
    const { userId } = req.body;
    if (profilesId === userId)
      return next(createHttpError(400, "You cannot follow yourself"));
    const follower = await ProfilesModel.findByIdAndUpdate(profilesId, {
      $push: { followers: userId },
    });
    if (!follower)
      return next(
        createHttpError(
          404,
          `The user with id ${profilesId} could not be found`
        )
      );
    const following = await ProfilesModel.findByIdAndUpdate(userId, {
      $push: { following: profilesId },
    });
    if (!following)
      return next(
        createHttpError(404, `The user with id ${userId} could not be found`)
      );
    res.send(`You are now following the user with ID ${profilesId}`);
  } catch (error) {
    next(error);
  }
});

profilesRouter.post("/:profilesId/unfollow", async (req, res, next) => {
  try {
    const { profilesId } = req.params;
    const { userId } = req.body;
    if (profilesId === userId)
      return next(createHttpError(400, "You cannot unfollow yourself"));
    const unFollower = await ProfilesModel.findByIdAndUpdate(profilesId, {
      $pull: { followers: userId },
    });
    if (!unFollower)
      return next(
        createHttpError(
          404,
          `The user with id ${profilesId} could not be found`
        )
      );
    const unFollowing = await ProfilesModel.findByIdAndUpdate(userId, {
      $pull: { following: profilesId },
    });
    if (!unFollowing)
      return next(
        createHttpError(404, `The user with id ${userId} could not be found`)
      );
    res.send(`You are now unfollowing the user with ID ${profilesId}`);
  } catch (error) {
    next(error);
  }
});

export default profilesRouter;
