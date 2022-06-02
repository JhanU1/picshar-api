import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import { connect, disconnect } from "./src/configs/db.config.js";

import indexRouter from "./src/routes/index.routes.js";
import usersRouter from "./src/routes/users.routes.js";
import postsRouter from "./src/routes/posts.routes.js";
import followRouter from "./src/routes/follow.routes.js";

const app = express();

// Middlewares
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/follows", followRouter);
app.use("/", indexRouter);

// Avoid connecting to db when testing
if (process.env.NODE_ENV !== "test") {
  // Connect database
  connect();

  // Disconnect database connection on server stop
  process.on("SIGINT", async () => {
    await disconnect();
    process.exit(0);
  });
}

export default app;
