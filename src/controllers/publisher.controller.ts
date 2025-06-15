import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db";
import { matchedData } from "express-validator";

const prisma = new PrismaClient();

const getPublishers = async (req: Request, res: Response) => {
	const { start, end, search, orderBy, order } = matchedData(req);

	const publishers = await prisma.publisher.findMany({
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
		data: { count: publishers.length, publishers },
	});
};

const getPublisher = async (req: Request, res: Response) => {
	const { publisherId } = matchedData(req);

	const publisher = await prisma.publisher.findUnique({
		where: { id: publisherId },
		include: {
			_count: { select: { games: true } },
		},
	});

	res.status(200).json({ status: "success", data: { publisher } });
};

const getPublisherGames = async (req: Request, res: Response) => {
	const { start, end, search, order, orderBy, publisherId } =
		matchedData(req);

	const games = await prisma.game.findMany({
		where: {
			publishers: {
				some: {
					id: publisherId,
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

const createPublisher = async (req: Request, res: Response) => {
	const { name, games } = matchedData(req);

	const newGames =
		games &&
		games.map((game: string) => {
			return { title: game };
		});

	const publisher = await prisma.publisher.create({
		data: {
			name,
			games: {
				connect: newGames,
			},
		},
	});

	res.status(201).json({ status: "success", data: { publisher } });
};

const updatePublisher = async (req: Request, res: Response) => {
	const { publisherId, name, games } = matchedData(req);

	let newGames;
	let excludedGames;

	if (games) {
		newGames = games.map((game: string) => {
			return { title: game };
		});

		const publisher = await prisma.publisher.findUnique({
			where: { id: publisherId },
			select: { games: { select: { title: true } } },
		});

		excludedGames = publisher?.games.filter(
			(game) => !games.includes(game.title)
		);
	}

	const publisher = await prisma.publisher.update({
		where: {
			id: publisherId,
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

	res.status(200).json({ status: "success", data: { publisher } });
};

const deletePublisher = async (req: Request, res: Response) => {
	const { publisherId } = matchedData(req);

	await prisma.publisher.delete({ where: { id: publisherId } });

	res.status(200).json({ status: "success", data: null });
};

export default {
	getPublishers,
	getPublisher,
	getPublisherGames,
	createPublisher,
	updatePublisher,
	deletePublisher,
};
