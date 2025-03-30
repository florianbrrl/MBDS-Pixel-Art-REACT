import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, restrictTo } from '../middleware/auth.middleware';
import { StatsController } from '../controllers/stats.controller';

const router = Router();

// Protéger toutes les routes utilisateur avec authentification
router.use(authenticateToken);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get authenticated user's detailed profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     theme_preference:
 *                       type: string
 *                       enum: [light, dark, sys]
 *                     role:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
// Restrict these endpoints to non-guest users
router.get('/profile', restrictTo('user', 'premium', 'admin'), UserController.getProfile);
router.get('/me', restrictTo('user', 'premium', 'admin'), UserController.getProfile); // Add /me endpoint as alias for /profile

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               theme_preference:
 *                 type: string
 *                 enum: [light, dark, sys]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     theme_preference:
 *                       type: string
 *                     role:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *       400:
 *         description: Invalid data provided
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
// Restrict these endpoints to non-guest users
router.put('/profile', restrictTo('user', 'premium', 'admin'), UserController.updateProfile);
router.put('/me', restrictTo('user', 'premium', 'admin'), UserController.updateProfile); // Add /me endpoint as alias for updating profile
router.patch('/me', restrictTo('user', 'premium', 'admin'), UserController.updateProfile); // Add PATCH method for updating profile

/**
 * @swagger
 * /users/password:
 *   post:
 *     summary: Change user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 description: New password (minimum 8 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Invalid data provided or current password incorrect
 *       401:
 *         description: Not authenticated
 */
router.post('/password', UserController.changePassword);

/**
 * @swagger
 * /users/theme:
 *   put:
 *     summary: Update user's theme preference
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - theme
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, sys]
 *     responses:
 *       200:
 *         description: Theme preference updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     theme:
 *                       type: string
 *                       enum: [light, dark, sys]
 *       400:
 *         description: Invalid theme preference
 *       401:
 *         description: Not authenticated
 */
router.put('/theme', UserController.updateTheme);

/**
 * @swagger
 * /users/contributions:
 *   get:
 *     summary: Get authenticated user's pixel contributions
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User contributions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPixels:
 *                       type: number
 *                     contributedBoards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           boardId:
 *                             type: string
 *                           pixelCount:
 *                             type: number
 *       401:
 *         description: Not authenticated
 */
router.get('/contributions', UserController.getUserContributions);

/**
 * @swagger
 * /users/{id}/contributions:
 *   get:
 *     summary: Get pixel contributions for a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User contributions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPixels:
 *                       type: number
 *                     contributedBoards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           boardId:
 *                             type: string
 *                           pixelCount:
 *                             type: number
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get('/:id/contributions', UserController.getUserContributions);

/**
 * @swagger
 * /users/me/statistics:
 *   get:
 *     summary: Récupérer les statistiques de contribution de l'utilisateur connecté
 *     tags: [Users, Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques détaillées des contributions de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPixelsPlaced:
 *                       type: integer
 *                     boardsContributed:
 *                       type: array
 *                     mostActiveBoard:
 *                       type: object
 *                     activityTimeline:
 *                       type: object
 *                     recentPlacements:
 *                       type: array
 *                     contributionByColor:
 *                       type: object
 *       401:
 *         description: Non authentifié
 */
router.get('/me/statistics', restrictTo('user', 'premium', 'admin'), StatsController.getUserContributionStats);

/**
 * @swagger
 * /users/me/pixelboards/{id}/contributions:
 *   get:
 *     summary: Récupérer les statistiques de contribution de l'utilisateur sur un tableau spécifique
 *     tags: [Users, Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
 *     responses:
 *       200:
 *         description: Statistiques détaillées des contributions de l'utilisateur sur le tableau
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalContributions:
 *                       type: integer
 *                     contributionPercentage:
 *                       type: number
 *                     placementHistory:
 *                       type: array
 *                     heatmap:
 *                       type: object
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: PixelBoard non trouvé
 */
router.get('/me/pixelboards/:id/contributions', restrictTo('user', 'premium', 'admin'), StatsController.getUserBoardContributionStats);

/**
 * @swagger
 * /users/me/contributions/timeline:
 *   get:
 *     summary: Récupérer les contributions temporelles de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [day, week, month, all]
 *         description: Plage de temps pour les données
 *     responses:
 *       200:
 *         description: Contributions temporelles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPixels:
 *                       type: number
 *                     timelineData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: number
 *       401:
 *         description: Non authentifié
 */
router.get('/me/contributions/timeline', restrictTo('user', 'premium', 'admin'), UserController.getUserContributionTimeline);

export default router;
