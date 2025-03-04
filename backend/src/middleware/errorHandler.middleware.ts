import { Request, Response, NextFunction } from 'express';

// Interface pour notre erreur personnalisée
export interface AppError extends Error {
	statusCode?: number;
	status?: string;
	isOperational?: boolean;
}

// Middleware pour capturer les erreurs asynchrones
export const catchAsync = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
};

// Classe d'erreur personnalisée pour les erreurs opérationnelles
export class AppErrorClass extends Error implements AppError {
	statusCode: number;
	status: string;
	isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

// Middleware de gestion globale des erreurs
export const globalErrorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	const isDevelopment = process.env.NODE_ENV === 'development';

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		...(isDevelopment && { stack: err.stack }),
	});
};
