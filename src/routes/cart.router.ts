import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";
import { validateCartItem, validateCartItemId } from "../utils/validation";
import cartController from "../controllers/cart.controller";

const router = Router();

router.get("/", isAuthenticated, cartController.getCart);

router.delete("/", isAuthenticated, cartController.deleteCart);

router.delete(
	"/:gameId",
	isAuthenticated,
	validateCartItemId(),
	validateCartItem(),
	cartController.deleteCartItem
);

router.post(
	"/",
	isAuthenticated,
	validateCartItem(),
	cartController.createCartItem
);

export default router;
