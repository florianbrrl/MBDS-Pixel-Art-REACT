import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Route racine de l'API
router.get('/', (req: Request, res: Response) => {
	res.status(200).json({
		status: 'success',
		message: 'PixelBoard API',
		version: '1.0.0',
		apiDocs: '/api/docs',
	});
});

// Routes d'authentification
router.use('/auth', authRoutes);

// Importer les autres routeurs ici quand ils seront créés
// router.use('/users', userRoutes);
// router.use('/pixelboards', pixelboardRoutes);

export default router;
