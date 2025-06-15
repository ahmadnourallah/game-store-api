import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaClient } from "../prisma/src/db/index";
import type { JwtPayload } from "jsonwebtoken";
import type { VerifiedCallback, StrategyOptions } from "passport-jwt";
import passport from "passport";
import config from "./env.config";

const prisma = new PrismaClient();

const opts: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: config.JWT_SECRET,
};

passport.use(
	new Strategy(opts, async (payload: JwtPayload, done: VerifiedCallback) => {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id: payload.id,
				},
			});

			if (user) return done(null, user);
			else return done(null, false);
		} catch (error) {
			return done(error);
		}
	})
);
