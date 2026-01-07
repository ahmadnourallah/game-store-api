import {
	serverErrorHandler,
	clientErrorHandler,
} from "./middleware/error.middleware";
import { ALLOWED_ORIGINS } from "./config/env.config";
import { existsSync, mkdir } from "node:fs";
import express from "express";
import userRouter from "./routes/user.router";
import gameRouter from "./routes/game.router";
import platformRouter from "./routes/platform.router";
import genreRouter from "./routes/genre.router";
import publisherRouter from "./routes/publisher.router";
import cartRouter from "./routes/cart.router";
import jsonParser from "./middleware/jsonParser.middleware";
import cors from "cors";
import multer from "multer";
import "./config/passport.config";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(jsonParser);

if (!existsSync("images")) mkdir("images", () => null);

app.use("/images", express.static("images/"));
app.use("/games", gameRouter);
app.use(multer().none());
app.use("/users", userRouter);
app.use("/platforms", platformRouter);
app.use("/genres", genreRouter);
app.use("/publishers", publisherRouter);
app.use("/cart", cartRouter);

app.use(clientErrorHandler);
app.use(serverErrorHandler);

export default app;
