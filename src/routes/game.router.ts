import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import {
	validateQueries,
	validateGame,
	validateGameId,
} from "../utils/validation";
import gameController from "../controllers/game.controller";
import imageMiddleware from "../middleware/imageMiddleware";

const router = Router();

router.get("/:gameId", validateGameId(), gameController.getGame);

router.put(
	"/:gameId",
	isAuthenticated,
	isAdmin,
	validateGameId(),
	imageMiddleware,
	validateGame(),
	gameController.updateGame
);

router.delete(
	"/:gameId",
	isAuthenticated,
	isAdmin,
	validateGameId(),
	gameController.deleteGame
);

router.post(
	"/",
	isAuthenticated,
	isAdmin,
	imageMiddleware,
	validateGame(),
	gameController.createGame
);

router.get("/", validateQueries(), gameController.getGames);

export default router;
