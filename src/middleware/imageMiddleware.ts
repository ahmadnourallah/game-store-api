import type { Request, Response, NextFunction } from "express";
import { ClientError } from "./error.middleware";
import { Readable } from "stream";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as crypto from "crypto";

class HashedFilenameStorage implements multer.StorageEngine {
	constructor(
		private options: multer.Options & {
			hashAlgo?: string;
		}
	) {
		this.options = options;
	}

	async _handleFile(
		req: Request,
		file: Express.Multer.File,
		cb: (error?: any, info?: Partial<Express.Multer.File>) => void
	) {
		// Setup hash and temporary storage for file chunks
		const hash = crypto.createHash(this.options.hashAlgo || "md5");
		const fileChunks: string[] = [];

		// Read the file stream to get the hash and also copy the data
		file.stream.on("data", (chunk) => {
			hash.update(chunk);
			fileChunks.push(chunk);
		});

		file.stream.on("end", () => {
			const fileHash = hash.digest("hex");
			// Get the original file extension
			const filename = fileHash;
			const finalPath = path.join(this.options.dest || "", filename);

			// Write the file from the copied chunks
			const outStream = fs.createWriteStream(finalPath);
			Readable.from(fileChunks).pipe(outStream);

			outStream.on("error", cb);
			outStream.on("finish", () => {
				cb(null, {
					destination: this.options.dest,
					filename: filename,
					path: finalPath,
					size: outStream.bytesWritten,
				});
			});
		});

		file.stream.on("error", cb);
	}

	_removeFile(
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null) => void
	) {
		fs.unlink(file.path, cb);
	}
}

const imageMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const upload = multer({
		storage: new HashedFilenameStorage({
			dest: "images/",
			fileFilter: (req: Request, file, callback: Function) => {
				if (!file.mimetype.startsWith("image/")) {
					return callback(
						new Error("Uploaded file must be an image.")
					);
				}

				callback(null, true);
			},
			limits: { files: 5, fileSize: 2e7 }, // 20mb file size limit
		}),
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
