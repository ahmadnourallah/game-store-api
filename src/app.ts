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
import cartRouter from "./routes/cart.router";
import jsonParser from "./middleware/jsonParser.middleware";
import config from "./config/env.config";
import cors from "cors";
import "./config/passport.config";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(jsonParser);
app.use(
	cors({
		origin: function (origin: string | undefined, callback: Function) {
			// allow requests with no origin
			if (!origin) return callback(null, true);
			if (config.ALLOWED_ORIGINS.indexOf(origin) === -1) {
				var msg =
					"The CORS policy for this site does not " +
					"allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
	})
);

app.use("/images", express.static("images/"));
app.use("/users", userRouter);
app.use("/games", gameRouter);
app.use("/platforms", platformRouter);
app.use("/genres", genreRouter);
app.use("/publishers", publisherRouter);
app.use("/cart", cartRouter);

app.use(clientErrorHandler);
app.use(serverErrorHandler);

export default app;
