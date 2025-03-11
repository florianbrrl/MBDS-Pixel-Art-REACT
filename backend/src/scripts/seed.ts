import prisma from '../db/client';
import { hashPassword } from '../utils/security';

async function seed() {
	const users = [
		{ email: 'guest@example.com', password: 'password123', role: 'guest' },
		{ email: 'user@example.com', password: 'password123', role: 'user' },
		{ email: 'premium@example.com', password: 'password123', role: 'premium' },
		{ email: 'admin@example.com', password: 'password123', role: 'admin' },
	];

	for (const user of users) {
		const passwordHash = await hashPassword(user.password);
		await prisma.user.upsert({
			where: { email: user.email },
			update: {},
			create: {
				email: user.email,
				password_hash: passwordHash,
				role: user.role as any,
			},
		});
		console.log(`Seeded ${user.role} user: ${user.email}`);
	}

	await prisma.$disconnect();
}

seed().catch(console.error);