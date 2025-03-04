import { PrismaClient } from '@prisma/client';
import config from '../config';

const prismaClientSingleton = () => {
	return new PrismaClient({
		datasources: {
			db: {
				url: config.db.url,
			},
		},
	});
};

// Global est utilisé ici pour maintenir une connexion en cache
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
