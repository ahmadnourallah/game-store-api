import { NextFunction, Request, Response } from "express";
import { ClientError } from "../middleware/error.middleware";
import { validationResult, query, body, param } from "express-validator";
import { PrismaClient } from "../prisma/src/db/index";

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

export { validateQueries, validateUser, validateUserId, validateLogin };
