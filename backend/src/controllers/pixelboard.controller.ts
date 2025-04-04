import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppErrorClass } from '../middleware/errorHandler.middleware';
import {
	PixelBoardModel,
	IPixelBoardCreate,
	IPixelBoardFilters,
	IPixelBoardSortOptions,
} from '../models/pixelboard.model';
import { PixelHistoryModel } from '../models/pixel-history.model';
import { PixelCooldownModel } from '../models/pixel-cooldown.model';
import { StatsService } from '../services/stats.service';
import { randomUUID } from 'crypto';
import { io } from '../server';
import { PixelUpdateData } from '../types/socket.types';

/**
 * Fonction de validation pour les données PixelBoard
 */
const validatePixelBoardData = (data: any) => {
	// Vérifier les limites de taille
	if (data.width && (data.width < 10 || data.width > 1000)) {
		throw new AppErrorClass('La largeur doit être entre 10 et 1000', 400);
	}

	if (data.height && (data.height < 10 || data.height > 1000)) {
		throw new AppErrorClass('La hauteur doit être entre 10 et 1000', 400);
	}

	// Vérifier les dates
	if (data.start_time && data.end_time) {
		const start = new Date(data.start_time);
		const end = new Date(data.end_time);

		if (start >= end) {
			throw new AppErrorClass('La date de fin doit être postérieure à la date de début', 400);
		}
	}

	return true;
};

/**
 * Parse les paramètres de filtrage depuis la requête
 */
const parseFilterParams = (req: Request): IPixelBoardFilters => {
	const filters: IPixelBoardFilters = {};

	// Parse les filtres booléens
	if (req.query.isActive !== undefined) {
		filters.isActive = req.query.isActive === 'true';
	}

	if (req.query.allowOverwrite !== undefined) {
		filters.allowOverwrite = req.query.allowOverwrite === 'true';
	}

	// Parse les filtres numériques
	if (req.query.minWidth) {
		filters.minWidth = parseInt(req.query.minWidth as string, 10);
	}

	if (req.query.maxWidth) {
		filters.maxWidth = parseInt(req.query.maxWidth as string, 10);
	}

	if (req.query.minHeight) {
		filters.minHeight = parseInt(req.query.minHeight as string, 10);
	}

	if (req.query.maxHeight) {
		filters.maxHeight = parseInt(req.query.maxHeight as string, 10);
	}

	// Parse les filtres de texte
	if (req.query.title) {
		filters.title = req.query.title as string;
	}

	if (req.query.adminId) {
		filters.adminId = req.query.adminId as string;
	}

	// Parse les filtres de date
	if (req.query.startDateBefore) {
		filters.startDateBefore = new Date(req.query.startDateBefore as string);
	}

	if (req.query.startDateAfter) {
		filters.startDateAfter = new Date(req.query.startDateAfter as string);
	}

	if (req.query.endDateBefore) {
		filters.endDateBefore = new Date(req.query.endDateBefore as string);
	}

	if (req.query.endDateAfter) {
		filters.endDateAfter = new Date(req.query.endDateAfter as string);
	}

	return filters;
};

/**
 * Parse les paramètres de tri depuis la requête
 */
const parseSortParams = (req: Request): IPixelBoardSortOptions => {
	const defaultSort: IPixelBoardSortOptions = { field: 'created_at', direction: 'desc' };

	const field = req.query.sortBy as string;
	const direction = req.query.sortDirection as string;

	// Valider le champ de tri
	if (
		field &&
		['created_at', 'title', 'width', 'height', 'start_time', 'end_time'].includes(field)
	) {
		defaultSort.field = field as any;
	}

	// Valider la direction de tri
	if (direction && ['asc', 'desc'].includes(direction)) {
		defaultSort.direction = direction as 'asc' | 'desc';
	}

	return defaultSort;
};

/**
 * Parse les paramètres de pagination depuis la requête
 */
