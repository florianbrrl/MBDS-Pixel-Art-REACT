import prisma from '../db/client';

/**
 * Interface pour les dernières actions utilisateur
 */
export interface IUserLastAction {
  userId: string;
  boardId: string;
  lastActionTime: Date;
}

/**
 * Classe modèle pour gérer les cooldowns entre placements de pixels
 */
export class PixelCooldownModel {
  /**
   * Vérifie si un utilisateur peut placer un pixel sur un tableau spécifique
   * @param userId - ID de l'utilisateur
   * @param boardId - ID du tableau
   * @param cooldownSeconds - Délai de cooldown en secondes
   * @returns true si l'utilisateur peut placer un pixel, false sinon
   */
  static async canPlacePixel(
    userId: string,
    boardId: string,
    cooldownSeconds: number,
    isPremium: boolean = false
  ): Promise<boolean> {
    // Les utilisateurs premium peuvent ignorer le cooldown
    if (isPremium) {
      return true;
    }

    // Récupérer la dernière action de l'utilisateur sur ce tableau
    const lastPixel = await prisma.pixelHistory.findFirst({
      where: {
        board_id: boardId,
        user_id: userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Si l'utilisateur n'a jamais placé de pixel sur ce tableau, il peut en placer un
    if (!lastPixel) {
      return true;
    }

    // Calculer le temps écoulé depuis le dernier placement
    const now = new Date();
    const lastPlacementTime = lastPixel.timestamp;
    const elapsedSeconds = Math.floor((now.getTime() - lastPlacementTime.getTime()) / 1000);

    // L'utilisateur peut placer un pixel si le temps écoulé est supérieur au cooldown
    return elapsedSeconds >= cooldownSeconds;
  }

  /**
   * Calcule le temps restant avant que l'utilisateur puisse placer un nouveau pixel
   * @param userId - ID de l'utilisateur
   * @param boardId - ID du tableau
   * @param cooldownSeconds - Délai de cooldown en secondes
   * @returns Temps restant en secondes, 0 si l'utilisateur peut placer un pixel
   */
  static async getRemainingCooldown(
    userId: string,
    boardId: string,
    cooldownSeconds: number
  ): Promise<number> {
    // Récupérer la dernière action de l'utilisateur sur ce tableau
    const lastPixel = await prisma.pixelHistory.findFirst({
      where: {
        board_id: boardId,
        user_id: userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Si l'utilisateur n'a jamais placé de pixel sur ce tableau, pas de cooldown
    if (!lastPixel) {
      return 0;
    }

    // Calculer le temps écoulé depuis le dernier placement
    const now = new Date();
    const lastPlacementTime = lastPixel.timestamp;
    const elapsedSeconds = Math.floor((now.getTime() - lastPlacementTime.getTime()) / 1000);

    // Calculer le temps restant
    const remainingSeconds = Math.max(0, cooldownSeconds - elapsedSeconds);
    return remainingSeconds;
  }
}
