import dotenv from "dotenv";

dotenv.config();

interface ConfigType {
	PORT: number;
}

const config: ConfigType = {
	PORT: Number(process.env.PORT) || 3000,
};

export default config;
