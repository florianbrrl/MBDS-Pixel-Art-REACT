import prisma from '../db/client';
import { hashPassword, comparePassword, generateToken } from '../utils/security';
import { AppErrorClass } from '../middleware/errorHandler.middleware';

export const registerUser = async (email: string, password: string): Promise<string> => {
	// Check if user with this email already exists
	const existingUser = await prisma.user.findUnique({
		where: { email },
	});

	if (existingUser) {
		throw new AppErrorClass('User with this email already exists', 400);
	}

	const passwordHash = await hashPassword(password);

	const user = await prisma.user.create({
		data: {
			email,
			password_hash: passwordHash,
			theme_preference: 'sys', // Default theme preference shortened to fit VARCHAR(5) column
		},
	});

	return user.id;
};

export const loginUser = async (email: string, password: string): Promise<string> => {
	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new AppErrorClass('Invalid credentials', 401);
	}

	const isValid = await comparePassword(password, user.password_hash);
	if (!isValid) {
		throw new AppErrorClass('Invalid credentials', 401);
	}

	return generateToken(user.id);
};