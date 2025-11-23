import { NextFunction, Request, Response } from "express";
import { ClientError } from "../middleware/error.middleware";
import { validationResult, query, body, param } from "express-validator";
import { Cart, PrismaClient } from "../prisma/src/db/index";

const prisma = new PrismaClient();

const validateResults = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty())
		throw new ClientError(
			errors
				.formatWith(({ path, msg }) => {
					return { [path]: msg };
				})
				.array()
		);
	next();
};

const validateQueries = () => [
	query("start")
		.default(0)
		.toInt()
		.isNumeric()
		.isLength({ min: 0 })
		.withMessage("Start must be a number")
		.withMessage("Start cannot be negative")
		.customSanitizer((start) => {
			if (start > 0) return start - 1;
			return start;
		}),
	query("end")
		.default(10)
		.toInt()
		.isNumeric()
		.withMessage("End must be a number")
		.isLength({ min: 0 })
		.withMessage("End cannot be negative")
		.custom((end, { req }) => !(end <= Number(req?.query?.start)))
		.withMessage("End must be larger than start")
		.custom((end, { req }) => !(end - Number(req?.query?.start) >= 30))
		.withMessage("Maximum number of items requested is 30"),
	query("search")
		.default("")
		.trim()
		.isString()
		.withMessage("Search must be a string"),
	query("orderBy")
		.default("date")
		.trim()
		.escape()
		.custom((orderBy) => orderBy === "date" || orderBy === "title")
		.withMessage("Order must be by title or date"),
	query("order")
		.default("asc")
		.trim()
		.escape()
		.custom((order) => order === "asc" || order === "desc")
		.withMessage("Order must be asc or desc"),
	validateResults,
];

const validateUser = () => [
	body("name").trim().notEmpty().withMessage("Name cannot be empty"),
	body("email")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Email cannot be empty")
		.isEmail()
		.withMessage("Email must be valid")
		.custom(async (email, { req }) => {
			const userExists = await prisma.user.findFirst({
				where: { id: { not: req?.params?.userId }, email },
			});
			if (userExists) throw new Error("Email already exists");
		}),
	body("password")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Password cannot be empty")
		.isLength({ min: 8, max: 16 })
		.withMessage("Password must be between 8-16 characters")
		.matches("[0-9]")
		.withMessage("Password must contain a number")
		.matches("(?=.*?[#@$?])")
		.withMessage("Password must contain a special character"),
	validateResults,
];

const validateUserId = () => [
	param("userId")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("User's id cannot be empty")
		.bail()
		.toInt()
		.isNumeric()
		.withMessage("User's id must be a number")
		.bail(),

	validateResults,

	async (req: Request, res: Response, next: NextFunction) => {
		const userExists = await prisma.user.findUnique({
			where: { id: req?.params?.userId as unknown as number },
		});

		if (!userExists)
			throw new ClientError({ resource: "Resource not found" }, 404);
		next();
	},
];

const validateLogin = () => [
	body("email").trim().notEmpty().withMessage("Email cannot be empty"),
	body("password").trim().notEmpty().withMessage("Password cannot be empty"),
	validateResults,
];

const validateGame = () => [
	body("title")
		.trim()
		.notEmpty()
		.withMessage("Title cannot be empty")
		.isString()
		.withMessage("Title must be a string")
		.custom(async (title, { req }) => {
			const gameExists = await prisma.game.findFirst({
				where: { id: { not: req?.params?.gameId }, title },
			});

			if (gameExists) throw new Error("Title must be unique");
		}),
	body("description")
		.trim()
		.notEmpty()
		.withMessage("Description cannot be empty")
		.isString()
		.withMessage("Description must be a string"),
	body("price")
		.trim()
		.notEmpty()
		.withMessage("Price cannot be empty")
		.toFloat()
		.isFloat()
		.withMessage("Price must be a floating point number"),
	body("genres")
		.trim()
		.optional()
		.toArray()
		.isArray()
		.withMessage("Genres must be an array")
		.notEmpty()
		.withMessage("Genres cannot be an empty array"),
	body("platforms")
		.trim()
		.optional()
		.toArray()
		.isArray()
		.withMessage("Platforms must be an array")
		.notEmpty()
		.withMessage("Platforms cannot be an empty array"),
	body("publishers")
		.trim()
		.optional()
		.toArray()
		.isArray()
		.withMessage("Publishers must be an array")
		.notEmpty()
		.withMessage("Publishers cannot be an empty array"),
	validateResults,
];

const validateGameId = () => [
	param("gameId")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Game's id cannot be empty")
		.bail()
		.toInt()
		.isNumeric()
		.withMessage("Game's id must be a number")
		.bail(),

	validateResults,

	async (req: Request, res: Response, next: NextFunction) => {
		const gameExists = await prisma.game.findUnique({
			where: { id: req?.params?.gameId as unknown as number },
		});

		if (!gameExists)
			throw new ClientError({ resource: "Resource not found" }, 404);
		next();
	},
];

