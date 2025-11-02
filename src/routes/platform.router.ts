import { Router } from "express";
import {
	validateQueries,
	validatePlatform,
	validatePlatformName,
} from "../utils/validation";
import platformController from "../controllers/platform.controller";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

router.get(
	"/:platformName",
	validatePlatformName(),
	platformController.getPlatform
);

router.get(
	"/:platformName/games",
	validatePlatformName(),
	validateQueries(),
	platformController.getPlatformGames
);

router.put(
	"/:platformName",
	isAuthenticated,
	isAdmin,
	validatePlatformName(),
	validatePlatform(),
	platformController.updatePlatform
);
router.get("/", validateQueries(), platformController.getPlatforms);

router.delete(
	"/:platformName",
	isAuthenticated,
	isAdmin,
	validatePlatformName(),
	platformController.deletePlatform
);

router.post(
	"/",
	isAuthenticated,
	isAdmin,
	validatePlatform(),
	platformController.createPlatform
);

export default router;
