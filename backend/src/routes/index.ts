import { Router, Request, Response } from 'express';

const router = Router();

// Route racine de l'API
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'PixelBoard API',
    version: '1.0.0',
    apiDocs: '/api/docs'
  });
});

// Importer les autres routeurs ici quand ils seront créés
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/pixelboards', pixelboardRoutes);

export default router;