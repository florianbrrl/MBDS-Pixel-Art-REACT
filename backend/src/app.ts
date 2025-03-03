import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import { AppError, globalErrorHandler } from './middleware/errorHandler.middleware';
import config from './config';

// Création de l'application Express
const app: Application = express();

// Middleware de base
app.use(helmet()); // Sécurité: définit divers en-têtes HTTP
app.use(
	cors({
		origin: config.cors.origin,
		credentials: true,
	})
); // Autorise les requêtes cross-origin
app.use(compression()); // Compresse les réponses
app.use(morgan(config.logging.format)); // Journalisation des requêtes
app.use(express.json({ limit: '10kb' })); // Parse le corps JSON avec limite
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse les données URL-encoded

// Routes
app.use(config.server.apiPrefix, routes);

// Route de contrôle de santé
app.get('/health', (req: Request, res: Response) => {
	res.status(200).json({
		status: 'success',
		message: 'Server is running',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Gestion des routes non trouvées
app.all('*', (req: Request, res: Response, next: NextFunction) => {
	const err: AppError = new Error(`Route ${req.originalUrl} not found`);
	err.statusCode = 404;
	err.status = 'fail';
	next(err);
});

// Middleware de gestion globale des erreurs
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	// En développement, envoyer l'erreur complète, en production, envoyer une réponse simplifiée
	const isDevelopment = config.server.env === 'development';

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		...(isDevelopment && { stack: err.stack }),
	});
});

export default app;
