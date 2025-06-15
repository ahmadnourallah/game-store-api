import {
	serverErrorHandler,
	clientErrorHandler,
} from "./middleware/error.middleware";
import express from "express";
import userRouter from "./routes/user.router";
import gameRouter from "./routes/game.router";
import platformRouter from "./routes/platform.router";
import genreRouter from "./routes/genre.router";
import publisherRouter from "./routes/publisher.router";
import jsonParser from "./middleware/jsonParser.middleware";
import "./config/passport.config";

const app = express();

app.use(jsonParser);
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);
app.use("/games", gameRouter);
app.use("/platforms", platformRouter);
app.use("/genres", genreRouter);
app.use("/publishers", publisherRouter);

app.use(clientErrorHandler);
app.use(serverErrorHandler);

export default app;
