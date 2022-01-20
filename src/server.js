/** @format */

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import postsRouter from "./Posts/posts.js";
import profilesRouter from "./Profiles/profiles.js";
import experienceRouter from "./Profiles/experienece.js";
import jobsRouter from "./jobs/jobs.js";
import { errorHandlers } from "./middlewares/errorHandlers.js";
// import expressListEndpoints from 'express-list-endpoints'

//Registration
import bcrypt from "bcrypt";
import UserModel from "../views/user.js";
import session from "express-session";

const server = express();
const PORT = process.env.PORT;
server.use(cors());
server.use(express.json());

server.use("/posts", postsRouter);
server.use("/profiles", profilesRouter, experienceRouter);
server.use("/jobs", jobsRouter);

server.use(errorHandlers);

//Registration
server.set("view engine", "ejs");
server.set("register", "registration");
server.use(express.urlencoded({ extended: true })); // parses req.body
server.use(
  session({
    secret: "Welcome to the secret page!",
    resave: true,
    saveUninitialized: true,
  })
);

// ------------------Register--------------------- //
server.get("/register", async (req, res) => {
  res.render("register");
});
server.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const hash = await bcrypt.hash(password, 12);
  res.send("Successfully Registered");
  const user = await new UserModel({
    username,
    password: hash,
  });
  console.log(hash);
  await newUser.save();
  req.session.user_id = user._id;
  return;
});

// ------------------Login--------------------- //
server.get("/login", async (req, res) => {
  res.render("login");
});
server.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserModel.findOne({ username });
  console.log(user);
  const validPassword = await bcrypt.compare(password, user.password);
  if (validPassword) {
    req.session.user_id = user._id; //storing the user _id in the session
    // res.send("Logged In");
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

// ------------------Session--------------------- //
server.get("/secret", async (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  } else {
    res.send("Welcome to the secret page!");
  }
});

mongoose.connect(process.env.MONGO_CONNECTION);
mongoose.connection.on("connected", () => {
  console.log("Connected  to mongo");
});

server.listen(PORT, () => {
  console.log(`Server listens to ${PORT}`);
  // console.table(expressListEndpoints(server))
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
