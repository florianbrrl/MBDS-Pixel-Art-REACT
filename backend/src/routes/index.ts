import { Router } from 'express';

const router = Router();

// Les routes pour après
// import authRoutes from './auth.routes';
// import userRoutes from './user.routes';
// import pixelboardRoutes from './pixelboard.routes';

// Define routes
router.get('/', (_req, res) => {
  res.json({
    message: 'PixelBoard API',
    version: '1.0.0',
  });
});

// Application des routes
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/pixelboards', pixelboardRoutes);

export default router;