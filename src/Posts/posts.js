/** @format */

import mongoose from "mongoose";
import express from "express";

const postsRouter = express.Router();

postsRouter.route("/").get(async, (req, res, next));

export default postsRouter;
