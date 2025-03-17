import { Router } from 'express';
import { PixelBoardController } from '../controllers/pixelboard.controller';
import { authenticateToken, restrictTo } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PixelBoards
 *   description: Opérations liées aux tableaux d'art pixel
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PixelBoard:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - width
 *         - height
 *         - grid
 *         - start_time
 *         - end_time
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identifiant unique du PixelBoard
 *         title:
 *           type: string
 *           description: Titre du PixelBoard
 *         width:
 *           type: integer
 *           minimum: 10
 *           maximum: 1000
 *           description: Largeur du PixelBoard
 *         height:
 *           type: integer
 *           minimum: 10
 *           maximum: 1000
 *           description: Hauteur du PixelBoard
 *         grid:
 *           type: object
 *           description: Grille de pixels (format JSON)
 *         cooldown:
 *           type: integer
 *           default: 60
 *           description: Délai entre les placements de pixels (en secondes)
 *         allow_overwrite:
 *           type: boolean
 *           default: false
 *           description: Autorisation de remplacer les pixels existants
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Date de début du PixelBoard
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Date de fin du PixelBoard
 *         is_active:
 *           type: boolean
 *           description: Statut d'activité (calculé en fonction des dates)
 *         admin_id:
 *           type: string
 *           format: uuid
 *           description: ID de l'administrateur créateur
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

/**
 * @swagger
 * /pixelboards:
 *   get:
 *     summary: Récupérer tous les PixelBoards avec filtrage, tri et pagination
 *     tags: [PixelBoards]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif/inactif
 *       - in: query
 *         name: minWidth
 *         schema:
 *           type: integer
 *         description: Largeur minimale
 *       - in: query
 *         name: maxWidth
 *         schema:
 *           type: integer
 *         description: Largeur maximale
 *       - in: query
 *         name: minHeight
 *         schema:
 *           type: integer
 *         description: Hauteur minimale
 *       - in: query
 *         name: maxHeight
 *         schema:
 *           type: integer
 *         description: Hauteur maximale
 *       - in: query
 *         name: allowOverwrite
 *         schema:
 *           type: boolean
 *         description: Filtrer par autorisation d'écrasement
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Recherche par titre (partiel)
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Filtrer par ID d'administrateur
 *       - in: query
 *         name: startDateBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début avant
 *       - in: query
 *         name: startDateAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début après
 *       - in: query
 *         name: endDateBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin avant
 *       - in: query
 *         name: endDateAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin après
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, title, width, height, start_time, end_time]
 *         description: Champ pour le tri
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Direction du tri
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des PixelBoards
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
 *                     $ref: '#/components/schemas/PixelBoard'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', PixelBoardController.getAllPixelBoards);

/**
 * @swagger
 * /pixelboards/active:
 *   get:
 *     summary: Récupérer uniquement les PixelBoards actifs
 *     tags: [PixelBoards]
 *     parameters:
 *       - in: query
 *         name: minWidth
 *         schema:
 *           type: integer
 *         description: Largeur minimale
 *       - in: query
 *         name: maxWidth
 *         schema:
 *           type: integer
 *         description: Largeur maximale
 *       - in: query
 *         name: minHeight
 *         schema:
 *           type: integer
 *         description: Hauteur minimale
 *       - in: query
 *         name: maxHeight
 *         schema:
 *           type: integer
 *         description: Hauteur maximale
 *       - in: query
 *         name: allowOverwrite
 *         schema:
 *           type: boolean
 *         description: Filtrer par autorisation d'écrasement
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Recherche par titre (partiel)
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Filtrer par ID d'administrateur
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, title, width, height, start_time, end_time]
 *         description: Champ pour le tri
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Direction du tri
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des PixelBoards actifs
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
 *                     $ref: '#/components/schemas/PixelBoard'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/active', PixelBoardController.getActivePixelBoards);

/**
 * @swagger
 * /pixelboards/completed:
 *   get:
 *     summary: Récupérer uniquement les PixelBoards terminés
 *     tags: [PixelBoards]
 *     parameters:
 *       - in: query
 *         name: minWidth
 *         schema:
 *           type: integer
 *         description: Largeur minimale
 *       - in: query
 *         name: maxWidth
 *         schema:
 *           type: integer
 *         description: Largeur maximale
 *       - in: query
 *         name: minHeight
 *         schema:
 *           type: integer
 *         description: Hauteur minimale
 *       - in: query
 *         name: maxHeight
 *         schema:
 *           type: integer
 *         description: Hauteur maximale
 *       - in: query
 *         name: allowOverwrite
 *         schema:
 *           type: boolean
 *         description: Filtrer par autorisation d'écrasement
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Recherche par titre (partiel)
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Filtrer par ID d'administrateur
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, title, width, height, start_time, end_time]
 *         description: Champ pour le tri
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Direction du tri
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des PixelBoards terminés
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
 *                     $ref: '#/components/schemas/PixelBoard'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/completed', PixelBoardController.getCompletedPixelBoards);

/**
 * @swagger
 * /pixelboards/{id}:
 *   get:
 *     summary: Récupérer un PixelBoard par son ID
 *     tags: [PixelBoards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
 *     responses:
 *       200:
 *         description: Détails du PixelBoard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PixelBoard'
 *       404:
 *         description: PixelBoard non trouvé
 */
