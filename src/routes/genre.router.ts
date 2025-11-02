import { Router } from "express";
import {
	validateQueries,
	validateGenre,
	validateGenreName,
} from "../utils/validation";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";
import genreController from "../controllers/genre.controller";

const router = Router();

router.get("/:genreName", validateGenreName(), genreController.getGenre);

router.get(
	"/:genreName/games",
	validateGenreName(),
	validateQueries(),
	genreController.getGenreGames
);

router.put(
	"/:genreName",
	isAuthenticated,
	isAdmin,
	validateGenreName(),
	validateGenre(),
	genreController.updateGenre
);
router.get("/", validateQueries(), genreController.getGenres);

router.delete(
	"/:genreName",
	isAuthenticated,
	isAdmin,
	validateGenreName(),
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
