/** @format */

import mongoose from "mongoose";
import express from "express";

const profilesRouter = express.Router();

profilesRouter.route("/").get(async, (req, res, next));

export default profilesRouter;
