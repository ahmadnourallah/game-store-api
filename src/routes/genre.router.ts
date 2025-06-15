import { Router } from "express";
import {
	validateQueries,
	validateGenre,
	validateGenreId,
} from "../utils/validation";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";
import genreController from "../controllers/genre.controller";

const router = Router();

router.get("/:genreId", validateGenreId(), genreController.getGenre);

router.get(
	"/:genreId/games",
	validateGenreId(),
	validateQueries(),
	genreController.getGenreGames
);

router.put(
	"/:genreId",
	isAuthenticated,
	isAdmin,
	validateGenreId(),
	validateGenre(),
	genreController.updateGenre
);
router.get("/", validateQueries(), genreController.getGenres);

router.delete(
	"/:genreId",
	isAuthenticated,
	isAdmin,
	validateGenreId(),
	genreController.deleteGenre
);

router.post(
	"/",
	isAuthenticated,
	isAdmin,
	validateGenre(),
	genreController.createGenre
);

export default router;
