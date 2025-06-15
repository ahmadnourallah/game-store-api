import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import {
	validateQueries,
	validateUser,
	validateUserId,
	validateLogin,
} from "../utils/validation";
import userController from "../controllers/user.controller";

const router = Router();

router.post("/authenticate", validateLogin(), userController.authenticate);
router.post("/", validateUser(), userController.createUser);

router.get(
	"/:userId",
	isAuthenticated,
	isAdmin,
	validateQueries(),
	validateUserId(),
	userController.getUser
);

router.get(
	"/",
	isAuthenticated,
	isAdmin,
	validateQueries(),
	userController.getUsers
);

router.delete(
	"/:userId",
	isAuthenticated,
	isAdmin,
	validateUserId(),
	userController.deleteUser
);

export default router;
