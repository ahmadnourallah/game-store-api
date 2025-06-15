import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db";
import { matchedData } from "express-validator";

const prisma = new PrismaClient();

const getPlatforms = async (req: Request, res: Response) => {
	const { start, end, search, orderBy, order } = matchedData(req);

	const platforms = await prisma.platform.findMany({
		where: {
			name: { contains: search },
		},
		skip: start,
		take: end - start,
		orderBy: {
			[orderBy === "title" ? "name" : "createdAt"]: order,
		},
	});

	res.status(200).json({
		status: "success",
		data: { count: platforms.length, platforms },
	});
};

const getPlatform = async (req: Request, res: Response) => {
	const { platformId } = matchedData(req);

	const platform = await prisma.platform.findUnique({
		where: { id: platformId },
		include: {
			_count: { select: { games: true } },
		},
	});

	res.status(200).json({ status: "success", data: { platform } });
};

const getPlatformGames = async (req: Request, res: Response) => {
	const { start, end, search, order, orderBy, platformId } = matchedData(req);

	const games = await prisma.game.findMany({
		where: {
			platforms: {
				some: {
					id: platformId,
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
	});

	res.status(200).json({
		status: "success",
		data: { count: games.length, games },
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
	const { platformId, name, games } = matchedData(req);

	let newGames;
	let excludedGames;

	if (games) {
		newGames = games.map((game: string) => {
			return { title: game };
		});

		const platform = await prisma.platform.findUnique({
			where: { id: platformId },
			select: { games: { select: { title: true } } },
		});

		excludedGames = platform?.games.filter(
			(game) => !games.includes(game.title)
		);
	}

	const platform = await prisma.platform.update({
		where: {
			id: platformId,
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
	const { platformId } = matchedData(req);

	await prisma.platform.delete({ where: { id: platformId } });

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
