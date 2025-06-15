import { Router } from "express";
import {
	validateQueries,
	validatePublisher,
	validatePublisherId,
} from "../utils/validation";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";
import publisherController from "../controllers/publisher.controller";

const router = Router();

router.get(
	"/:publisherId",
	validatePublisherId(),
	publisherController.getPublisher
);

router.get(
	"/:publisherId/games",
	validatePublisherId(),
	validateQueries(),
	publisherController.getPublisherGames
);

router.put(
	"/:publisherId",
	isAuthenticated,
	isAdmin,
	validatePublisherId(),
	validatePublisher(),
	publisherController.updatePublisher
);
router.get("/", validateQueries(), publisherController.getPublishers);

router.delete(
	"/:publisherId",
	isAuthenticated,
	isAdmin,
	validatePublisherId(),
	publisherController.deletePublisher
);

router.post(
	"/",
	isAuthenticated,
	isAdmin,
	validatePublisher(),
	publisherController.createPublisher
);

export default router;
