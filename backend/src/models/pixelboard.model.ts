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
 * Classe modèle PixelBoard pour les opérations de base de données
 */
export class PixelBoardModel {
	/**
	 * Rechercher un tableau de pixels par son ID unique
	 * @param id - L'UUID du tableau
	 * @returns Le tableau de pixels ou null si non trouvé
	 */
	static async findById(id: string): Promise<PixelBoard | null> {
		return prisma.pixelBoard.findUnique({
			where: { id },
		});
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
