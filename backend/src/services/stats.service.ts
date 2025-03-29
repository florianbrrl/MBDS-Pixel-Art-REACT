import { 
  StatsModel, 
  IGlobalStats, 
  IUserActivityStats, 
  IBoardStats, 
  IEngagementMetrics, 
  ISuperBoardStats, 
  IPixelPlacementStats, 
  IUserContributionStats, 
  IUserBoardContributionStats 
} from '../models/stats.model';
import { AppErrorClass } from '../middleware/errorHandler.middleware';

/**
 * Service pour les statistiques de l'application
 */
export class StatsService {
  /**
   * Récupère les statistiques globales de l'application
   */
  static async getGlobalStats(): Promise<IGlobalStats> {
    try {
      return await StatsModel.getGlobalStats();
    } catch (error: any) {
      throw new AppErrorClass(`Erreur lors de la récupération des statistiques globales: ${error.message}`, 500);
    }
  }

  /**
   * Récupère les statistiques d'activité des utilisateurs
   */
  static async getUserActivityStats(): Promise<IUserActivityStats> {
    try {
      return await StatsModel.getUserActivityStats();
    } catch (error: any) {
      throw new AppErrorClass(`Erreur lors de la récupération des statistiques d'activité: ${error.message}`, 500);
    }
  }

  /**
   * Récupère les statistiques détaillées pour un PixelBoard spécifique
   */
  static async getBoardStats(boardId: string): Promise<IBoardStats> {
    try {
      const stats = await StatsModel.getBoardStats(boardId);
      if (!stats) {
        throw new AppErrorClass('PixelBoard non trouvé', 404);
      }
      return stats;
    } catch (error: any) {
      if (error instanceof AppErrorClass) {
        throw error;
      }
      throw new AppErrorClass(`Erreur lors de la récupération des statistiques du tableau: ${error.message}`, 500);
    }
  }

  /**
   * Récupère les métriques d'engagement des utilisateurs
   */
  static async getEngagementMetrics(): Promise<IEngagementMetrics> {
    try {
      return await StatsModel.getEngagementMetrics();
    } catch (error: any) {
      throw new AppErrorClass(`Erreur lors de la récupération des métriques d'engagement: ${error.message}`, 500);
    }
  }

  /**
   * Récupère l'activité récente sous forme de timeline
   */
  static async getRecentActivity(): Promise<any[]> {
    try {
      return await StatsModel.getRecentActivity();
    } catch (error: any) {
      throw new AppErrorClass(`Erreur lors de la récupération de l'activité récente: ${error.message}`, 500);
    }
  }

  /**
   * Récupère les statistiques du SuperBoard
   */
  static async getSuperBoardStats(): Promise<ISuperBoardStats> {
    try {
      return await StatsModel.getSuperBoardStats();
    } catch (error: any) {
      throw new AppErrorClass(`Erreur lors de la récupération des statistiques du SuperBoard: ${error.message}`, 500);
    }
  }

  /**
   * Récupère les statistiques de placement de pixels (heatmap)
   */
  static async getPixelPlacementStats(): Promise<IPixelPlacementStats> {
    try {
      return await StatsModel.getPixelPlacementStats();
    } catch (error: any) {
      throw new AppErrorClass(`Erreur lors de la récupération des statistiques de placement: ${error.message}`, 500);
    }
  }

  /**
   * Récupère les données de heatmap pour un tableau spécifique
   */
  static async getBoardHeatmap(boardId: string, timeFrame: string = 'all'): Promise<Record<string, number>> {
    try {
      return await StatsModel.getBoardHeatmap(boardId, timeFrame);
    } catch (error: any) {
      throw new AppErrorClass(`Erreur lors de la récupération de la heatmap: ${error.message}`, 500);
    }
  }

  /**
   * Récupère les statistiques de contribution d'un utilisateur
   */
  static async getUserContributionStats(userId: string): Promise<IUserContributionStats> {
    try {
      return await StatsModel.getUserContributionStats(userId);
    } catch (error: any) {
      if (error.message === 'Utilisateur non trouvé') {
        throw new AppErrorClass('Utilisateur non trouvé', 404);
      }
      throw new AppErrorClass(`Erreur lors de la récupération des statistiques de contribution: ${error.message}`, 500);
    }
  }

  /**
   * Récupère les statistiques de contribution d'un utilisateur sur un tableau spécifique
   */
  static async getUserBoardContributionStats(
    userId: string,
    boardId: string
  ): Promise<IUserBoardContributionStats> {
    try {
      const stats = await StatsModel.getUserBoardContributionStats(userId, boardId);
      if (!stats) {
        throw new AppErrorClass('PixelBoard non trouvé', 404);
      }
      return stats;
    } catch (error: any) {
      if (error instanceof AppErrorClass) {
        throw error;
      }
      if (error.message === 'Utilisateur non trouvé') {
        throw new AppErrorClass('Utilisateur non trouvé', 404);
      }
      throw new AppErrorClass(`Erreur lors de la récupération des statistiques de contribution: ${error.message}`, 500);
    }
  }
}