import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import { AppError, globalErrorHandler } from './middleware/errorHandler.middleware';
import config from './config';
import setupSwagger from './config/swagger/swagger.middleware';

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
app.use(express.json({ limit: '5mb' })); // Parse le corps JSON avec limite augmentée à 5mb
app.use(express.urlencoded({ extended: true, limit: '5mb' })); // Parse les données URL-encoded avec limite augmentée

// Configure Swagger documentation
setupSwagger(app);

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
app.use(globalErrorHandler);

export default app;
