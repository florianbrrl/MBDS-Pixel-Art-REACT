import { User } from '@prisma/client';
import prisma from '../db/client';

/**
 * Interface représentant les données requises pour créer un nouvel utilisateur
 */
export interface IUserCreate {
	email: string;
	password_hash: string;
	theme_preference?: string;
}

/**
 * Classe modèle User pour les opérations de base de données
 */
export class UserModel {
	/**
	 * Rechercher un utilisateur par son ID unique
	 * @param id - L'UUID de l'utilisateur
	 * @returns L'utilisateur ou null si non trouvé
	 */
	static async findById(id: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { id },
		});
	}

	/**
	 * Rechercher un utilisateur par son adresse email
	 * @param email - L'email de l'utilisateur
	 * @returns L'utilisateur ou null si non trouvé
	 */
	static async findByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	/**
	 * Créer un nouvel utilisateur
	 * @param data - Données de création de l'utilisateur
	 * @returns L'utilisateur créé
	 */
	static async create(data: IUserCreate): Promise<User> {
		return prisma.user.create({
			data: {
				...data,
				created_at: new Date(),
			},
		});
	}


	/**
	 * Mettre à jour un utilisateur existant
	 * @param id - L'UUID de l'utilisateur
	 * @param data - Les données à mettre à jour
	 * @returns L'utilisateur mis à jour
	 */
	static async update(id: string, data: Partial<User>): Promise<User> {
		return prisma.user.update({
			where: { id },
			data: {
				...data,
				updated_at: new Date(),
			},
		});
	}

	/**
	 * Supprimer un utilisateur par son ID
	 * @param id - L'UUID de l'utilisateur
	 * @returns L'utilisateur supprimé
	 */
	static async delete(id: string): Promise<User> {
		return prisma.user.delete({
			where: { id },
		});
	}
}
