import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticateToken, restrictTo } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: API endpoints for pixel board and user statistics
 */

/**
 * @swagger
 * /stats/global:
 *   get:
 *     summary: Get global application statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global application statistics
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
 *                       items:
 *                         type: object
 */
router.get('/global', authenticateToken, restrictTo('admin'), StatsController.getGlobalStats);

/**
 * @swagger
 * /stats/users/activity:
 *   get:
 *     summary: Get user activity statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity statistics
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
 */
router.get('/users/activity', authenticateToken, restrictTo('admin'), StatsController.getUserActivityStats);

/**
 * @swagger
 * /stats/pixelboards/{id}:
 *   get:
 *     summary: Get detailed statistics for a specific PixelBoard
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PixelBoard
 *     responses:
 *       200:
 *         description: PixelBoard statistics
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
 *                       type: object
 *                     mostActiveTime:
 *                       type: integer
 *                     completionPercentage:
 *                       type: number
 */
router.get('/pixelboards/:id', StatsController.getPixelBoardStats);

/**
 * @swagger
 * /stats/engagement:
 *   get:
 *     summary: Get user engagement metrics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User engagement metrics
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
 */
router.get('/engagement', authenticateToken, restrictTo('admin'), StatsController.getEngagementMetrics);

/**
 * @swagger
 * /stats/activity/recent:
 *   get:
 *     summary: Get recent activity on the platform
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity events
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
 *                   items:
 *                     type: object
 */
router.get('/activity/recent', authenticateToken, restrictTo('admin'), StatsController.getRecentActivity);

/**
 * @swagger
 * /stats/super-board:
 *   get:
 *     summary: Get SuperPixelBoard statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: SuperPixelBoard statistics
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
 *                       type: array
 */
router.get('/super-board', StatsController.getSuperBoardStats);

/**
 * @swagger
 * /stats/pixelboard/placement:
 *   get:
 *     summary: Get pixel placement statistics across boards
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Pixel placement statistics and heat map data
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
 *                       type: array
 *                     mostActiveRegions:
 *                       type: array
 *                     placementTrends:
 *                       type: array
 */
router.get('/pixelboard/placement', StatsController.getPlacementStats);

/**
 * @swagger
 * /pixelboards/{id}/heatmap:
 *   get:
 *     summary: Get heatmap data for a specific PixelBoard
 *     tags: [Statistics, PixelBoards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PixelBoard
 *       - in: query
 *         name: timeFrame
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, all]
 *         description: Time frame for the heatmap data
 *     responses:
 *       200:
 *         description: Heatmap data for the specified PixelBoard
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
 *                     boardId:
 *                       type: string
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *                     timeFrame:
 *                       type: string
 *                     grid:
 *                       type: array
 */
router.get('/pixelboards/:id/heatmap', StatsController.getPixelBoardHeatmap);

// Protected user statistics routes
router.use(authenticateToken);

/**
 * @swagger
 * /users/me/statistics:
 *   get:
 *     summary: Get statistics about the current user's contributions
 *     tags: [Statistics, Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User contribution statistics
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
 *                       type: array
 *                     recentPlacements:
 *                       type: array
 *                     contributionByColor:
 *                       type: array
 */
router.get('/users/me/statistics', StatsController.getUserStats);

/**
 * @swagger
 * /users/me/pixelboards/{id}/contributions:
 *   get:
 *     summary: Get details of user's contributions to a specific board
 *     tags: [Statistics, Users, PixelBoards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the PixelBoard
 *     responses:
 *       200:
 *         description: User's contributions to the specified PixelBoard
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
 */
router.get('/users/me/pixelboards/:id/contributions', StatsController.getUserBoardContributions);

export default router;
