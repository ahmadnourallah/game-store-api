import { Router } from "express";
import {
	validateQueries,
	validatePlatform,
	validatePlatformId,
} from "../utils/validation";
import platformController from "../controllers/platform.controller";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

router.get(
	"/:platformId",
	validatePlatformId(),
	platformController.getPlatform
);

router.get(
	"/:platformId/games",
	validatePlatformId(),
	validateQueries(),
	platformController.getPlatformGames
);

router.put(
	"/:platformId",
	isAuthenticated,
	isAdmin,
	validatePlatformId(),
	validatePlatform(),
	platformController.updatePlatform
);
router.get("/", validateQueries(), platformController.getPlatforms);

router.delete(
	"/:platformId",
	isAuthenticated,
	isAdmin,
	validatePlatformId(),
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
