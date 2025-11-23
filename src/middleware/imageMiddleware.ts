import type { Request, Response, NextFunction } from "express";
import { ClientError } from "./error.middleware";
import multer from "multer";

const imageMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const upload = multer({
		dest: "images/",
		fileFilter: (req: Request, file, callback: Function) => {
			if (!file.mimetype.startsWith("image/")) {
				return callback(new Error("Uploaded file must be an image."));
			}

			callback(null, true);
		},
		limits: { files: 5, fileSize: 2e7 }, // 20mb file size limit
	}).array("images");

	upload(req, res, (err) => {
		if (err) {
			next(
				new ClientError({
					images: err.message,
				})
			);
		}

		next();
	});
};

export default imageMiddleware;
