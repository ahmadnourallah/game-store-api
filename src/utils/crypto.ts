import jwt from "jsonwebtoken";
import config from "../config/env.config";
import type { User } from "../prisma/src/db/index";

function issueJWT(user: Omit<User, "password">) {
	const id = user.id;
	const expiresIn = config.JWT_EXPIRATION_TIME;
	const payload = { id, iat: Date.now() };

	const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn });

	return { token, expiresIn };
}

export { issueJWT };
