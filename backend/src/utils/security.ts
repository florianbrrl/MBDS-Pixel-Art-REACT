import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '@prisma/client';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
	return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
	return bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
	return jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
		expiresIn: config.jwt.expiresIn,
	});
};

export const verifyToken = (token: string): Promise<string | jwt.JwtPayload> => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, config.jwt.secret, (err, decoded) => {
			if (err) reject(err);
			else resolve(decoded);
		});
	});
};