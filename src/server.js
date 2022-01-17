/** @format */

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import experienceRouter from "./Profiles/experienece.js";
import postsRouter from "./Posts/posts.js";
import profilesRouter from "./Profiles/experienece.js";
import { errorHandlers } from "./middlewares/errorHandlers.js";

const server = express();
const PORT = process.env.PORT;
server.use(cors());
server.use(express.json());

server.use("/posts", postsRouter);
server.use("/profiles", profilesRouter, experienceRouter);

server.use(errorHandlers)

mongoose.connect(process.env.MONGO_CONNECTION);
mongoose.connection.on("connected", () => {
  console.log("Connected  to mongo");
});

server.listen(PORT, () => {
  console.log(`Server listens to ${ PORT }`);
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
