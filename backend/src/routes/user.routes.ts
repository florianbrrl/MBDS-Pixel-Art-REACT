import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Protéger toutes les routes utilisateur avec authentification
router.use(authenticateToken);

// Routes pour tous les utilisateurs authentifiés
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/theme', UserController.updateTheme);

// Route pour les contributions - peut être accédée pour soi-même ou pour d'autres utilisateurs
router.get('/contributions', UserController.getUserContributions);
router.get('/:id/contributions', UserController.getUserContributions);

export default router;
