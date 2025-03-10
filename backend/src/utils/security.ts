import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import config from '../config';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
	return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
	return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string): string => {
	return jwt.sign({ id: userId }, config.jwt.secret, {
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