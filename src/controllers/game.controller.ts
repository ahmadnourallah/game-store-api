import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db/index";
import { matchedData } from "express-validator";

const prisma = new PrismaClient();

const getGames = async (req: Request, res: Response) => {
	const { start, end, search, orderBy, order } = matchedData(req);

	const games = await prisma.game.findMany({
		where: {
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
		include: { genres: true, publishers: true, platforms: true },
	});

	res.status(200).json({
		status: "success",
		data: { count: games.length, games },
	});
};

const getGame = async (req: Request, res: Response) => {
	const { gameId } = matchedData(req);

	const game = await prisma.game.findUnique({
		where: { id: gameId },
		include: { genres: true, publishers: true, platforms: true },
	});

	res.status(200).json({ status: "success", data: { game } });
};

const createGame = async (req: Request, res: Response) => {
	const { title, description, price, genres, publishers, platforms } =
		matchedData(req);

	const newGenres =
		genres &&
		genres.map((genre: string) => {
			return {
				where: { name: genre },
				create: { name: genre },
			};
		});

	const newPlatforms =
		platforms &&
		platforms.map((platform: string) => {
			return {
				where: { name: platform },
				create: { name: platform },
			};
		});

	const newPublishers =
		publishers &&
		publishers.map((publisher: string) => {
			return {
				where: { name: publisher },
				create: { name: publisher },
			};
		});

	const game = await prisma.game.create({
		data: {
			title,
			description,
			price,
			genres: { connectOrCreate: newGenres },
			platforms: { connectOrCreate: newPlatforms },
			publishers: { connectOrCreate: newPublishers },
		},

		include: { genres: true, publishers: true, platforms: true },
	});

	res.status(201).json({ status: "success", data: { game } });
};

const updateGame = async (req: Request, res: Response) => {
	const { gameId, title, description, price, publishers, genres, platforms } =
		matchedData(req);

	let newPublishers,
		excludedPublishers,
		newGenres,
		excludedGenres,
		newPlatforms,
		excludedPlatforms;

	const game = await prisma.game.findUnique({
		where: { id: gameId },
		select: {
			publishers: { select: { name: true } },
			platforms: { select: { name: true } },
			genres: { select: { name: true } },
		},
	});

	if (publishers) {
		newPublishers = publishers.map((publisher: string) => {
			return {
				where: { name: publisher },
				create: { name: publisher },
			};
		});

		excludedPublishers = game?.publishers.filter(
			(publisher) => !publishers.includes(publisher.name)
		);
	}

	if (genres) {
		newGenres = genres.map((genre: string) => {
			return {
				where: { name: genre },
				create: { name: genre },
			};
		});

		excludedGenres = game?.genres.filter(
			(genre) => !genres.includes(genre.name)
		);
	}

	if (platforms) {
		newPlatforms = platforms.map((platform: string) => {
			return {
				where: { name: platform },
				create: { name: platform },
			};
		});

		excludedPlatforms = game?.platforms.filter(
			(platform) => !platforms.includes(platform.name)
		);
	}

	const updatedGame = await prisma.game.update({
		where: {
			id: gameId,
		},
		data: {
			title,
			description,
			price,
			genres: {
				connectOrCreate: newGenres,
				disconnect: excludedGenres,
			},
			platforms: {
				connectOrCreate: newPlatforms,
				disconnect: excludedPlatforms,
			},
			publishers: {
				connectOrCreate: newPublishers,
				disconnect: excludedPublishers,
			},
		},

		include: { genres: true, publishers: true, platforms: true },
	});

	res.status(200).json({ status: "success", data: { updatedGame } });
};

const deleteGame = async (req: Request, res: Response) => {
	const { gameId } = matchedData(req);

	await prisma.game.delete({ where: { id: gameId } });

	res.status(200).json({ status: "success", data: null });
};

export default {
	getGames,
	getGame,
	createGame,
	updateGame,
	deleteGame,
};