const validatePlatform = () => [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Platform's name cannot be empty")
		.bail()
		.isString()
		.withMessage("Platform's name must be a string")
		.bail()
		.custom(async (name, { req }) => {
			const platformExists = await prisma.platform.findFirst({
				where: { id: { not: req?.params?.platformId }, name },
			});

			if (platformExists) throw new Error("Platform must be unique");
		}),
	body("games")
		.trim()
		.optional()
		.toArray()
		.isArray()
		.withMessage("Games must be an array of titles")
		.bail()
		.custom(async (games) => {
			for (let game of games) {
				const gameExists = await prisma.game.findUnique({
					where: { title: game },
				});

				if (!gameExists) throw new Error("Some games don't exist");
			}
		}),
	validateResults,
];

const validatePlatformName = () => [
	param("platformName")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Platform's name cannot be empty")
		.bail()
		.isString()
		.withMessage("Platform's name must be a string")
		.bail(),

	validateResults,

	async (req: Request, res: Response, next: NextFunction) => {
		const platformExists = await prisma.platform.findUnique({
			where: { name: req?.params?.platformName as unknown as string },
		});

		if (!platformExists)
			throw new ClientError({ resource: "Resource not found" }, 404);
		next();
	},
];

const validateGenre = () => [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Genre's name cannot be empty")
		.bail()
		.isString()
		.withMessage("Genre's name must be a string")
		.bail()
		.custom(async (name, { req }) => {
			const genreExists = await prisma.genre.findFirst({
				where: { id: { not: req?.params?.genreId }, name },
			});

			if (genreExists) throw new Error("Genre must be unique");
		}),
	body("games")
		.trim()
		.optional()
		.toArray()
		.isArray()
		.withMessage("Games must be an array of titles")
		.bail()
		.custom(async (games) => {
			for (let game of games) {
				const gameExists = await prisma.game.findUnique({
					where: { title: game },
				});

				if (!gameExists) throw new Error("Some games don't exist");
			}
		}),
	validateResults,
];

const validateGenreName = () => [
	param("genreName")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Genre's name cannot be empty")
		.bail()
		.isString()
		.withMessage("Genre's name must be a string")
		.bail(),

	validateResults,

	async (req: Request, res: Response, next: NextFunction) => {
		const genreExists = await prisma.genre.findUnique({
			where: { name: req?.params?.genreName as unknown as string },
		});

		if (!genreExists)
			throw new ClientError({ resource: "Resource not found" }, 404);
		next();
	},
];

const validatePublisher = () => [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Publisher's name cannot be empty")
		.bail()
		.isString()
		.withMessage("Publisher's name must be a string")
		.bail()
		.custom(async (name, { req }) => {
			const publisherExists = await prisma.publisher.findFirst({
				where: { id: { not: req?.params?.publisherId }, name },
			});

			if (publisherExists) throw new Error("Publisher must be unique");
		}),
	body("games")
		.trim()
		.optional()
		.toArray()
		.isArray()
		.withMessage("Games must be an array of titles")
		.bail()
		.custom(async (games) => {
			for (let game of games) {
				const gameExists = await prisma.game.findUnique({
					where: { title: game },
				});

				if (!gameExists) throw new Error("Some games don't exist");
			}
		}),
	validateResults,
];

const validatePublisherId = () => [
	param("publisherId")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Publisher's id cannot be empty")
		.bail()
		.toInt()
		.isNumeric()
		.withMessage("Publisher's id must be a number")
		.bail(),

	validateResults,

	async (req: Request, res: Response, next: NextFunction) => {
		const publisherExists = await prisma.publisher.findUnique({
			where: { id: req?.params?.publisherId as unknown as number },
		});

		if (!publisherExists)
			throw new ClientError({ resource: "Resource not found" }, 404);
		next();
	},
];

const validateCartItem = () => [
	body("gameId")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Game's id cannot be empty")
		.bail()
		.toInt()
		.isNumeric()
		.withMessage("Game's id must be a number")
		.bail(),

	body("quantity")
		.trim()
		.escape()
		.default(1)
		.toInt()
		.isInt({ min: 1 })
		.withMessage("Quantity must be a number not less than 1")
		.bail(),

	validateResults,
];

const validateCartItemId = () => [
	param("gameId")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Game's id cannot be empty")
		.bail()
		.toInt()
		.isNumeric()
		.withMessage("Game's id must be a number")
		.bail(),

	validateResults,

	async (req: Request, res: Response, next: NextFunction) => {
		const cart = (await prisma.cart.findUnique({
			where: { userId: req?.user?.id },
		})) as Cart;

		const cartItemExists = await prisma.cartItem.findUnique({
			where: {
				cartId_gameId: {
					cartId: cart.id,
					gameId: req?.params?.gameId as unknown as number,
				},
			},
		});

		if (!cartItemExists)
			throw new ClientError({ resource: "Resource not found" }, 404);
		next();
	},
];

export {
	validateQueries,
	validateUser,
	validateUserId,
	validateLogin,
	validateGame,
	validateGameId,
	validatePlatform,
	validatePlatformName,
	validateGenre,
	validateGenreName,
	validatePublisher,
	validatePublisherId,
	validateCartItem,
	validateCartItemId,
};
