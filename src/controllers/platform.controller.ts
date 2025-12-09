import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db";
import { matchedData } from "express-validator";

const prisma = new PrismaClient();

const getPlatforms = async (req: Request, res: Response) => {
	const { start, end, search, orderBy, order } = matchedData(req);

	const query = {
		where: {
			name: { contains: search },
		},
		skip: start,
		take: end - start,
		orderBy: {
			[orderBy === "title" ? "name" : "createdAt"]: order,
		},
	};

	const [platforms, total] = await prisma.$transaction([
		prisma.platform.findMany(query),
		prisma.platform.count({ where: query.where }),
	]);

	res.status(200).json({
		status: "success",
		data: { total, platforms },
	});
};

const getPlatform = async (req: Request, res: Response) => {
	const { platformName } = matchedData(req);

	const platform = await prisma.platform.findUnique({
		where: { name: platformName },
		include: {
			_count: { select: { games: true } },
		},
	});

	res.status(200).json({ status: "success", data: { platform } });
};

const getPlatformGames = async (req: Request, res: Response) => {
	const { start, end, search, order, orderBy, platformName } =
		matchedData(req);

	const query = {
		where: {
			platforms: {
				some: {
					name: platformName,
				},
			},
			OR: [
				{ title: { contains: search } },
				{ description: { contains: search } },
			],
		},
		skip: start,
		take: end - start,
		orderBy: {
			[orderBy === "title" ? "title" : "createdAt"]: order,
		},
		include: { platforms: true },
	};

	const [games, total] = await prisma.$transaction([
		prisma.game.findMany(query),
		prisma.game.count({ where: query.where }),
	]);

	res.status(200).json({
		status: "success",
		data: { total, games },
	});
};

const createPlatform = async (req: Request, res: Response) => {
	const { name, games } = matchedData(req);

	const newGames =
		games &&
		games.map((game: string) => {
			return { title: game };
		});

	const platform = await prisma.platform.create({
		data: {
			name,
			games: {
				connect: newGames,
			},
		},
	});

	res.status(201).json({ status: "success", data: { platform } });
};

const updatePlatform = async (req: Request, res: Response) => {
	const { platformName, name, games } = matchedData(req);

	let newGames;
	let excludedGames;

	if (games) {
		newGames = games.map((game: string) => {
			return { title: game };
		});

		const platform = await prisma.platform.findUnique({
			where: { name: platformName },
			select: { games: { select: { title: true } } },
		});

		excludedGames = platform?.games.filter(
			(game) => !games.includes(game.title)
		);
	}

	const platform = await prisma.platform.update({
		where: {
			name: platformName,
		},
		data: {
			name,
			games: {
				connect: newGames,
				disconnect: excludedGames,
			},
		},
		select: {
			id: true,
			name: true,
			createdAt: true,
			_count: { select: { games: true } },
		},
	});

	res.status(200).json({ status: "success", data: { platform } });
};

const deletePlatform = async (req: Request, res: Response) => {
	const { platformName } = matchedData(req);

	await prisma.platform.delete({ where: { name: platformName } });

	res.status(200).json({ status: "success", data: null });
};

export default {
	getPlatforms,
	getPlatform,
	getPlatformGames,
	createPlatform,
	updatePlatform,
	deletePlatform,
};
