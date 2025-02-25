import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';

// Import des routes
import apiRoutes from './routes';

const app: Application = express();

// Trucs qui sont recommandés par Express
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Status de l'API
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: 'Not Found - The requested resource does not exist',
  });
});

// Gestionnaire d'erreur
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    ...(config.env !== 'production' && { error: err.message }),
  });
});

export default app;