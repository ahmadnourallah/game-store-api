import { Request, Response, NextFunction } from "express";

class ServerError extends Error {
	public code;

	constructor(message: string, code: number = 500) {
		super(message);
		this.code = code;
	}
}

class ClientError extends Error {
	public code;
	public errors;

	constructor(
		errors: { [key: string]: string } | { [key: string]: string }[],
		code: number = 422,
		message: string = ""
	) {
		super(message);
		this.code = code;
		this.errors = errors;
	}
}

const clientErrorHandler = (
	err: ClientError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof ClientError)
		res.status(err.code).json({
			status: "fail",
			code: err.code,
			data: err.errors,
		});
	else next(err);
};

const serverErrorHandler = (
	err: ServerError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	res.status(err.code || 500).json({
		status: "error",
		code: err.code || 500,
		message: "Internal server error",
	});
};

export { serverErrorHandler, clientErrorHandler, ServerError, ClientError };
