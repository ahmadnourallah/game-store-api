import { StringValue } from "ms";
import dotenv from "dotenv";

dotenv.config();

interface ConfigType {
	PORT: number;
	DB_URL: string;
	JWT_SECRET: string;
	JWT_EXPIRATION_TIME: StringValue;
	ALLOWED_ORIGINS: string[];
	ADMIN_EMAIL: string;
	ADMIN_PASS: string;
	ADMIN_NAME: string;
}

const config: ConfigType = {
	PORT: Number(process.env.PORT) || 3000,
	DB_URL: process.env.DB_URL || "",
	JWT_SECRET: process.env.JWT_SECRET || "",
	JWT_EXPIRATION_TIME:
		(process.env.JWT_EXPIRATION_TIME as StringValue) || "2D",
	ALLOWED_ORIGINS: JSON.parse(process.env.ALLOWED_ORIGINS || "[]"),
	ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@gmail.com",
	ADMIN_PASS: process.env.ADMIN_PASSWORD || "admin123!",
	ADMIN_NAME: process.env.ADMIN_NAME || "Admin",
};

export default config;
