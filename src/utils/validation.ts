import { NextFunction, Request, Response } from "express";
import { ClientError } from "../middleware/error.middleware";
import { validationResult, query } from "express-validator";

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

export { validateQueries };
