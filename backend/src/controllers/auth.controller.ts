import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppErrorClass } from '../middleware/errorHandler.middleware';
import { registerUser, loginUser } from '../services/auth.service';

export const register = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return next(new AppErrorClass('Email and password are required', 400));
		}
		const userId = await registerUser(email, password);
		res.status(201).json({
			status: 'success',
			data: { userId },
			message: 'User registered successfully',
		});
	}
);

export const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return next(new AppErrorClass('Email and password are required', 400));
		}
		const token = await loginUser(email, password);
		res.status(200).json({
			status: 'success',
			data: { token },
			message: 'Logged in successfully',
		});
	}
);