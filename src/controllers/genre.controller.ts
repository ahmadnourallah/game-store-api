import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db";
import { matchedData } from "express-validator";

const prisma = new PrismaClient();

const getGenres = async (req: Request, res: Response) => {
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

	const [genres, total] = await prisma.$transaction([
		prisma.genre.findMany(query),
		prisma.genre.count({ where: query.where }),
	]);

	res.status(200).json({
		status: "success",
		data: { total, genres },
	});
};

const getGenre = async (req: Request, res: Response) => {
	const { genreName } = matchedData(req);

	const genre = await prisma.genre.findUnique({
		where: { name: genreName },
		include: {
			_count: { select: { games: true } },
		},
	});

	res.status(200).json({ status: "success", data: { genre } });
};

const getGenreGames = async (req: Request, res: Response) => {
	const { start, end, search, order, orderBy, genreName } = matchedData(req);

	const query = {
		where: {
			genres: {
				some: {
					name: genreName,
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

const createGenre = async (req: Request, res: Response) => {
	const { name, games } = matchedData(req);

	const newGames =
		games &&
		games.map((game: string) => {
			return { title: game };
		});

	const genre = await prisma.genre.create({
		data: {
			name,
			games: {
				connect: newGames,
			},
		},
	});

	res.status(201).json({ status: "success", data: { genre } });
};

const updateGenre = async (req: Request, res: Response) => {
	const { genreName, name, games } = matchedData(req);

	let newGames;
	let excludedGames;

	if (games) {
		newGames = games.map((game: string) => {
			return { title: game };
		});

		const genre = await prisma.genre.findUnique({
			where: { name: genreName },
			select: { games: { select: { title: true } } },
		});

		excludedGames = genre?.games.filter(
			(game) => !games.includes(game.title)
		);
	}

	const genre = await prisma.genre.update({
		where: {
			name: genreName,
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

	res.status(200).json({ status: "success", data: { genre } });
};

const deleteGenre = async (req: Request, res: Response) => {
	const { genreName } = matchedData(req);

	await prisma.genre.delete({ where: { name: genreName } });

	res.status(200).json({ status: "success", data: null });
};

export default {
	getGenres,
	getGenre,
	getGenreGames,
	createGenre,
	updateGenre,
	deleteGenre,
};