router.get('/:id', PixelBoardController.getPixelBoardById);

/**
 * @swagger
 * /pixelboards/{id}/history:
 *   get:
 *     summary: Récupérer l'historique complet des pixels d'un PixelBoard
 *     tags: [PixelBoards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
 *     responses:
 *       200:
 *         description: Historique des pixels du PixelBoard
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
 *                     properties:
 *                       board_id:
 *                         type: string
 *                       x:
 *                         type: integer
 *                       y:
 *                         type: integer
 *                       color:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: PixelBoard non trouvé
 */
router.get('/:id/history', PixelBoardController.getBoardHistory);

/**
 * @swagger
 * /pixelboards/{id}/position-history:
 *   get:
 *     summary: Récupérer l'historique des pixels pour une position spécifique
 *     tags: [PixelBoards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
 *       - in: query
 *         name: x
 *         required: true
 *         schema:
 *           type: integer
 *         description: Coordonnée X du pixel
 *       - in: query
 *         name: y
 *         required: true
 *         schema:
 *           type: integer
 *         description: Coordonnée Y du pixel
 *     responses:
 *       200:
 *         description: Historique des pixels pour la position spécifiée
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
 *                     properties:
 *                       board_id:
 *                         type: string
 *                       x:
 *                         type: integer
 *                       y:
 *                         type: integer
 *                       color:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Coordonnées invalides ou manquantes
 *       404:
 *         description: PixelBoard non trouvé
 */
router.get('/:id/position-history', PixelBoardController.getPositionHistory);

/**
 * @swagger
 * /pixelboards/{id}/cooldown:
 *   get:
 *     summary: Vérifier le statut du cooldown pour un utilisateur
 *     tags: [PixelBoards]
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
 *         description: Statut du cooldown
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
 *                     canPlace:
 *                       type: boolean
 *                     remainingSeconds:
 *                       type: integer
 *                     isPremium:
 *                       type: boolean
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: PixelBoard non trouvé
 */
router.get('/:id/cooldown', authenticateToken, PixelBoardController.checkCooldown);

// Les routes protégées restent inchangées...
router.use(authenticateToken);

/**
 * @swagger
 * /pixelboards/{id}/pixel:
 *   post:
 *     summary: Placer un pixel sur un PixelBoard
 *     description: |
 *       Permet de placer un pixel sur un PixelBoard spécifique.
 *       Soumis à un cooldown entre les placements (sauf pour les utilisateurs premium).
 *       Le cooldown est défini par tableau et varie généralement entre 5 et 300 secondes.
 *     tags: [PixelBoards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
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
 *                 description: Coordonnée X du pixel
 *               y:
 *                 type: integer
 *                 description: Coordonnée Y du pixel
 *               color:
 *                 type: string
 *                 description: Couleur au format hexadécimal (#RRGGBB)
 *     responses:
 *       200:
 *         description: Pixel placé avec succès
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
 *                     pixelboard_id:
 *                       type: string
 *                     x:
 *                       type: integer
 *                     y:
 *                       type: integer
 *                     color:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erreur de validation ou contrainte de coordonnées
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle insuffisant
 *       404:
 *         description: PixelBoard non trouvé
 *       429:
 *         description: Trop de requêtes - Cooldown actif
 */
router.post('/:id/pixel', PixelBoardController.placePixel);

router.post('/', restrictTo('admin'), PixelBoardController.createPixelBoard);
router.put('/:id', restrictTo('admin'), PixelBoardController.updatePixelBoard);
router.delete('/:id', restrictTo('admin'), PixelBoardController.deletePixelBoard);

export default router;
