import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppErrorClass } from './errorHandler.middleware';
import config from '../config';

// Define possible roles
type UserRole = 'guest' | 'user' | 'premium' | 'admin';

// Interface for decoded JWT payload
interface JwtPayload {
	id: string;
	role: UserRole;
}

// Middleware to verify token and attach user info to request
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer TOKEN"

	if (!token) {
		return next(new AppErrorClass('No token provided', 401));
	}

	jwt.verify(token, config.jwt.secret, (err, decoded) => {
		if (err) {
			return next(new AppErrorClass('Invalid or expired token', 403));
		}
		req.user = decoded as JwtPayload; // Attach decoded payload to request
		next();
	});
};

// Middleware to check required role
export const restrictTo = (...allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new AppErrorClass('Authentication required', 401));
		}

		const userRole = req.user.role;
		if (!allowedRoles.includes(userRole)) {
			return next(new AppErrorClass('Insufficient permissions', 403));
		}

		next();
	};
};

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}