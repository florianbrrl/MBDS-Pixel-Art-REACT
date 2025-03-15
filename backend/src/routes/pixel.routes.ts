import { Router } from 'express';
import { PixelController } from '../controllers/pixel.controller';
import { authenticateToken as authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/pixels/{boardId}:
 *   post:
 *     summary: Place a pixel on a board
 *     description: Places a pixel on a pixel board with transaction support
 *     tags: [Pixels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pixel board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - x
 *               - y
 *               - color
 *             properties:
 *               x:
 *                 type: integer
 *                 description: X coordinate
 *               y:
 *                 type: integer
 *                 description: Y coordinate
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 description: Hex color code (#RRGGBB)
 *     responses:
 *       201:
 *         description: Pixel placed successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Pixel placement not allowed (cooldown or board rules)
 *       404:
 *         description: Board not found
 *       429:
 *         description: Too many requests (cooldown period)
 */
router.post('/:boardId', authenticate, PixelController.placePixel);

/**
 * @swagger
 * /api/pixels/{boardId}/{x}/{y}:
 *   get:
 *     summary: Get current state of a pixel
 *     description: Retrieves the current color of a pixel at specified coordinates
 *     tags: [Pixels]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pixel board
 *       - in: path
 *         name: x
 *         required: true
 *         schema:
 *           type: integer
 *         description: X coordinate
 *       - in: path
 *         name: y
 *         required: true
 *         schema:
 *           type: integer
 *         description: Y coordinate
 *     responses:
 *       200:
 *         description: Pixel state retrieved successfully
 *       404:
 *         description: Board not found or pixel not set
 */
router.get('/:boardId/:x/:y', PixelController.getPixelState);

/**
 * @swagger
 * /api/pixels/{boardId}/{x}/{y}/history:
 *   get:
 *     summary: Get pixel history
 *     description: Retrieves the modification history of a pixel
 *     tags: [Pixels]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the pixel board
 *       - in: path
 *         name: x
 *         required: true
 *         schema:
 *           type: integer
 *         description: X coordinate
 *       - in: path
 *         name: y
 *         required: true
 *         schema:
 *           type: integer
 *         description: Y coordinate
 *     responses:
 *       200:
 *         description: Pixel history retrieved successfully
 *       404:
 *         description: Board not found
 */
router.get('/:boardId/:x/:y/history', PixelController.getPixelHistory);

export default router;