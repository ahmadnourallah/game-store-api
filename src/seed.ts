import { PrismaClient } from "~/prisma/generated/client";
import type { ReadableStream } from "node:stream/web";
import { mkdir, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { existsSync } from "node:fs";
import {
	ADMIN_EMAIL,
	ADMIN_NAME,
	ADMIN_PASS,
	ADAPTER,
} from "./config/env.config";
import { getRootPathSync } from "get-root-path";
import path from "node:path";
import bcryptjs from "bcryptjs";
import * as crypto from "crypto";

const prisma = new PrismaClient({ adapter: ADAPTER });

async function downloadImage(
	url: string,
	destination: string = "images"
): Promise<string> {
	let response;

	try {
		response = await fetch(url);
	} catch (e) {
		console.log("No internet connection!");
		return "";
	}

	if (!response.ok) {
		console.log("Resource does not exist!");
		return "";
	}

	if (response && response.body) {
		const absDestination = path.join(getRootPathSync(), destination);

		if (!existsSync(absDestination)) await mkdir(absDestination);

		const hash = crypto.createHash("md5");
		const fileChunks: string[] = [];

		const stream = Readable.fromWeb(response.body as ReadableStream<any>);

		console.log(`Downloading ${url}...`);

		for await (const chunk of stream) {
			hash.update(chunk);
			fileChunks.push(chunk);
		}

		const fileHash = hash.digest("hex");
		await writeFile(path.join(absDestination, fileHash), fileChunks);

		console.log("Done!");
		return path.join(destination, fileHash);
	}

	return "";
}

async function downloadImages(urls: string[]) {
	const paths: string[] = [];

	for (let url of urls) {
		const path = await downloadImage(url);
		if (path.length > 0) paths.push(path);
	}

	return paths;
}

async function purge() {
	await prisma.cartItem.deleteMany();
	await prisma.game.deleteMany();
	await prisma.genre.deleteMany();
	await prisma.publisher.deleteMany();
	await prisma.cart.deleteMany();
	await prisma.user.deleteMany();
}

async function seed() {
	const admin = await prisma.user.upsert({
		where: { email: ADMIN_EMAIL },
		update: {},
		create: {
			name: ADMIN_NAME,
			email: ADMIN_EMAIL,
			password: await bcryptjs.hash(ADMIN_PASS, 10),
			role: "ADMIN",
			cart: { create: {} },
		},
		include: { cart: true },
	});

	const lifeisstrange = await prisma.game.upsert({
		where: { title: "Life is Strange" },
		update: {},
		create: {
			title: "Life is Strange",
			description:
				"Interactive storytelling and plot-heavy games gained popularity, and “Life is Strange” arrived as teen mystery adventure. The plot will go through the life of Maxine, a teenager in possession of curious power, allowing her to stop and rewind time, in order to manipulate her surroundings. Max, after the reunion with her friend Chloe, is on the path to uncovering the secrets of Arcadia Bay. Players will have to deal with puzzle solving through the fetch quests, in order to change the world around them. The game puts players in situations, where they’re forced to make a moral choice, going through the decision which may have short-term or long-term consequences. Every choice made by the player will trigger the butterfly effect, surrounding the first playthrough of the game with a lot of emotional struggle, thoughtfully crafted by the developers at Dontnod Entertainment. Life is Strange is third person adventure game, where players might seem just as an observer of the stories, unfolding in front of them.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Square Enix" },
						create: { name: "Square Enix" },
					},
					{
						where: { name: "Feral Interactive" },
						create: { name: "Feral Interactive" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
					{
						where: { name: "iOS" },
						create: { name: "iOS" },
					},
					{
						where: { name: "Android" },
						create: { name: "Android" },
					},
				],
			},
			price: 3.98,
			images: await downloadImages([
				"https://media.rawg.io/media/games/562/562553814dd54e001a541e4ee83a591c.jpg",
				"https://media.rawg.io/media/screenshots/edf/edfcbdf85f02f871263dabf1b4f0aa87.jpg",
				"https://media.rawg.io/media/screenshots/4c6/4c6da2f36396d4ed51f82ba6159fa39b.jpg",
				"https://media.rawg.io/media/screenshots/6aa/6aa56ef1485c8b287a913fa842883daa.jpg",
			]),
		},
	});

	const grandtheft = await prisma.game.upsert({
		where: { title: "Grand Theft Auto V" },
		update: {},
		create: {
			title: "Grand Theft Auto V",
			description:
				"Rockstar Games went bigger, since their previous installment of the series. You get the complicated and realistic world-building from Liberty City of GTA4 in the setting of lively and diverse Los Santos, from an old fan favorite GTA San Andreas. 561 different vehicles (including every transport you can operate) and the amount is rising with every update. Simultaneous storytelling from three unique perspectives: Follow Michael, ex-criminal living his life of leisure away from the past, Franklin, a kid that seeks the better future, and Trevor, the exact past Michael is trying to run away from. GTA Online will provide a lot of additional challenge even for the experienced players, coming fresh from the story mode. Now you will have other players around that can help you just as likely as ruin your mission. Every GTA mechanic up to date can be experienced by players through the unique customizable character, and community content paired with the leveling system tends to keep everyone busy and engaged. Español Rockstar Games se hizo más grande desde su entrega anterior de la serie. Obtienes la construcción del mundo complicada y realista de Liberty City de GTA4 en el escenario de Los Santos, un viejo favorito de los fans, GTA San Andreas. 561 vehículos diferentes (incluidos todos los transportes que puede operar) y la cantidad aumenta con cada actualización. Narración simultánea desde tres perspectivas únicas: Sigue a Michael, ex-criminal que vive su vida de ocio lejos del pasado, Franklin, un niño que busca un futuro mejor, y Trevor, el pasado exacto del que Michael está tratando de huir. GTA Online proporcionará muchos desafíos adicionales incluso para los jugadores experimentados, recién llegados del modo historia. Ahora tendrás otros jugadores cerca que pueden ayudarte con la misma probabilidad que arruinar tu misión. Los jugadores pueden experimentar todas las mecánicas de GTA actualizadas a través del personaje personalizable único, y el contenido de la comunidad combinado con el sistema de nivelación tiende a mantener a todos ocupados y comprometidos.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Strategy" },
						create: { name: "Strategy" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Rockstar Games" },
						create: { name: "Rockstar Games" },
					},
					{
						where: { name: "Feral Interactive" },
						create: { name: "Feral Interactive" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 7,
			images: await downloadImages([
				"https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
				"https://media.rawg.io/media/screenshots/a7c/a7c43871a54bed6573a6a429451564ef.jpg",
				"https://media.rawg.io/media/screenshots/cf4/cf4367daf6a1e33684bf19adb02d16d6.jpg",
				"https://media.rawg.io/media/screenshots/f95/f9518b1d99210c0cae21fc09e95b4e31.jpg",
			]),
		},
	});

	const thewitcher = await prisma.game.upsert({
		where: { title: "The Witcher 3: Wild Hunt" },
		update: {},
		create: {
			title: "The Witcher 3: Wild Hunt",
			description:
				"The third game in a series, it holds nothing back from the player. Open world adventures of the renowned monster slayer Geralt of Rivia are now even on a larger scale. Following the source material more accurately, this time Geralt is trying to find the child of the prophecy, Ciri while making a quick coin from various contracts on the side. Great attention to the world building above all creates an immersive story, where your decisions will shape the world around you. CD Project Red are infamous for the amount of work they put into their games, and it shows, because aside from classic third-person action RPG base game they provided 2 massive DLCs with unique questlines and 16 smaller DLCs, containing extra quests and items. Players praise the game for its atmosphere and a wide open world that finds the balance between fantasy elements and realistic and believable mechanics, and the game deserved numerous awards for every aspect of the game, from music to direction.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "RPG" },
						create: { name: "RPG" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "CD PROJEKT RED" },
						create: { name: "CD PROJEKT RED" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
					{
						where: { name: "Nintendo" },
						create: { name: "Nintendo" },
					},
				],
			},
			price: 10.5,
			images: await downloadImages([
				"https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
				"https://media.rawg.io/media/screenshots/1ac/1ac19f31974314855ad7be266adeb500.jpg",
				"https://media.rawg.io/media/screenshots/6a0/6a08afca95261a2fe221ea9e01d28762.jpg",
				"https://media.rawg.io/media/screenshots/cdd/cdd31b6b4a687425a87b5ce231ac89d7.jpg",
				"https://media.rawg.io/media/screenshots/862/862397b153221a625922d3bb66337834.jpg",
			]),
		},
	});

	const eldenring = await prisma.game.upsert({
		where: { title: "Elden Ring" },
		update: {},
		create: {
			title: "Elden Ring",
			description:
				"The Golden Order has been broken. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. In the Lands Between ruled by Queen Marika the Eternal, the Elden Ring, the source of the Erdtree, has been shattered. Marika's offspring, demigods all, claimed the shards of the Elden Ring known as the Great Runes, and the mad taint of their newfound strength triggered a war: The Shattering. A war that meant abandonment by the Greater Will. And now the guidance of grace will be brought to the Tarnished who were spurned by the grace of gold and exiled from the Lands Between. Ye dead who yet live, your grace long lost, follow the path to the Lands Between beyond the foggy sea to stand before the Elden Ring.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "RPG" },
						create: { name: "RPG" },
					},
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "FromSoftware" },
						create: { name: "FromSoftware" },
					},
					{
						where: { name: "Bandai Namco Entertainment" },
						create: { name: "Bandai Namco Entertainment" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 19.98,
			images: await downloadImages([
				"https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg",
				"https://media.rawg.io/media/screenshots/36f/36f941f72e2b2a41629f5fb3bd448688.jpg",
				"https://media.rawg.io/media/screenshots/290/29096848622521df7555850000236cb6.jpg",
				"https://media.rawg.io/media/screenshots/807/807685454ea8fb87363eedd49677f49b.jpg",
			]),
		},
	});

	const routine = await prisma.game.upsert({
		where: { title: "Routine" },
		update: {},
		create: {
			title: "Routine",
			description:
				"ROUTINE is a First Person Sci-Fi Horror title set on an abandoned Lunar base designed around an 80’s vision of the future. Curious exploration turns into a need for survival when a lunar base goes completely quiet. Searching for answers puts you face to face with an enemy who is certain the main threat is you. Discoveries lead to deeper unknowns and the only way to go is forward. EXPLORE: Roam through contrasting sectors of the Lunar station, from abandoned malls to deteriorating Living Quarters. IMMERSE: Full Body Awareness, Deadzone Aiming & minimal UI help create a gripping and atmospheric experience. UPGRADE: Discover modules that unlock new functionality for the Cosmonaut Assistance Tool (C.A.T.) SURVIVE: Run, hide, or attempt to defend yourself using the C.A.T. as a last resort.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Raw Fury" },
						create: { name: "Raw Fury" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
				],
			},
			price: 19.98,
			images: await downloadImages([
				"https://media.rawg.io/media/games/c2c/c2c572ae82b7631f482eb1bc84903fac.jpg",
				"https://media.rawg.io/media/screenshots/e10/e10820def5bfdbc8a36be03045c5a779.jpg",
				"https://media.rawg.io/media/screenshots/565/5659d232ce09c2bb261078864f285613.jpg",
				"https://media.rawg.io/media/screenshots/3ac/3ac87f2e8c7e2fe9b854871de4d5c21a.jpg",
			]),
		},
	});

	const ruevalley = await prisma.game.upsert({
		where: { title: "Rue Valley" },
		update: {},
		create: {
			title: "Rue Valley",
			description:
				"Break free from a mysterious time loop! Embark on a journey of self-discovery and resilience. Delve into the enigmatic depths of the small godforsaken town: Rue Valley. Each day feels like an uphill battle against the shadows of your own mind. Along the way, you will encounter a captivating ensemble of characters, each wrestling with their own emotional complexities and revealing hidden depths as you get to know them. Can you muster the courage to unravel the secrets of this temporal anomaly? Can you discover the strength within yourself to rise above adversity and forge a brighter tomorrow? Craft your own personality in Rue Valley. You can be a cold-hearted loner who overthinks everything or a melodramatic loudmouth who always trusts their gut instinct. Whether you reflect your true personality or role-play someone entirely different, your character will shape your dialogues and interactions in the game. Store memories in a graph, unlocking intentions and mindsets as you progress uniquely through the story. Commit to quirky mindsets for unexpected and hilarious dialogues, and experience personality-altering Status Effects: become more outgoing when drunk, or extra sensitive when anxious. Experiment with different answers and timelines, because the loop will restart from the beginning anyway, won't it?",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
					{
						where: { name: "Casual" },
						create: { name: "Casual" },
					},
					{
						where: { name: "Indie" },
						create: { name: "Indie" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Owlcat Games" },
						create: { name: "Owlcat Games" },
					},
					{
						where: { name: "Emotion Spark Studio" },
						create: { name: "Emotion Spark Studio" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "Nintendo" },
						create: { name: "Nintendo" },
					},
				],
			},
			price: 19.98,
			images: await downloadImages([
				"https://media.rawg.io/media/games/046/046fadf73a683404b919c37104f2fa51.jpg",
				"https://media.rawg.io/media/screenshots/16a/16ae0585d29502116a23cb9082fdf2a7.jpg",
				"https://media.rawg.io/media/screenshots/9ac/9aceb83d2138cc53b8cf1f86ea401b52.jpg",
				"https://media.rawg.io/media/screenshots/40b/40bdf7b0c23c5bf8167c4193c223e73b.jpg",
				"https://media.rawg.io/media/screenshots/8a0/8a04786bf43d9a4940af730d7d1adb3e.jpg",
			]),
		},
	});

	const CallofDutyBlackOps7 = await prisma.game.upsert({
		where: { title: "Call of Duty: Black Ops 7" },
		update: {},
		create: {
			title: "Call of Duty: Black Ops 7",
			description:
				"Set in 2035—ten years after the events of Call of Duty: Black Ops II (2012)—Black Ops 7's campaign will follow Black Ops II protagonist David Mason (Milo Ventimiglia) and his team of agents as they pursue 'a manipulative enemy who weaponizes fear above all else'.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Shooter" },
						create: { name: "Shooter" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Activision Blizzard" },
						create: { name: "Activision Blizzard" },
					},
					{
						where: { name: "Activision Value Publishing" },
						create: { name: "Activision Value Publishing" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 19.98,
			images: await downloadImages([
				"https://media.rawg.io/media/games/4ca/4cabe38446288beb37fc73b2fe047b08.jpg",
				"https://media.rawg.io/media/screenshots/275/275d75a25927b328730e31cb53b1314a.jpg",
				"https://media.rawg.io/media/screenshots/91c/91c7e10c38c9ed10ea22abaa4756054c.jpg",
				"https://media.rawg.io/media/screenshots/dc9/dc9d9b70b6045dee7015114d9972c200.jpg",
			]),
		},
	});

	const WinterBurrow = await prisma.game.upsert({
		where: { title: "Winter Burrow" },
		update: {},
		create: {
			title: "Winter Burrow",
			description:
				"Winter Burrow is a cozy woodland survival game. Explore, gather resources, craft tools, knit warm sweaters, bake pies and meet the locals! In Winter Burrow, you play a mouse who returns from the big city to find their childhood home in ruins. To make matters worse, your Aunt (who was supposed to be looking after it) has gone missing. Restore your broken-down childhood burrow to its former glory so you can relax in front of the fireplace. Brave the elements and journey out into the frozen wilderness to collect vital resources for both yourself and your new home. Beware of the insect wildlife and remember that nobody survives on their own; find new friends, expand your survival handbook and solve the mystery of what happened to your Aunt. Winter Burrow is a survival game you play at your own pace. Customize your character, decorate your burrow and choose a path that fits your play style. This story is yours to tell.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
					{
						where: { name: "Simulation" },
						create: { name: "Simulation" },
					},
					{
						where: { name: "Casual" },
						create: { name: "Casual" },
					},
					{
						where: { name: "Indie" },
						create: { name: "Indie" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Noodlecake" },
						create: { name: "Noodlecake" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "Nintendo" },
						create: { name: "Nintendo" },
					},
				],
			},
			price: 19.98,
			images: await downloadImages([
				"https://media.rawg.io/media/games/8f7/8f7df68072959a0454789a7ec5cf8332.jpg",
				"https://media.rawg.io/media/screenshots/ce9/ce94438f34cc099205d3d0bf97179910.jpg",
				"https://media.rawg.io/media/screenshots/00a/00afdd4d997a3ae7ebc0ba72cf5538c9.jpg",
				"https://media.rawg.io/media/screenshots/94b/94b3beecd752b54232175d278c620040.jpg",
			]),
		},
	});

	const Possessors = await prisma.game.upsert({
		where: { title: "Possessor(s)" },
		update: {},
		create: {
			title: "Possessor(s)",
			description:
				"Possessor(s) is a fast-paced action side scroller with combat inspired by platform fighters, a story told through dangerous characters, set in a deep interconnected world ready for exploration. Play as Luca, the host, and Rehm, her less-than-cooperative counterpart, as they explore a quarantined city ripped apart and flooded by an interdimensional catastrophe. Their only hope of survival is by learning to co-exist.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
					{
						where: { name: "Platformer" },
						create: { name: "Platformer" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Devolver Digital" },
						create: { name: "Devolver Digital" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 45.25,
			images: await downloadImages([
				"https://media.rawg.io/media/games/eee/eee77ebd67eb7342459df19d52c53389.jpg",
				"https://media.rawg.io/media/screenshots/1ec/1ec2750e0da0645faa1e3439cdc1f247.jpg",
				"https://media.rawg.io/media/screenshots/723/723b695527c2041b599fef772cc11a5a.jpg",
				"https://media.rawg.io/media/screenshots/53f/53f913cc61f04bf1ab54803f5454c670.jpg",
			]),
		},
	});

	const OctopathTraveler0 = await prisma.game.upsert({
		where: { title: "Octopath Traveler 0" },
		update: {},
		create: {
			title: "Octopath Traveler 0",
			description:
				"Start from zero and discover the newest entry in the OCTOPATH TRAVELER series. Experience a story of restoration and retribution over the divine rings—an epic saga that unfolds across the realm of Orsterra.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "RPG" },
						create: { name: "RPG" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Square Enix" },
						create: { name: "Square Enix" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},

					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
					{
						where: { name: "Nintendo" },
						create: { name: "Nintendo" },
					},
				],
			},
			price: 49.99,
			images: await downloadImages([
				"https://media.rawg.io/media/screenshots/f1b/f1b0778dffc9162299536461bf9238cf.jpg",
			]),
		},
	});

	const OfAshandSteel = await prisma.game.upsert({
		where: { title: "Of Ash and Steel" },
		update: {},
		create: {
			title: "Of Ash and Steel",
			description:
				"Of Ash and Steel est un RPG immersif en monde ouvert à la troisième personne, mêlant l'essence des classiques du jeu de rôles aux évolutions contemporaines du genre. Explorez une île autrefois prospère, perfectionnez votre art du combat, et survivez dans l'impitoyable Royaume des Sept. Caractéristiques Une quête principale qui vous entraînera sur plus de 45 heures, riche en dialogues et en personnages, en livres et en quêtes secondaires soigneusement écrits. Le choix entre deux factions principales, chacune disposant d'un scénario unique et de récompenses exclusives. Un système de combat comprenant trois postures de combat bien distinctes, de nombreux types d'armes et les compétences qui leur sont associées. Une île en monde ouvert et divers environnements à explorer. Une grande variété de métiers à maîtriser comme la pêche, la chasse, l'alchimie, la forge (permettant de fabriquer une épée unique en son genre), et plus encore. Maîtrisez l'art du combat Of Ash and Steel propose un système de combat exigeant, mais ô combien gratifiant. Vous ne deviendrez pas un légendaire chasseur de prime ou de monstre sans lever le petit doigt. Vous devrez apprendre à gérer votre endurance, à savoir quand porter vos attaques ou parer, et à déterminer quelles postures de combat et armes vous conviennent le mieux. Cela nécessitera du temps et de l'entraînement, mais plus vous jouerez, plus Tristan et vous progresserez et saurez réagir face à ce qui se passe autour de vous. Apprenez à vous défendre en utilisant différents types d'armes, l'environnement et les compétences. Concevez un style de combat qui vous convient, du preste escrimeur à l'inébranlable chevalier caparaçonné, donnez libre cours à votre créativité ! Décidez du sort du monde Plongez-vous dans une histoire passionnante, pleine de rebondissements, d'humour et de découvertes. Glissez-vous dans la peau d'un jeune homme destiné à devenir plus qu'un modeste cartographe. Devenez plus fort, survivez et formez des alliances. Prouvez que même celui qui a tout perdu peut influer sur le destin du monde. Parlez à la population pour apprendre ses us et coutumes, et l'aider dans son quotidien. Observez comme votre réputation change à mesure que vous évoluez. Rejoignez une des deux factions principales et complétez la quête qui lui est propre afin de gagner des récompenses uniques. Vos actions impacteront aussi le monde et les personnages environnants. Explorez comme avant Of Ash and Steel ne dispose d'aucun système de marquage automatique, et les quêtes ne vous prendront pas par la main. Redécouvrez le plaisir de l'exploration, et laissez-vous guider par votre curiosité, le monde saura se montrer généreux avec ceux qui osent partir à sa rencontre. Écoutez attentivement ce que les gens ont à vous dire, lisez scrupuleusement vos quêtes pour vous repérer. Lisez les livres et autres messages pour en apprendre plus sur le monde. Signalez les endroits remarquables sur votre carte, explorez l'île, et découvrez ses trésors cachés !",
			genres: {
				connectOrCreate: [
					{
						where: { name: "RPG" },
						create: { name: "RPG" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "tinyBuild" },
						create: { name: "tinyBuild" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
				],
			},
			price: 23.99,
			images: await downloadImages([
				"https://media.rawg.io/media/games/a8b/a8bdf0b41680ff213e034d978a73bec2.jpg",
				"https://media.rawg.io/media/screenshots/480/4808db271d574e72aad8bb7f12b0271f.jpg",
				"https://media.rawg.io/media/screenshots/5be/5bef69541e4a07cf144f41759ee6a45c.jpg",
				"https://media.rawg.io/media/screenshots/973/9735c34777b746a85f06e773e55d1a5e.jpg",
			]),
		},
	});

	const Constance2025 = await prisma.game.upsert({
		where: { title: "Constance (2025)" },
		update: {},
		create: {
			title: "Constance (2025)",
			description:
				"Constance is a 2D hand-drawn action adventure featuring a paintbrush-wielding artist, striving to escape from a colorful but decaying inner-world, created by her declining mental health.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
					{
						where: { name: "Platformer" },
						create: { name: "Platformer" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "btf" },
						create: { name: "btf" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
				],
			},
			price: 44.98,
			images: await downloadImages([
				"https://media.rawg.io/media/screenshots/592/592feaa2ff2a59c9859f084fb4c5d118.jpg",
				"https://media.rawg.io/media/screenshots/d5e/d5ed1471743b3264d3c215c313452986.jpg",
				"https://media.rawg.io/media/screenshots/1d1/1d147932e3e50c8a93380c699457f000.jpg",
				"https://media.rawg.io/media/screenshots/482/4825a758f509744482befebe3fb4bf04.jpg",
			]),
		},
	});

	const VampireTheMasquerade_Bloodlines2 = await prisma.game.upsert({
		where: { title: "Vampire: The Masquerade - Bloodlines 2" },
		update: {},
		create: {
			title: "Vampire: The Masquerade - Bloodlines 2",
			description:
				"Sired in an act of vampire insurrection, your existence ignites the war for Seattle's blood trade. Enter uneasy alliances with the creatures who control the city and uncover the sprawling conspiracy which plunged Seattle into a bloody civil war between powerful vampire factions. ♞Become the Ultimate Vampire Immerse yourself in the World of Darkness and live out your vampire fantasy in a city filled with intriguing characters that react to your choices. You and your unique disciplines are a weapon in our forward-driving, fast-moving, melee-focussed combat system. Your power will grow as you advance, but remember to uphold the Masquerade and guard your humanity... or face the consequences. ♝Descend into Seattle’s Dark Heart and Survive the Vampire Elite Seattle has always been run by vampires. Hunt your prey across Seattle locations faithfully reimagined in the World of Darkness. Meet the old blood founders present since the city’s birth and the new blood steering the tech money redefining the city. Everyone has hidden agendas - so choose your allies wisely. ♚Enter into Uneasy Alliances Choose a side among competing factions, each with their own unique traits and stories, in the war for Seattle’s blood trade. The world will judge you by the company you keep, but remember no one’s hands stay clean forever. ♛Experience the Story Written by the creative mind behind the original Bloodlines, Vampire: The Masquerade® - Bloodlines™ 2 brings the ambitions of the first game to life and sees the return of a few fan favorite characters.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "RPG" },
						create: { name: "RPG" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Paradox Interactive" },
						create: { name: "Paradox Interactive" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},

					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 33.5,
			images: await downloadImages([
				"https://media.rawg.io/media/games/fb5/fb5e0fdb1f6bb0e8b5da5d08bb83a5fc.jpg",
				"https://media.rawg.io/media/screenshots/b71/b71ee1cd39f5e8685900b47980d715a1_I3dtqc6.jpg",
				"https://media.rawg.io/media/screenshots/291/29185669bd2fdf8c0ec10fcf10da3063.jpg",
				"https://media.rawg.io/media/screenshots/7ba/7ba2d1b2998ae2c76c3ef3509ea8e104.jpg",
				"https://media.rawg.io/media/screenshots/234/234c1ba4292f69ffc3c988dab739fa91.jpg",
			]),
		},
	});

	const HollowKnightSilksong = await prisma.game.upsert({
		where: { title: "Hollow Knight: Silksong" },
		update: {},
		create: {
			title: "Hollow Knight: Silksong",
			description:
				"Hollow Knight: Silksong is the epic sequel to Hollow Knight, the epic action-adventure of bugs and heroes. As the lethal hunter Hornet, journey to all-new lands, discover new powers, battle vast hordes of bugs and beasts and uncover ancient secrets tied to your nature and your past.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
					{
						where: { name: "Indie" },
						create: { name: "Indie" },
					},
					{
						where: { name: "Platformer" },
						create: { name: "Platformer" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Team Cherry" },
						create: { name: "Team Cherry" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},

					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
					{
						where: { name: "Linux" },
						create: { name: "Linux" },
					},
					{
						where: { name: "Nintendo" },
						create: { name: "Nintendo" },
					},
				],
			},
			price: 15.2,
			images: await downloadImages([
				"https://media.rawg.io/media/games/27c/27cd8b7dead05a870f8a514a9a1915ad.jpg",
				"https://media.rawg.io/media/screenshots/9f9/9f9a0edd1478facde5209abe4000c015.jpg",
				"https://media.rawg.io/media/screenshots/3f3/3f35cf2130d1d8763ee45dc77ce843b2.jpg",
				"https://media.rawg.io/media/screenshots/7e1/7e160928dc38f72937951f56e73a1988.jpg",
			]),
		},
	});

	const HadesII = await prisma.game.upsert({
		where: { title: "Hades II" },
		update: {},
		create: {
			title: "Hades II",
			description:
				"The first-ever sequel from Supergiant Games builds on the best aspects of the original god-like rogue-like dungeon crawler in an all-new, action-packed, endlessly replayable experience rooted in the Underworld of Greek myth and its deep connections to the dawn of witchcraft. BATTLE BEYOND THE UNDERWORLD As the immortal Princess of the Underworld, you'll explore a bigger, deeper mythic world, vanquishing the forces of the Titan of Time with the full might of Olympus behind you, in a sweeping story that continually unfolds through your every setback and accomplishment. MASTER WITCHCRAFT AND DARK SORCERY Infuse your legendary weapons of Night with ancient magick, so that none may stand in your way. Become stronger still with powerful Boons from more than a dozen Olympian gods, from Apollo to Zeus. There are nearly limitless ways to build your abilities.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
					{
						where: { name: "RPG" },
						create: { name: "RPG" },
					},
					{
						where: { name: "Indie" },
						create: { name: "Indie" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Supergiant Games" },
						create: { name: "Supergiant Games" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},

					{
						where: { name: "Nintendo" },
						create: { name: "Nintendo" },
					},
				],
			},
			price: 28.5,
			images: await downloadImages([
				"https://media.rawg.io/media/games/8fd/8fd2e8317849fd265ad8781c324d4ec2.jpg",
				"https://media.rawg.io/media/screenshots/59e/59e9ba1215b11e43ad64f363bfb7f65b.jpg",
				"https://media.rawg.io/media/screenshots/e93/e93aa58a1bf6f628507121a206ef856d.jpg",
				"https://media.rawg.io/media/screenshots/f2a/f2ad5b935bec0757defcbd1245182971.jpg",
			]),
		},
	});

	const SplitFiction = await prisma.game.upsert({
		where: { title: "Split Fiction" },
		update: {},
		create: {
			title: "Split Fiction",
			description:
				"Embrace mind-blowing moments as you’re pulled deep into the many worlds of Split Fiction, a boundary-pushing co-op action adventure from the studio behind 2021 Game of the Year Winner, It Takes Two. Mio and Zoe are contrasting writers – one writes sci-fi and the other writes fantasy – who become trapped in their own stories after being hooked up to a machine designed to steal their creative ideas. They’ll have to rely on each other to break free with their memories in-tact, working together to master a variety of abilities and overcome diverse challenges while jumping between sci-fi and fantasy worlds in this unexpected tale of friendship. Split Fiction is a unique action-adventure experience that keeps you on the edge of your couch with unexpected moments. One minute you’re taming adorable dragons and the next you’re fighting as cyber ninjas, escaping terrifying trolls, or dodging hover cars thrown by a robotic parking attendant. It’s weird, it’s wild, and it’s designed to be shared. Grab your co-op partner and get ready to overcome any obstacle thrown your way.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Electronic Arts" },
						create: { name: "Electronic Arts" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 18.55,
			images: await downloadImages([
				"https://media.rawg.io/media/games/02a/02ac22b3b90717dabaa535640c38534c.jpg",
				"https://media.rawg.io/media/screenshots/ea9/ea9e37dc1b36db3401a6b308d766198b.jpg",
				"https://media.rawg.io/media/screenshots/e4b/e4bee3c261abe04f869b6f429852a00d.jpg",
				"https://media.rawg.io/media/screenshots/395/395fdacce19c05718a7df69a227c8580.jpg",
			]),
		},
	});

	const DeathStranding2OnTheBeach = await prisma.game.upsert({
		where: { title: "Death Stranding 2: On The Beach" },
		update: {},
		create: {
			title: "Death Stranding 2: On The Beach",
			description:
				"Embark on an inspiring mission of human connection beyond the UCA. Sam—with companions by his side—sets out on a new journey to save humanity from extinction. Join them as they traverse a world beset by otherworldly enemies, obstacles and a haunting question: should we have connected? Step by step, legendary game creator Hideo Kojima changes the world once again.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Sony Interactive Entertainment" },
						create: { name: "Sony Interactive Entertainment" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
				],
			},
			price: 20,
			images: await downloadImages([
				"https://media.rawg.io/media/games/b85/b85bc300d42588af66fb516b7563f74f.jpg",
				"https://media.rawg.io/media/screenshots/7a9/7a97a649fde5f258651ae5e69abf0ed0.jpg",
				"https://media.rawg.io/media/screenshots/9c4/9c4d0e73de232433f8b977c39ca65d45.jpg",
				"https://media.rawg.io/media/screenshots/a25/a25a14bc153866bd1dc9f776426c7b5b.jpg",
				"https://media.rawg.io/media/screenshots/8a8/8a87fa3c9a671416715d9ba29789cd7f.jpg",
			]),
		},
	});

	const KingdomComeDeliveranceII = await prisma.game.upsert({
		where: { title: "Kingdom Come: Deliverance II" },
		update: {},
		create: {
			title: "Kingdom Come: Deliverance II",
			description:
				"Kingdom of Bohemia, Early 15th Century: chaos has befallen the kingdom. As invaders pillage this ungoverned land, sowing fear and terror, Henry of Skalitz seeks revenge for his murdered family. Now a trusted member of the rightful king’s allies, Henry is sent to escort Sir Hans Capon on a diplomatic mission. After they are ambushed and nearly killed, the two young men embark on a series of perilous adventures, putting their skills, character and friendship to the ultimate test.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
					{
						where: { name: "RPG" },
						create: { name: "RPG" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Deep Silver" },
						create: { name: "Deep Silver" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 20,
			images: await downloadImages([
				"https://media.rawg.io/media/games/d84/d842fec4ae7bbd782d330f678c980f7f.jpg",
				"https://media.rawg.io/media/screenshots/0ce/0ce56603d0deb0f66f969ccdee51284b.jpg",
				"https://media.rawg.io/media/screenshots/ab2/ab2e1086144e9722aba95d012aadcc66.jpg",
				"https://media.rawg.io/media/screenshots/741/741f7625ce8adfe138b43608f1e8e01c.jpg",
			]),
		},
	});

	const TheWolfAmongUs2 = await prisma.game.upsert({
		where: { title: "The Wolf Among Us 2" },
		update: {},
		create: {
			title: "The Wolf Among Us 2",
			description:
				"Play as Bigby, “The Big Bad Wolf” and Sheriff of Fabletown, as you return to a gritty detective noir world where there are no fairy tale endings. The Wolf Among Us 2 picks up six months after the events of season one. It’s winter in New York City and a new case threatens to cross the line between Fabletown and the NYPD. How you choose to approach it could determine the future of the Fable community.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Telltale Games" },
						create: { name: "Telltale Games" },
					},
					{
						where: { name: "Adhoc Games" },
						create: { name: "Adhoc Games" },
					},
					{
						where: { name: "LCG Entertainment" },
						create: { name: "LCG Entertainment" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 28.88,
			images: await downloadImages([
				"https://media.rawg.io/media/games/845/84539f8f33fea2c753cca0ce3a6d168f.jpg",
				"https://media.rawg.io/media/screenshots/d9b/d9b0c27189aa9f3a367ab65e024a2aa5.jpg",
				"https://media.rawg.io/media/screenshots/f93/f93fddd694303371b91cffe9f5b81a9e.jpg",
				"https://media.rawg.io/media/screenshots/fa7/fa7b9921b9ee0b63b2dffbd09800f224_BuVybP8.jpg",
			]),
		},
	});

	const Avowed = await prisma.game.upsert({
		where: { title: "Avowed" },
		update: {},
		create: {
			title: "Avowed",
			description:
				"Welcome to the Living Lands, a mysterious island filled with adventure and danger. Set in the fictional world of Eora that was first introduced to players in the Pillars of Eternity franchise, Avowed is a first-person fantasy action RPG from the award-winning team at Obsidian Entertainment. You are the envoy of Aedyr, a distant land, sent to investigate rumors of a spreading plague throughout the Living Lands - an island full of mysteries and secrets, danger and adventure, and choices and consequences, and untamed wilderness. You discover a personal connection to the Living Lands and an ancient secret that threatens to destroy everything. Can you save this unknown frontier and your soul from the forces threatening to tear them asunder?",
			genres: {
				connectOrCreate: [
					{
						where: { name: "RPG" },
						create: { name: "RPG" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Xbox Game Studios" },
						create: { name: "Xbox Game Studios" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 28.88,
			images: await downloadImages([
				"https://media.rawg.io/media/games/3d3/3d33abf32d9fb92b9f242917abe276ba.jpg",
				"https://media.rawg.io/media/screenshots/ac3/ac3579b4cbc333f2b18ee552027093bb.jpg",
				"https://media.rawg.io/media/screenshots/100/1006c41b4aba7ab83b5cb5bdbb37ca2c.jpg",
				"https://media.rawg.io/media/screenshots/287/2877abf64cdbfe978aab512d45031729.jpg",
			]),
		},
	});

	const AssassinsCreedShadows = await prisma.game.upsert({
		where: { title: "Assassin's Creed Shadows" },
		update: {},
		create: {
			title: "Assassin's Creed Shadows",
			description:
				"A new Creed rises over Japan. Live the intertwined stories of Naoe, an adept shinobi Assassin from Iga Province, and Yasuke, the powerful African samurai of historical legend. Against the backdrop of the turbulent late Sengoku period, this remarkable duo will discover their common destiny as they usher in a new era for Japan.",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
					{
						where: { name: "Adventure" },
						create: { name: "Adventure" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Ubisoft Entertainment" },
						create: { name: "Ubisoft Entertainment" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 28.88,
			images: await downloadImages([
				"https://media.rawg.io/media/games/526/526881e0f5f8c1550e51df3801f96ea3.jpg",
				"https://media.rawg.io/media/screenshots/b9c/b9c6546ce1488f918e6373073d800fa7.jpg",
				"https://media.rawg.io/media/screenshots/801/801c5b2489abedcddf4acd94da35daaf.jpg",
				"https://media.rawg.io/media/screenshots/b9c/b9ce924c7bfdbdc45793554a56932f36.jpg",
			]),
		},
	});

	const DoomTheDarkAges = await prisma.game.upsert({
		where: { title: "Doom: The Dark Ages" },
		update: {},
		create: {
			title: "Doom: The Dark Ages",
			description:
				"YOU ARE THE SUPER WEAPON IN A MEDIEVAL WAR AGAINST HELL",
			genres: {
				connectOrCreate: [
					{
						where: { name: "Action" },
						create: { name: "Action" },
					},
				],
			},
			publishers: {
				connectOrCreate: [
					{
						where: { name: "Bethesda Softworks" },
						create: { name: "Bethesda Softworks" },
					},
				],
			},
			platforms: {
				connectOrCreate: [
					{
						where: { name: "PC" },
						create: { name: "PC" },
					},
					{
						where: { name: "PlayStation" },
						create: { name: "PlayStation" },
					},
					{
						where: { name: "Xbox" },
						create: { name: "Xbox" },
					},
				],
			},
			price: 28.15,
			images: await downloadImages([
				"https://media.rawg.io/media/screenshots/8f1/8f19f2c0d824633e97bfe32117a8cdd1.jpg",
				"https://media.rawg.io/media/games/018/01897340a06b9ed8e92ed1cc1b1eecb9.jpg",
				"https://media.rawg.io/media/screenshots/5b4/5b47eb35a77ed3dbdc0f7854268666a7.jpg",
				"https://media.rawg.io/media/screenshots/a50/a500d5b322fab4bc1ae9f134a1fcba8f.jpg",
			]),
		},
	});
}

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || (args[0] !== "seed" && args[0] !== "purge"))
		console.log("Pass purge or seed");

	try {
		if (args[0] === "seed") await seed();
		else await purge();
	} catch (e) {
		console.log(e);
		process.exit(1);
	}

	await prisma.$disconnect();
}

main();
