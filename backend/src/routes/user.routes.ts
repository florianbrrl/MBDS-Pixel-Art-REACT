// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, protect } from '../middleware/auth.middleware';

const router = Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Les routes telles qu'elles apparaîtront dans l'URL
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.get('/:id/contributions', UserController.getUserContributions);

export default router;
