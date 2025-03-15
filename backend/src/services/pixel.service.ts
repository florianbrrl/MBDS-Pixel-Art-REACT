import { AppErrorClass } from '../middleware/errorHandler.middleware';
import { PixelHistoryModel, IPixelHistoryCreate } from '../models/pixel-history.model';
import { PixelBoardModel } from '../models/pixelboard.model';
import prisma from '../db/client';

/**
 * Interface pour les données de placement de pixel
 */
export interface IPlacePixelData {
  boardId: string;
  x: number;
  y: number;
  color: string;
  userId?: string;
}

/**
 * Service pour la gestion des opérations de pixels
 */
export class PixelService {
  /**
   * Place un pixel sur un tableau avec transaction de base de données
   * @param data Les données du pixel à placer
   * @returns L'entrée d'historique créée
   * @throws AppErrorClass si le placement n'est pas possible
   */
  static async placePixel(data: IPlacePixelData) {
    // Valider les coordonnées et la couleur
    this.validatePixelData(data);

    // Utiliser une transaction pour garantir l'intégrité des données
    return prisma.$transaction(async (tx) => {
      // 1. Récupérer le tableau de pixels à jour (dans la transaction)
      const pixelBoard = await tx.pixelBoard.findUnique({
        where: { id: data.boardId },
      });

      if (!pixelBoard) {
        throw new AppErrorClass('Tableau de pixels non trouvé', 404);
      }

      // 2. Vérifier si le tableau est actif
      if (!pixelBoard.is_active) {
        throw new AppErrorClass('Ce tableau de pixels n\'est pas actif', 403);
      }

      // 3. Vérifier si les coordonnées sont valides
      if (data.x < 0 || data.x >= pixelBoard.width || data.y < 0 || data.y >= pixelBoard.height) {
        throw new AppErrorClass('Coordonnées hors limites', 400);
      }

      // 4. Si l'utilisateur est authentifié, vérifier le cooldown
      if (data.userId) {
        const lastPlacement = await tx.pixelHistory.findFirst({
          where: {
            board_id: data.boardId,
            user_id: data.userId,
          },
          orderBy: {
            timestamp: 'desc',
          },
        });

        if (lastPlacement) {
          const cooldownEndTime = new Date(lastPlacement.timestamp);
          cooldownEndTime.setSeconds(cooldownEndTime.getSeconds() + pixelBoard.cooldown);

          if (new Date() < cooldownEndTime) {
            const secondsRemaining = Math.ceil((cooldownEndTime.getTime() - Date.now()) / 1000);
            throw new AppErrorClass(
              `Veuillez attendre ${secondsRemaining} secondes avant de placer un autre pixel`,
              429
            );
          }
        }
      }

      // 5. Vérifier si le placement est autorisé (réécriture)
      if (!pixelBoard.allow_overwrite) {
        // Convertir la grille JSON en objet JavaScript pour vérification
        const grid = pixelBoard.grid as Record<string, any>;
        const pixelKey = `${data.x},${data.y}`;

        if (grid[pixelKey]) {
          throw new AppErrorClass('Ce pixel a déjà été placé et ne peut pas être écrasé', 403);
        }
      }

      // 6. Créer l'entrée dans l'historique
      const pixelHistoryData: IPixelHistoryCreate = {
        board_id: data.boardId,
        x: data.x,
        y: data.y,
        color: data.color,
        user_id: data.userId,
      };

      const pixelHistory = await tx.pixelHistory.create({
        data: {
          ...pixelHistoryData,
          timestamp: new Date(),
        },
      });

      // 7. Mettre à jour la grille du tableau de pixels
      const updatedGrid = { ...pixelBoard.grid as Record<string, any> };
      updatedGrid[`${data.x},${data.y}`] = data.color;

      await tx.pixelBoard.update({
        where: { id: data.boardId },
        data: { grid: updatedGrid },
      });

      return pixelHistory;
    });
  }

  /**
   * Obtenir l'état actuel d'un pixel
   * @param boardId L'ID du tableau
   * @param x Coordonnée X
   * @param y Coordonnée Y
   * @returns Les données du pixel ou null s'il n'existe pas
   */
  static async getPixelState(boardId: string, x: number, y: number) {
    const pixelBoard = await PixelBoardModel.findById(boardId);

    if (!pixelBoard) {
      throw new AppErrorClass('Tableau de pixels non trouvé', 404);
    }

    const grid = pixelBoard.grid as Record<string, any>;
    const pixelKey = `${x},${y}`;

    if (!grid[pixelKey]) {
      return null;
    }

    return {
      x,
      y,
      color: grid[pixelKey],
      boardId
    };
  }

  /**
   * Obtenir l'historique des modifications d'un pixel
   * @param boardId L'ID du tableau
   * @param x Coordonnée X
   * @param y Coordonnée Y
   * @returns L'historique des modifications
   */
  static async getPixelHistory(boardId: string, x: number, y: number) {
    return PixelHistoryModel.findByCoordinate(boardId, x, y);
  }

  /**
   * Valide les données de pixel
   * @param data Les données à valider
   * @throws AppErrorClass si les données sont invalides
   */
  private static validatePixelData(data: IPlacePixelData) {
    // Vérifier si les coordonnées sont des nombres
    if (typeof data.x !== 'number' || typeof data.y !== 'number') {
      throw new AppErrorClass('Les coordonnées doivent être des nombres', 400);
    }

    // Vérifier si les coordonnées sont des entiers
    if (!Number.isInteger(data.x) || !Number.isInteger(data.y)) {
      throw new AppErrorClass('Les coordonnées doivent être des nombres entiers', 400);
    }

    // Vérifier si les coordonnées sont positives
    if (data.x < 0 || data.y < 0) {
      throw new AppErrorClass('Les coordonnées doivent être positives', 400);
    }

    // Vérifier le format de la couleur (code hexadécimal)
    if (!data.color || !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      throw new AppErrorClass('La couleur doit être au format hexadécimal (#RRGGBB)', 400);
    }
  }
}