const parsePaginationParams = (req: Request): { page: number; limit: number } => {
	let page = 1;
	let limit = 10;

	if (req.query.page) {
		const parsedPage = parseInt(req.query.page as string, 10);
		if (!isNaN(parsedPage) && parsedPage > 0) {
			page = parsedPage;
		}
	}

	if (req.query.limit) {
		const parsedLimit = parseInt(req.query.limit as string, 10);
		if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
			limit = parsedLimit;
		}
	}

	return { page, limit };
};

export class PixelBoardController {
	/**
	 * Récupérer l'historique des pixels pour un PixelBoard
	 */
	static getBoardHistory = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.params;

			if (!id) {
				return next(new AppErrorClass('ID du PixelBoard requis', 400));
			}

			// Vérifier si le PixelBoard existe
			const pixelBoard = await PixelBoardModel.findById(id);
			if (!pixelBoard) {
				return next(new AppErrorClass('PixelBoard non trouvé', 404));
			}

			const history = await PixelHistoryModel.findByBoardId(id);

			res.status(200).json({
				status: 'success',
				data: history,
			});
		}
	);

	/**
	 * Récupérer l'historique des pixels pour une position spécifique d'un PixelBoard
	 * avec les informations d'utilisateur
	 */
	static getPositionHistory = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { x, y } = req.query;

		if (!id) {
			return next(new AppErrorClass('ID du PixelBoard requis', 400));
		}

		if (x === undefined || y === undefined) {
			return next(new AppErrorClass('Coordonnées (x, y) requises', 400));
		}

		// Vérifier si le PixelBoard existe
		const pixelBoard = await PixelBoardModel.findById(id);
		if (!pixelBoard) {
			return next(new AppErrorClass('PixelBoard non trouvé', 404));
		}

		// Conversion des coordonnées en nombres
		const parsedX = parseInt(x as string, 10);
		const parsedY = parseInt(y as string, 10);

		if (isNaN(parsedX) || isNaN(parsedY)) {
			return next(new AppErrorClass('Les coordonnées doivent être des nombres', 400));
		}

		// Vérifier si les coordonnées sont valides
		if (parsedX < 0 || parsedX >= pixelBoard.width || parsedY < 0 || parsedY >= pixelBoard.height) {
			return next(new AppErrorClass('Coordonnées hors limites', 400));
		}

		// Utiliser la méthode qui inclut les informations utilisateur
		const history = await PixelHistoryModel.findByCoordinateWithUserInfo(id, parsedX, parsedY);

		// Transformer les données pour l'API
		const formattedHistory = history.map(item => ({
			board_id: item.board_id,
			x: item.x,
			y: item.y,
			color: item.color,
			user_id: item.user_id,
			user_email: item.user ? item.user.email : null,
			timestamp: item.timestamp
		}));

		res.status(200).json({
			status: 'success',
			data: formattedHistory,
		});
		}
	);

	/**
	 * Placer un pixel sur un PixelBoard
	 */
	static placePixel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		// Vérifier si l'utilisateur a les droits (restreint aux rôles premium, admin et user)
		if (req.user?.role === 'guest') {
			return next(new AppErrorClass('Les invités ne peuvent pas placer de pixels', 403));
		}

		const { id } = req.params;
		const { x, y, color } = req.body;

		// Validation des champs requis
		if (!id) {
			return next(new AppErrorClass('ID du PixelBoard requis', 400));
		}

		if (x === undefined || y === undefined || !color) {
			return next(new AppErrorClass('Coordonnées (x, y) et couleur requises', 400));
		}

		// Validation du format de la couleur (hex code sans # pour la compatibilité avec les tests)
		const colorRegex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})$/;
		if (!colorRegex.test(color)) {
			return next(new AppErrorClass('Format de couleur invalide (doit être au format hexadécimal RRGGBB ou #RRGGBB)', 400));
		}

		// Normaliser le format avec # si nécessaire
		const normalizedColor = color.startsWith('#') ? color : `#${color}`;

		// Validation des coordonnées comme nombres
		const parsedX = Number(x);
		const parsedY = Number(y);

		if (isNaN(parsedX) || isNaN(parsedY)) {
			return next(new AppErrorClass('Les coordonnées doivent être des nombres', 400));
		}

		// Vérifier si les coordonnées sont négatives
		if (parsedX < 0 || parsedY < 0) {
			return next(new AppErrorClass('Les coordonnées ne peuvent pas être négatives', 400));
		}

		try {
			// Vérifier si l'ID est un UUID valide
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			if (!uuidRegex.test(id)) {
				return next(new AppErrorClass('PixelBoard non trouvé', 404));
			}

			// Vérifier si le PixelBoard existe
			const pixelBoard = await PixelBoardModel.findById(id);
			if (!pixelBoard) {
				return next(new AppErrorClass('PixelBoard non trouvé', 404));
			}

			// Vérifier si le tableau est actif
			if (!pixelBoard.is_active) {
				return next(new AppErrorClass('Ce PixelBoard n\'est plus actif', 400));
			}

			// Vérifier les coordonnées par rapport aux dimensions du tableau
			if (
				parsedX < 0 ||
				parsedY < 0 ||
				parsedX >= pixelBoard.width ||
				parsedY >= pixelBoard.height
			) {
				return next(new AppErrorClass('Coordonnées en dehors des limites du tableau', 400));
			}

			// Vérifier le cooldown uniquement si l'utilisateur est authentifié
			if (req.user?.id) {
				// Vérifier si l'utilisateur est premium (pour contourner le cooldown)
				const isPremium = req.user.role === 'premium' || req.user.role === 'admin';

				// Vérifier si l'utilisateur peut placer un pixel
				const canPlace = await PixelCooldownModel.canPlacePixel(
					req.user.id,
					id,
					pixelBoard.cooldown,
					isPremium
				);

				if (!canPlace) {
					// Obtenir le temps restant
					const remainingTime = await PixelCooldownModel.getRemainingCooldown(
						req.user.id,
						id,
						pixelBoard.cooldown
					);

					return next(
						new AppErrorClass(
							`Vous devez attendre encore ${remainingTime} secondes avant de placer un nouveau pixel`,
							429 // Too Many Requests est un code approprié ici
						)
					);
				}
			}

			// Vérifier les permissions d'écrasement
			const grid = pixelBoard.grid as any;
			const pixelKey = `${parsedX},${parsedY}`;

			if (!pixelBoard.allow_overwrite && grid[pixelKey]) {
				return next(new AppErrorClass('Ce pixel a déjà été placé et ne peut pas être écrasé', 400));
			}

			// Placer le pixel avec l'ID de l'utilisateur connecté si disponible
			const pixelData = {
				x: parsedX,
				y: parsedY,
				color: normalizedColor,
				user_id: req.user?.id
			};

			const updatedPixelBoard = await PixelBoardModel.placePixel(id, pixelData);

			// Créer les données pour la mise à jour en temps réel
			const pixelUpdateData: PixelUpdateData = {
				pixelboard_id: updatedPixelBoard.id,
				x: parsedX,
				y: parsedY,
				color: normalizedColor,
				timestamp: new Date(),
				user_id: req.user?.id
			};

			// Émettre l'événement de mise à jour aux clients connectés à ce tableau
			// Utilisez la nouvelle méthode SimpleWSService
			io.emitPixelUpdate(id, pixelUpdateData);

			res.status(200).json({
				status: 'success',
				data: pixelUpdateData
			});
		} catch (error: any) {
			// Gérer les erreurs spécifiques au placement de pixels
			return next(new AppErrorClass(error.message, 400));
		}
	});

	/**
	 * Vérifier le statut du cooldown pour un utilisateur
	 */
	static checkCooldown = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;

		if (!id) {
			return next(new AppErrorClass('ID du PixelBoard requis', 400));
		}

		if (!req.user?.id) {
			return next(new AppErrorClass('Authentification requise', 401));
		}

		// Vérifier si le PixelBoard existe
		const pixelBoard = await PixelBoardModel.findById(id);
		if (!pixelBoard) {
			return next(new AppErrorClass('PixelBoard non trouvé', 404));
		}

		// Vérifier si l'utilisateur est premium
		const isPremium = req.user.role === 'premium' || req.user.role === 'admin';

		// Obtenir le statut du cooldown
		const canPlace = await PixelCooldownModel.canPlacePixel(
			req.user.id,
			id,
			pixelBoard.cooldown,
			isPremium
		);

		// Obtenir le temps restant (0 si l'utilisateur peut placer un pixel)
		const remainingSeconds = await PixelCooldownModel.getRemainingCooldown(
			req.user.id,
			id,
			pixelBoard.cooldown
		);

		res.status(200).json({
			status: 'success',
			data: {
				canPlace,
				remainingSeconds,
				isPremium
			}
		});
	});

	/**
	 * Récupérer tous les PixelBoards avec filtrage, tri et pagination
	 */
	static getAllPixelBoards = catchAsync(async (req: Request, res: Response) => {
		// Parser les paramètres de filtrage, tri et pagination
		const filters = parseFilterParams(req);
		const sortOptions = parseSortParams(req);
		const { page, limit } = parsePaginationParams(req);

		// Récupérer les données avec les filtres appliqués
		const result = await PixelBoardModel.findWithFilters(filters, sortOptions, page, limit);

		res.status(200).json({
			status: 'success',
			data: result.data,
			meta: {
				total: result.total,
				page: result.page,
				limit: result.limit,
				pages: Math.ceil(result.total / result.limit),
			},
		});
	});

	/**
	 * Récupérer les PixelBoards actifs uniquement
	 */
	static getActivePixelBoards = catchAsync(async (req: Request, res: Response) => {
		// Forcer le filtre is_active à true et utiliser les autres filtres de la requête
		const filters = { ...parseFilterParams(req), isActive: true };
		const sortOptions = parseSortParams(req);
		const { page, limit } = parsePaginationParams(req);

		const result = await PixelBoardModel.findWithFilters(filters, sortOptions, page, limit);

		res.status(200).json({
			status: 'success',
			data: result.data,
			meta: {
				total: result.total,
				page: result.page,
				limit: result.limit,
				pages: Math.ceil(result.total / result.limit),
			},
		});
	});

	/**
	 * Récupérer les PixelBoards terminés (non actifs)
	 */
	static getCompletedPixelBoards = catchAsync(async (req: Request, res: Response) => {
		// Forcer le filtre is_active à false et utiliser les autres filtres de la requête
		const filters = { ...parseFilterParams(req), isActive: false };
		const sortOptions = parseSortParams(req);
		const { page, limit } = parsePaginationParams(req);

		const result = await PixelBoardModel.findWithFilters(filters, sortOptions, page, limit);

		res.status(200).json({
			status: 'success',
			data: result.data,
			meta: {
				total: result.total,
				page: result.page,
				limit: result.limit,
				pages: Math.ceil(result.total / result.limit),
			},
		});
	});

	/**
	 * Récupérer un PixelBoard par son ID
	 */
	static getPixelBoardById = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.params;

			if (!id) {
				return next(new AppErrorClass('ID du PixelBoard requis', 400));
			}

			const pixelBoard = await PixelBoardModel.findById(id);

			if (!pixelBoard) {
				return next(new AppErrorClass('PixelBoard non trouvé', 404));
			}

			res.status(200).json({
				status: 'success',
				data: pixelBoard,
			});
		}
	);

	/**
	 * Créer un nouveau PixelBoard
	 */
	static createPixelBoard = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
		  const { title, width, height, cooldown, allow_overwrite, start_time, end_time, initialGrid } =
			req.body;

		  // Validation de base
		  if (!title || !width || !height || !start_time || !end_time) {
			return next(new AppErrorClass('Champs obligatoires manquants', 400));
		  }

		  // Validation approfondie
		  validatePixelBoardData(req.body);

		  // Création des données pour le PixelBoard
		  const pixelBoardData: IPixelBoardCreate = {
			title,
			width: Number(width),
			height: Number(height),
			grid: initialGrid || {}, // Utiliser les données de l'image importée si disponibles
			cooldown: cooldown ? Number(cooldown) : 60, // Valeur par défaut: 60 secondes
			allow_overwrite: allow_overwrite || false, // Valeur par défaut: false
			start_time: new Date(start_time),
			end_time: new Date(end_time),
			admin_id: req.user?.id, // ID de l'administrateur qui crée le PixelBoard
		  };

		  // Création du PixelBoard
		  const pixelBoard = await PixelBoardModel.create(pixelBoardData);

		  res.status(201).json({
			status: 'success',
			data: pixelBoard,
		  });
		}
	  );

	/**
	 * Mettre à jour un PixelBoard
	 */
	static updatePixelBoard = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.params;
			const { title, width, height, cooldown, allow_overwrite, start_time, end_time } =
				req.body;

			if (!id) {
				return next(new AppErrorClass('ID du PixelBoard requis', 400));
			}

			// Vérifier si le PixelBoard existe
			const existingPixelBoard = await PixelBoardModel.findById(id);

			if (!existingPixelBoard) {
				return next(new AppErrorClass('PixelBoard non trouvé', 404));
			}

			// Vérifier que l'utilisateur est l'administrateur du PixelBoard
			if (existingPixelBoard.admin_id && existingPixelBoard.admin_id !== req.user?.id) {
				return next(
					new AppErrorClass("Vous n'êtes pas autorisé à modifier ce PixelBoard", 403)
				);
			}

			// Validation des données
			if (width || height || start_time || end_time) {
				validatePixelBoardData({
					width: width || existingPixelBoard.width,
					height: height || existingPixelBoard.height,
					start_time: start_time || existingPixelBoard.start_time,
					end_time: end_time || existingPixelBoard.end_time,
				});
			}

			// Mettre à jour les champs
			const updatedPixelBoard = await PixelBoardModel.update(id, {
				...(title && { title }),
				...(width && { width: Number(width) }),
				...(height && { height: Number(height) }),
				...(cooldown !== undefined && { cooldown: Number(cooldown) }),
				...(allow_overwrite !== undefined && { allow_overwrite }),
				...(start_time && { start_time: new Date(start_time) }),
				...(end_time && { end_time: new Date(end_time) }),
			});

			res.status(200).json({
				status: 'success',
				data: updatedPixelBoard,
			});
		}
	);

	/**
	 * Supprimer un PixelBoard
	 */
	static deletePixelBoard = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.params;

			if (!id) {
				return next(new AppErrorClass('ID du PixelBoard requis', 400));
			}

			// Vérifier si le PixelBoard existe
			const existingPixelBoard = await PixelBoardModel.findById(id);

			if (!existingPixelBoard) {
				return next(new AppErrorClass('PixelBoard non trouvé', 404));
			}

			// Vérifier que l'utilisateur est l'administrateur du PixelBoard
			if (existingPixelBoard.admin_id && existingPixelBoard.admin_id !== req.user?.id) {
				return next(
					new AppErrorClass("Vous n'êtes pas autorisé à supprimer ce PixelBoard", 403)
				);
			}

			// Supprimer le PixelBoard
			await PixelBoardModel.delete(id);

			res.status(204).send();
		}
	);

	/**
	 * Récupérer la heatmap d'un PixelBoard
	 */
	static getBoardHeatmap = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.params;
			const { timeFrame } = req.query;

			if (!id) {
				return next(new AppErrorClass('ID du PixelBoard requis', 400));
			}

			// Vérifier si le PixelBoard existe
			const pixelBoard = await PixelBoardModel.findById(id);
			if (!pixelBoard) {
				return next(new AppErrorClass('PixelBoard non trouvé', 404));
			}

			const validTimeFrames = ['24h', '7d', '30d', 'all'];
			const selectedTimeFrame = validTimeFrames.includes(timeFrame as string)
				? (timeFrame as string)
				: 'all';

			const heatmap = await StatsService.getBoardHeatmap(id, selectedTimeFrame);

			res.status(200).json({
				status: 'success',
				data: {
					boardId: id,
					timeFrame: selectedTimeFrame,
					boardTitle: pixelBoard.title,
					boardDimensions: {
						width: pixelBoard.width,
						height: pixelBoard.height
					},
					heatmap
				}
			});
		}
	);
}
