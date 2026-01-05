import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import {
	validateCartItem,
	validateCartItemId,
	validateQueries,
} from "../utils/validation";
import cartController from "../controllers/cart.controller";

const router = Router();

router.get("/", isAuthenticated, cartController.getCart);

router.get(
	"/all",
	isAuthenticated,
	isAdmin,
	validateQueries(),
	cartController.getCarts
);

router.delete("/", isAuthenticated, cartController.deleteCart);

router.delete(
	"/:gameId",
	isAuthenticated,
	validateCartItemId(),
	cartController.deleteCartItem
);

router.post(
	"/",
	isAuthenticated,
	validateCartItem(),
	cartController.createCartItem
);

export default router;
