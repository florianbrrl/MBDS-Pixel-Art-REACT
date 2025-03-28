import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticateToken, restrictTo } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Routes pour les statistiques de l'application
 */

/**
 * @swagger
 * /stats/global:
 *   get:
 *     summary: Récupérer les statistiques globales de l'application
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques globales de l'application
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
 *                     totalUsers:
 *                       type: integer
 *                     totalBoards:
 *                       type: integer
 *                     activeBoards:
 *                       type: integer
 *                     totalPixelsPlaced:
 *                       type: integer
 *                     engagementRate:
 *                       type: number
 *                     recentActivity:
 *                       type: array
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 */
router.get('/global', authenticateToken, restrictTo('admin'), StatsController.getGlobalStats);

/**
 * @swagger
 * /stats/users/activity:
 *   get:
 *     summary: Récupérer les statistiques d'activité des utilisateurs
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques d'activité des utilisateurs
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
 *                     newUsersCount:
 *                       type: object
 *                     dailyActiveUsers:
 *                       type: integer
 *                     weeklyActiveUsers:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 */
router.get('/users/activity', authenticateToken, restrictTo('admin'), StatsController.getUserActivityStats);

/**
 * @swagger
 * /stats/pixelboards/{id}:
 *   get:
 *     summary: Récupérer les statistiques détaillées pour un PixelBoard spécifique
 *     tags: [Statistics]
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
 *         description: Statistiques détaillées du PixelBoard
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
 *                     totalContributors:
 *                       type: integer
 *                     totalPixelsPlaced:
 *                       type: integer
 *                     pixelsPerDay:
 *                       type: number
 *                     mostActiveTime:
 *                       type: string
 *                     completionPercentage:
 *                       type: number
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: PixelBoard non trouvé
 */
router.get('/pixelboards/:id', authenticateToken, StatsController.getBoardStats);

/**
 * @swagger
 * /stats/engagement:
 *   get:
 *     summary: Récupérer les métriques d'engagement des utilisateurs
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques d'engagement des utilisateurs
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
 *                     engagementRate:
 *                       type: number
 *                     retentionRate:
 *                       type: number
 *                     engagement7dTrend:
 *                       type: array
 *                     engagement30dTrend:
 *                       type: array
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 */
router.get('/engagement', authenticateToken, restrictTo('admin'), StatsController.getEngagementMetrics);

/**
 * @swagger
 * /stats/activity/recent:
 *   get:
 *     summary: Récupérer l'activité récente sous forme de timeline
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activité récente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 */
router.get('/activity/recent', authenticateToken, restrictTo('admin'), StatsController.getRecentActivity);

/**
 * @swagger
 * /stats/super-board:
 *   get:
 *     summary: Récupérer les statistiques du SuperBoard
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du SuperBoard
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
 *                     totalBoards:
 *                       type: integer
 *                     totalPixels:
 *                       type: integer
 *                     mostActiveBoard:
 *                       type: object
 *                     boardDistribution:
 *                       type: object
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 */
router.get('/super-board', authenticateToken, StatsController.getSuperBoardStats);

/**
 * @swagger
 * /stats/pixelboard/placement:
 *   get:
 *     summary: Récupérer les statistiques de placement de pixels
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de placement de pixels
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
 *                     placementHeatMap:
 *                       type: object
 *                     mostActiveRegions:
 *                       type: array
 *                     placementTrends:
 *                       type: object
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 */
router.get('/pixelboard/placement', authenticateToken, restrictTo('admin'), StatsController.getPixelPlacementStats);

/**
 * @swagger
 * /users/me/statistics:
 *   get:
 *     summary: Récupérer les statistiques de contribution de l'utilisateur connecté
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de contribution de l'utilisateur
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
 *       401:
 *         description: Non authentifié
 */

export default router;