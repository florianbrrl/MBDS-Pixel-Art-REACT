import { PixelBoard } from '@prisma/client';
import prisma from '../db/client';

/**
 * Interface représentant les données requises pour créer un nouveau tableau de pixels
 */
export interface IPixelBoardCreate {
	title: string;
	width: number;
	height: number;
	grid: any; // Sera JSONB dans la base de données
	cooldown?: number;
	allow_overwrite?: boolean;
	start_time: Date;
	end_time: Date;
	admin_id?: string;
}

/**
 * Interface pour les options de filtrage des PixelBoards
 */
export interface IPixelBoardFilters {
	isActive?: boolean;
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	allowOverwrite?: boolean;
	title?: string;
	adminId?: string;
	startDateBefore?: Date;
	startDateAfter?: Date;
	endDateBefore?: Date;
	endDateAfter?: Date;
}

/**
 * Interface pour les options de tri des PixelBoards
 */
export interface IPixelBoardSortOptions {
	field: 'created_at' | 'title' | 'width' | 'height' | 'start_time' | 'end_time';
	direction: 'asc' | 'desc';
}

/**
 * Classe modèle PixelBoard pour les opérations de base de données
 */
export class PixelBoardModel {
	/**
	 * Rechercher un tableau de pixels par son ID unique
	 * @param id - L'UUID du tableau
	 * @returns Le tableau de pixels ou null si non trouvé
	 */
	static async findById(id: string): Promise<PixelBoard | null> {
		try {
			return await prisma.pixelBoard.findUnique({
				where: { id },
			});
		} catch (error) {
			// If an invalid UUID format is provided, return null instead of throwing an error
			console.error('Error finding PixelBoard by ID:', error);
			return null;
		}
	}

	/**
	 * Obtenir tous les tableaux de pixels
	 * @returns Tableau de tous les tableaux de pixels
	 */
	static async findAll(): Promise<PixelBoard[]> {
		return prisma.pixelBoard.findMany();
	}

	/**
	 * Obtenir les tableaux de pixels actifs
	 * @returns Tableau des tableaux de pixels actifs
	 */
	static async findActive(): Promise<PixelBoard[]> {
		return prisma.pixelBoard.findMany({
			where: {
				is_active: true,
			},
		});
	}

	/**
	 * Obtenir les tableaux de pixels terminés
	 * @returns Tableau des tableaux de pixels terminés
	 */
	static async findCompleted(): Promise<PixelBoard[]> {
		return prisma.pixelBoard.findMany({
			where: {
				is_active: false,
			},
		});
	}

	/**
	 * Rechercher les tableaux de pixels avec filtres et tri
	 * @param filters - Critères de filtrage
	 * @param sortOptions - Options de tri
	 * @param page - Numéro de page pour la pagination
	 * @param limit - Nombre d'éléments par page
	 * @returns Tableau des tableaux de pixels filtrés et triés
	 */
	static async findWithFilters(
		filters: IPixelBoardFilters = {},
		sortOptions: IPixelBoardSortOptions = { field: 'created_at', direction: 'desc' },
		page = 1,
		limit = 10
	): Promise<{ data: PixelBoard[]; total: number; page: number; limit: number }> {
		// Construire les conditions de filtrage
		const where: any = {};

		if (filters.isActive !== undefined) {
			where.is_active = filters.isActive;
		}

		if (filters.minWidth !== undefined) {
			where.width = { ...(where.width || {}), gte: filters.minWidth };
		}

		if (filters.maxWidth !== undefined) {
			where.width = { ...(where.width || {}), lte: filters.maxWidth };
		}

		if (filters.minHeight !== undefined) {
			where.height = { ...(where.height || {}), gte: filters.minHeight };
		}

		if (filters.maxHeight !== undefined) {
			where.height = { ...(where.height || {}), lte: filters.maxHeight };
		}

		if (filters.allowOverwrite !== undefined) {
			where.allow_overwrite = filters.allowOverwrite;
		}

		if (filters.title) {
			where.title = { contains: filters.title, mode: 'insensitive' };
		}

		if (filters.adminId) {
			where.admin_id = filters.adminId;
		}

		if (filters.startDateBefore) {
			where.start_time = { ...(where.start_time || {}), lte: filters.startDateBefore };
		}

		if (filters.startDateAfter) {
			where.start_time = { ...(where.start_time || {}), gte: filters.startDateAfter };
		}

		if (filters.endDateBefore) {
			where.end_time = { ...(where.end_time || {}), lte: filters.endDateBefore };
		}

		if (filters.endDateAfter) {
			where.end_time = { ...(where.end_time || {}), gte: filters.endDateAfter };
		}

		// Calculer le nombre total d'éléments correspondant aux filtres
		const total = await prisma.pixelBoard.count({ where });

		// Récupérer les données avec pagination et tri
		const data = await prisma.pixelBoard.findMany({
			where,
			orderBy: {
				[sortOptions.field]: sortOptions.direction,
			},
			skip: (page - 1) * limit,
			take: limit,
		});

		return {
			data,
			total,
			page,
			limit,
		};
	}

	/**
	 * Créer un nouveau tableau de pixels
	 * @param data - Données de création du tableau
	 * @returns Le tableau de pixels créé
	 */
	static async create(data: IPixelBoardCreate): Promise<PixelBoard> {
		return prisma.pixelBoard.create({
			data: {
				...data,
				is_active: new Date() >= data.start_time && new Date() <= data.end_time,
				created_at: new Date(),
			},
		});
	}

	/**
	 * Mettre à jour un tableau de pixels existant
	 * @param id - L'UUID du tableau
	 * @param data - Les données à mettre à jour
	 * @returns Le tableau de pixels mis à jour
	 */
	static async update(id: string, data: Partial<PixelBoard>): Promise<PixelBoard> {
		return prisma.pixelBoard.update({
			where: { id },
			data: {
				...data,
				is_active:
					data.start_time && data.end_time
						? new Date() >= data.start_time && new Date() <= data.end_time
						: undefined,
			},
		});
	}

	/**
	 * Supprimer un tableau de pixels par son ID
	 * @param id - L'UUID du tableau
	 * @returns Le tableau de pixels supprimé
	 */
	static async delete(id: string): Promise<PixelBoard> {
		return prisma.pixelBoard.delete({
			where: { id },
		});
	}
}
