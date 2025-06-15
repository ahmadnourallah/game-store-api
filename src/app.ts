import {
	serverErrorHandler,
	clientErrorHandler,
} from "./middleware/error.middleware";
import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clientErrorHandler);
app.use(serverErrorHandler);

export default app;
