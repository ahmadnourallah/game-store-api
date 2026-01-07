import { Request, Response } from "express";
import { type Cart, type Game, PrismaClient } from "~/prisma/generated/client";
import { matchedData } from "express-validator";
import { ADAPTER } from "../config/env.config";

const prisma = new PrismaClient({ adapter: ADAPTER });

const getCarts = async (req: Request, res: Response) => {
	const { start, end } = matchedData(req);

	const query = {
		where: {
			NOT: {
				cartItems: {
					none: {},
				},
			},
		},
		skip: start,
		take: end - start,
		include: {
			cartItems: true,
			user: {
				select: {
					name: true,
				},
			},
		},
	};

	const [carts, total] = await prisma.$transaction([
		prisma.cart.findMany(query),
		prisma.cart.count({ where: query.where }),
	]);

	res.status(200).json({
		status: "success",
		data: { total, carts },
	});
};

const getCart = async (req: Request, res: Response) => {
	const cart = await prisma.cart.findUnique({
		where: { userId: req?.user?.id },
		include: { cartItems: true },
	});

	res.status(200).json({ status: "success", data: { cart } });
};

const deleteCart = async (req: Request, res: Response) => {
	const cart = (await prisma.cart.findUnique({
		where: { userId: req?.user?.id },
	})) as Cart;

	await prisma.cartItem.deleteMany({
		where: {
			cartId: cart.id,
		},
	});

	res.status(200).json({ status: "success", data: null });
};

const createCartItem = async (req: Request, res: Response) => {
	const { gameId, quantity } = matchedData(req);

	const game = (await prisma.game.findUnique({
		where: { id: gameId },
	})) as Game;

	const oldCart = (await prisma.cart.findUnique({
		where: { userId: req?.user?.id },
	})) as Cart;

	await prisma.cartItem.upsert({
		where: {
			cartId_gameId: {
				cartId: oldCart.id,
				gameId,
			},
		},
		update: {
			quantity: { increment: quantity },
			price: { increment: quantity * game.price },
		},
		create: {
			cart: { connect: { id: oldCart.id } },
			game: { connect: { id: game.id } },
			quantity,
			price: game.price * quantity,
		},
	});

	const updatedCart = await prisma.cart.findUnique({
		where: { userId: req?.user?.id },
		include: { cartItems: true },
	});

	res.status(201).json({ status: "success", data: { cart: updatedCart } });
};

const deleteCartItem = async (req: Request, res: Response) => {
	const { gameId } = matchedData(req);

	const cart = (await prisma.cart.findUnique({
		where: { userId: req?.user?.id },
	})) as Cart;

	await prisma.cartItem.delete({
		where: {
			cartId_gameId: {
				cartId: cart.id,
				gameId,
			},
		},
	});

	res.status(200).json({ status: "success", data: null });
};

export default {
	getCart,
	getCarts,
	deleteCart,
	deleteCartItem,
	createCartItem,
};
