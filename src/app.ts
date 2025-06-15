import {
	serverErrorHandler,
	clientErrorHandler,
} from "./middleware/error.middleware";
import express from "express";
import userRouter from "./routes/user.router";
import "./config/passport.config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);

app.use(clientErrorHandler);
app.use(serverErrorHandler);

export default app;
