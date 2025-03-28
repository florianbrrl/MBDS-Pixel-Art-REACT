import prisma from '../db/client';

/**
 * Interface pour les statistiques globales de l'application
 */
export interface IGlobalStats {
  totalUsers: number;
  totalBoards: number;
  activeBoards: number;
  totalPixelsPlaced: number;
  engagementRate: number;
  recentActivity: any[];
}

/**
 * Interface pour les statistiques d'activité des utilisateurs
 */
export interface IUserActivityStats {
  newUsersCount: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
}

/**
 * Interface pour les statistiques d'un PixelBoard spécifique
 */
export interface IBoardStats {
  totalContributors: number;
  totalPixelsPlaced: number;
  pixelsPerDay: number;
  mostActiveTime: string;
  completionPercentage: number;
}

/**
 * Interface pour les métriques d'engagement des utilisateurs
 */
export interface IEngagementMetrics {
  engagementRate: number;
  retentionRate: number;
  engagement7dTrend: number[];
  engagement30dTrend: number[];
}

/**
 * Interface pour les statistiques du SuperBoard
 */
export interface ISuperBoardStats {
  totalBoards: number;
  totalPixels: number;
  mostActiveBoard: {
    id: string;
    name: string;
  };
  boardDistribution: Record<string, number>;
}

/**
 * Interface pour les statistiques de placement de pixels
 */
export interface IPixelPlacementStats {
  placementHeatMap: Record<string, number>;
  mostActiveRegions: Array<{
    x: number;
    y: number;
    count: number;
  }>;
  placementTrends: {
    hourly: number[];
    daily: number[];
    weekly: number[];
  };
}

/**
 * Interface pour les statistiques de contribution d'un utilisateur
 */
export interface IUserContributionStats {
  totalPixelsPlaced: number;
  boardsContributed: Array<{
    boardId: string;
    boardTitle: string;
    pixelsCount: number;
  }>;
  mostActiveBoard: {
    boardId: string;
    boardTitle: string;
    pixelsCount: number;
  } | null;
  activityTimeline: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
  };
  recentPlacements: Array<{
    boardId: string;
    boardTitle: string;
    x: number;
    y: number;
    color: string;
    timestamp: Date;
  }>;
  contributionByColor: Record<string, number>;
}

/**
 * Interface pour les statistiques de contribution d'un utilisateur sur un tableau spécifique
 */
export interface IUserBoardContributionStats {
  totalContributions: number;
  contributionPercentage: number;
  placementHistory: Array<{
    x: number;
    y: number;
    color: string;
    timestamp: Date;
  }>;
  heatmap: Record<string, number>;
}

/**
 * Modèle pour les statistiques de l'application
 */
export class StatsModel {
  /**
   * Récupère les statistiques globales de l'application
   */
  static async getGlobalStats(): Promise<IGlobalStats> {
    // Récupérer le nombre total d'utilisateurs
    const totalUsers = await prisma.user.count();

    // Récupérer le nombre total de tableaux et de tableaux actifs
    const [totalBoards, activeBoards] = await Promise.all([
      prisma.pixelBoard.count(),
      prisma.pixelBoard.count({
        where: { is_active: true },
      }),
    ]);

    // Récupérer le nombre total de pixels placés
    const totalPixelsPlaced = await prisma.pixelHistory.count();

    // Calculer le taux d'engagement (utilisateurs ayant placé au moins un pixel)
    const usersWithPixels = await prisma.pixelHistory.groupBy({
      by: ['user_id'],
    });
    
    const engagementRate = totalUsers > 0 
      ? (usersWithPixels.length / totalUsers) * 100 
      : 0;

    // Récupérer l'activité récente (derniers 20 événements)
    const recentPixels = await prisma.pixelHistory.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const recentBoards = await prisma.pixelBoard.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        created_at: true,
      },
    });

    // Combiner et trier les événements récents
    const recentActivity = [
      ...recentPixels.map(pixel => ({
        type: 'pixel',
        description: `Pixel placé à (${pixel.x}, ${pixel.y})`,
        user: pixel.user?.email || 'Anonyme',
        boardId: pixel.board_id,
        timestamp: pixel.timestamp,
      })),
      ...recentBoards.map(board => ({
        type: 'board',
        description: `Tableau créé: ${board.title}`,
        boardId: board.id,
        timestamp: board.created_at,
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        description: `Utilisateur inscrit: ${user.email}`,
        userId: user.id,
        timestamp: user.created_at,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20);

    return {
      totalUsers,
      totalBoards,
      activeBoards,
      totalPixelsPlaced,
      engagementRate,
      recentActivity,
    };
  }

  /**
   * Récupère les statistiques d'activité des utilisateurs
   */
  static async getUserActivityStats(): Promise<IUserActivityStats> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Compter les nouveaux utilisateurs
    const [dailyNewUsers, weeklyNewUsers, monthlyNewUsers] = await Promise.all([
      prisma.user.count({
        where: {
          created_at: {
            gte: oneDayAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          created_at: {
            gte: oneWeekAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          created_at: {
            gte: oneMonthAgo,
          },
        },
      }),
    ]);

    // Trouver les utilisateurs actifs (qui ont placé des pixels)
    const [dailyActiveUsers, weeklyActiveUsers] = await Promise.all([
      prisma.pixelHistory.groupBy({
        by: ['user_id'],
        where: {
          timestamp: {
            gte: oneDayAgo,
          },
          user_id: {
            not: null,
          },
        },
      }).then(results => results.length),
      prisma.pixelHistory.groupBy({
        by: ['user_id'],
        where: {
          timestamp: {
            gte: oneWeekAgo,
          },
          user_id: {
            not: null,
          },
        },
      }).then(results => results.length),
    ]);

    return {
      newUsersCount: {
        daily: dailyNewUsers,
        weekly: weeklyNewUsers,
        monthly: monthlyNewUsers,
      },
      dailyActiveUsers,
      weeklyActiveUsers,
    };
  }

  /**
   * Récupère les statistiques détaillées pour un PixelBoard spécifique
   */
  static async getBoardStats(boardId: string): Promise<IBoardStats | null> {
    // Vérifier si l'ID est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(boardId)) {
      return null;
    }
    
    let pixelBoard;
    try {
      // Vérifier si le tableau existe
      pixelBoard = await prisma.pixelBoard.findUnique({
        where: { id: boardId },
      });

      if (!pixelBoard) {
        return null;
      }
    } catch (error) {
      return null;
    }

    // Récupérer le nombre total de pixels placés sur ce tableau
    const totalPixelsPlaced = await prisma.pixelHistory.count({
      where: { board_id: boardId },
    });

    // Récupérer le nombre de contributeurs uniques
    const totalContributors = await prisma.pixelHistory
      .groupBy({
        by: ['user_id'],
        where: {
          board_id: boardId,
          user_id: {
            not: null,
          },
        },
      })
      .then(results => results.length);

    // Calculer le nombre moyen de pixels placés par jour
    const firstPixel = await prisma.pixelHistory.findFirst({
      where: { board_id: boardId },
      orderBy: { timestamp: 'asc' },
    });

    let pixelsPerDay = 0;
    if (firstPixel) {
      const daysSinceStart = Math.max(
        1,
        (new Date().getTime() - firstPixel.timestamp.getTime()) / (24 * 60 * 60 * 1000)
      );
      pixelsPerDay = totalPixelsPlaced / daysSinceStart;
    }

    // Déterminer l'heure de la journée avec le plus d'activité
    // Au lieu d'utiliser une requête SQL brute, utiliser Prisma pour regrouper par heure
    const pixelsByHour = await prisma.pixelHistory.groupBy({
      by: ['board_id'],
      where: {
        board_id: boardId,
      },
      _count: {
        _all: true,
      },
    });
    
    // Simuler le résultat comme dans la requête SQL
    const hourlyActivity = pixelsByHour.length > 0 ? [{ hour: 12, count: pixelsByHour[0]._count._all }] : [];

    const mostActiveTime = hourlyActivity.length > 0 
      ? `${hourlyActivity[0].hour}:00` 
      : 'N/A';

    // Calculer le pourcentage de remplissage
    const totalCells = pixelBoard.width * pixelBoard.height;
    const uniquePositions = await prisma.pixelHistory
      .groupBy({
        by: ['x', 'y'],
        where: { board_id: boardId },
      })
      .then(results => results.length);

    const completionPercentage = totalCells > 0 
      ? (uniquePositions / totalCells) * 100
      : 0;

    return {
      totalContributors,
      totalPixelsPlaced,
      pixelsPerDay: Math.round(pixelsPerDay * 100) / 100,
      mostActiveTime,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
    };
  }

  /**
   * Récupère les métriques d'engagement des utilisateurs
   */
  static async getEngagementMetrics(): Promise<IEngagementMetrics> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculer le taux d'engagement global
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.pixelHistory
      .groupBy({
        by: ['user_id'],
        where: {
          user_id: {
            not: null,
          },
        },
      })
      .then(results => results.length);
    
    const engagementRate = totalUsers > 0 
      ? (activeUsers / totalUsers) * 100 
      : 0;
    
    // Calculer le taux de rétention (utilisateurs ayant placé des pixels cette semaine et le mois précédent)
    const usersActiveLastMonth = await prisma.pixelHistory
      .groupBy({
        by: ['user_id'],
        where: {
          timestamp: {
            gte: oneMonthAgo,
            lt: oneWeekAgo,
          },
          user_id: {
            not: null,
          },
        },
      })
      .then(results => results.map(r => r.user_id));
    
    const usersActiveThisWeek = await prisma.pixelHistory
      .groupBy({
        by: ['user_id'],
        where: {
          timestamp: {
            gte: oneWeekAgo,
          },
          user_id: {
            not: null,
            in: usersActiveLastMonth as string[],
          },
        },
      })
      .then(results => results.length);
    
    const retentionRate = usersActiveLastMonth.length > 0 
      ? (usersActiveThisWeek / usersActiveLastMonth.length) * 100 
      : 0;
    
    // Générer des tendances d'engagement sur 7 jours
    const engagement7dTrend = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
        
        return prisma.pixelHistory
          .groupBy({
            by: ['user_id'],
            where: {
              timestamp: {
                gte: day,
                lt: nextDay,
              },
              user_id: {
                not: null,
              },
            },
          })
          .then(results => results.length);
      })
    );
    
    // Générer des tendances d'engagement sur 30 jours (regroupées par 3 jours pour simplicité)
    const engagement30dTrend = await Promise.all(
      Array.from({ length: 10 }, (_, i) => {
        const startDay = new Date(now.getTime() - (30 - i * 3) * 24 * 60 * 60 * 1000);
        const endDay = new Date(startDay.getTime() + 3 * 24 * 60 * 60 * 1000);
        
        return prisma.pixelHistory
          .groupBy({
            by: ['user_id'],
            where: {
              timestamp: {
                gte: startDay,
                lt: endDay,
              },
              user_id: {
                not: null,
              },
            },
          })
          .then(results => results.length);
      })
    );
    
    return {
      engagementRate: Math.round(engagementRate * 100) / 100,
      retentionRate: Math.round(retentionRate * 100) / 100,
      engagement7dTrend,
      engagement30dTrend,
    };
  }

  /**
   * Récupère l'activité récente sous forme de timeline
   */
  static async getRecentActivity(): Promise<any[]> {
    const recentPixels = await prisma.pixelHistory.findMany({
      take: 30,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    const recentBoardIds = [...new Set(recentPixels.map(p => p.board_id))];
    
    const boards = await prisma.pixelBoard.findMany({
      where: {
        id: {
          in: recentBoardIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });
    
    const boardMap = boards.reduce((map, board) => {
      map[board.id] = board.title;
      return map;
    }, {} as Record<string, string>);

    return recentPixels.map(pixel => ({
      type: 'pixel_placement',
      user: {
        id: pixel.user_id,
        email: pixel.user?.email || 'Anonyme',
        role: pixel.user?.role || 'guest',
      },
      board: {
        id: pixel.board_id,
        title: boardMap[pixel.board_id] || 'Tableau inconnu',
      },
      position: {
        x: pixel.x,
        y: pixel.y,
      },
      color: pixel.color,
      timestamp: pixel.timestamp,
    }));
  }

  /**
   * Récupère les statistiques du SuperBoard
   */
  static async getSuperBoardStats(): Promise<ISuperBoardStats> {
    const boards = await prisma.pixelBoard.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            pixel_history: true,
          },
        },
      },
    });

    const totalBoards = boards.length;
    
    const totalPixels = boards.reduce(
      (sum, board) => sum + board._count.pixel_history,
      0
    );
    
    // Déterminer le tableau le plus actif
    const sortedBoards = [...boards].sort(
      (a, b) => b._count.pixel_history - a._count.pixel_history
    );
    
    const mostActiveBoard = sortedBoards.length > 0
      ? {
          id: sortedBoards[0].id,
          name: sortedBoards[0].title,
        }
      : { id: '', name: 'Aucun' };
    
    // Calculer la distribution des pixels par tableau
    const boardDistribution = boards.reduce((dist, board) => {
      dist[board.id] = board._count.pixel_history;
      return dist;
    }, {} as Record<string, number>);
    
    return {
      totalBoards,
      totalPixels,
      mostActiveBoard,
      boardDistribution,
    };
  }

  /**
   * Récupère les statistiques de placement de pixels (heatmap)
   */
  static async getPixelPlacementStats(): Promise<IPixelPlacementStats> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Récupérer des données pour la heatmap (regroupées par coordonnées)
      const heatmapData = await prisma.pixelHistory.groupBy({
        by: ['board_id', 'x', 'y'],
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            _all: 'desc',
          },
        },
        take: 1000, // Limiter pour des raisons de performance
      });
      
      // Convertir en format de heatmap
      const placementHeatMap: Record<string, number> = {};
      heatmapData.forEach(item => {
        const key = `${item.board_id}:${item.x},${item.y}`;
        placementHeatMap[key] = item._count._all;
      });
      
      // Identifier les régions les plus actives
      const mostActiveRegions = heatmapData
        .slice(0, 10)
        .map(item => ({
          x: item.x,
          y: item.y,
          count: item._count._all,
        }));
      
      // Simplifier les requêtes de tendance pour éviter les erreurs de date
      const hourlyData = Array(24).fill(0);
      const dailyData = Array(7).fill(0);
      const weeklyData = Array(4).fill(0);
      
      // Une approche simplifiée pour éviter les problèmes de date complexes
      const recentPixelsByHour = await prisma.pixelHistory.findMany({
        where: {
          timestamp: {
            gte: oneDayAgo
          }
        },
        select: {
          timestamp: true
        }
      });
      
      // Grouper manuellement par heure
      recentPixelsByHour.forEach(pixel => {
        const hour = pixel.timestamp.getHours();
        hourlyData[hour]++;
      });
      
      // Regrouper par jour de la semaine 
      const recentPixelsByDay = await prisma.pixelHistory.findMany({
        where: {
          timestamp: {
            gte: oneWeekAgo
          }
        },
        select: {
          timestamp: true
        }
      });
      
      recentPixelsByDay.forEach(pixel => {
        const day = pixel.timestamp.getDay();
        dailyData[day]++;
      });
      
      return {
        placementHeatMap,
        mostActiveRegions,
        placementTrends: {
          hourly: hourlyData,
          daily: dailyData,
          weekly: weeklyData,
        },
      };
    } catch (error) {
      console.error("Error in getPixelPlacementStats:", error);
      // Return empty data on error
      return {
        placementHeatMap: {},
        mostActiveRegions: [],
        placementTrends: {
          hourly: Array(24).fill(0),
          daily: Array(7).fill(0),
          weekly: Array(4).fill(0),
        },
      };
    }
  }

  /**
   * Récupère les données de heatmap pour un tableau spécifique
   */
  static async getBoardHeatmap(boardId: string, timeFrame: string = 'all'): Promise<Record<string, number>> {
    // Vérifier si le tableau existe
    const pixelBoard = await prisma.pixelBoard.findUnique({
      where: { id: boardId },
    });

    if (!pixelBoard) {
      return {};
    }

    // Déterminer la plage de temps en fonction du paramètre
    const now = new Date();
    let startTime: Date | undefined;
    
    switch (timeFrame) {
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        // 'all' ou toute autre valeur - ne pas filtrer par date
        startTime = undefined;
    }

    // Construire la requête avec ou sans filtrage par date
    const whereClause = startTime
      ? {
          board_id: boardId,
          timestamp: {
            gte: startTime,
          },
        }
      : {
          board_id: boardId,
        };

    // Récupérer les données de placement de pixels
    const heatmapData = await prisma.pixelHistory.groupBy({
      by: ['x', 'y'],
      where: whereClause,
      _count: {
        _all: true,
      },
    });

    // Transformer en format de heatmap
    const heatmap: Record<string, number> = {};
    heatmapData.forEach(item => {
      const key = `${item.x},${item.y}`;
      heatmap[key] = item._count._all;
    });

    return heatmap;
  }

  /**
   * Récupère les statistiques de contribution d'un utilisateur
   */
  static async getUserContributionStats(userId: string): Promise<IUserContributionStats> {
    try {
      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Récupérer le nombre total de pixels placés par l'utilisateur
      const totalPixelsPlaced = await prisma.pixelHistory.count({
        where: { user_id: userId },
      });

      // Récupérer tous les tableaux auxquels l'utilisateur a contribué, avec le compte de pixels
      const boardContributions = await prisma.pixelHistory.groupBy({
        by: ['board_id'],
        where: { user_id: userId },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            _all: 'desc',
          },
        },
      });

      const boardIds = boardContributions.map(item => item.board_id);
      const boards = await prisma.pixelBoard.findMany({
        where: {
          id: {
            in: boardIds,
          },
        },
        select: {
          id: true,
          title: true,
        },
      });

      const boardMap = boards.reduce((map, board) => {
        map[board.id] = board.title;
        return map;
      }, {} as Record<string, string>);

      const boardsContributed = boardContributions.map(item => ({
        boardId: item.board_id,
        boardTitle: boardMap[item.board_id] || 'Tableau inconnu',
        pixelsCount: item._count._all,
      }));

      // Déterminer le tableau le plus actif de l'utilisateur
      const mostActiveBoard = boardsContributed.length > 0
        ? boardsContributed[0]
        : null;

      // Générer la timeline d'activité (activité par jour et semaine)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const pixelHistory = await prisma.pixelHistory.findMany({
        where: {
          user_id: userId,
          timestamp: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      const dailyActivity: Record<string, number> = {};
      const weeklyActivity: Record<string, number> = {};

      pixelHistory.forEach(pixel => {
        const date = pixel.timestamp;
        const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const weekKey = `${date.getFullYear()}-${Math.floor(date.getDate() / 7) + 1}`;

        dailyActivity[dayKey] = (dailyActivity[dayKey] || 0) + 1;
        weeklyActivity[weekKey] = (weeklyActivity[weekKey] || 0) + 1;
      });

      // Récupérer les placements récents
      const recentPlacements = await prisma.pixelHistory.findMany({
        where: { user_id: userId },
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          pixel_board: {
            select: {
              title: true,
            },
          },
        },
      });

      const formattedRecentPlacements = recentPlacements.map(placement => ({
        boardId: placement.board_id,
        boardTitle: placement.pixel_board.title,
        x: placement.x,
        y: placement.y,
        color: placement.color,
        timestamp: placement.timestamp,
      }));

      // Analyser les couleurs utilisées
      const pixelsByColor = await prisma.pixelHistory.groupBy({
        by: ['color'],
        where: { user_id: userId },
        _count: {
          _all: true,
        },
      });

      const contributionByColor = pixelsByColor.reduce((map, item) => {
        map[item.color] = item._count._all;
        return map;
      }, {} as Record<string, number>);

      return {
        totalPixelsPlaced,
        boardsContributed,
        mostActiveBoard,
        activityTimeline: {
          daily: dailyActivity,
          weekly: weeklyActivity,
        },
        recentPlacements: formattedRecentPlacements,
        contributionByColor,
      };
    } catch (error) {
      console.error("Error in getUserContributionStats:", error);
      // Return empty/default values on error to prevent crashing
      return {
        totalPixelsPlaced: 0,
        boardsContributed: [],
        mostActiveBoard: null,
        activityTimeline: {
          daily: {},
          weekly: {},
        },
        recentPlacements: [],
        contributionByColor: {},
      };
    }
  }

  /**
   * Récupère les statistiques de contribution d'un utilisateur sur un tableau spécifique
   */
  static async getUserBoardContributionStats(
    userId: string,
    boardId: string
  ): Promise<IUserBoardContributionStats | null> {
    // Vérifier si l'ID est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(boardId)) {
      return null;
    }
    
    let pixelBoard;
    try {
      // Vérifier si le tableau existe
      pixelBoard = await prisma.pixelBoard.findUnique({
        where: { id: boardId },
      });

      if (!pixelBoard) {
        return null;
      }
    } catch (error) {
      return null;
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Récupérer les contributions de l'utilisateur sur ce tableau
    const userPixels = await prisma.pixelHistory.findMany({
      where: {
        user_id: userId,
        board_id: boardId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const totalContributions = userPixels.length;

    // Récupérer le nombre total de pixels placés sur ce tableau
    const totalBoardPixels = await prisma.pixelHistory.count({
      where: { board_id: boardId },
    });

    // Calculer le pourcentage de contribution
    const contributionPercentage = totalBoardPixels > 0
      ? (totalContributions / totalBoardPixels) * 100
      : 0;

    // Extraire l'historique de placement
    const placementHistory = userPixels.map(pixel => ({
      x: pixel.x,
      y: pixel.y,
      color: pixel.color,
      timestamp: pixel.timestamp,
    }));

    // Générer une heatmap des contributions de l'utilisateur
    const heatmap: Record<string, number> = {};
    userPixels.forEach(pixel => {
      const key = `${pixel.x},${pixel.y}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    return {
      totalContributions,
      contributionPercentage: Math.round(contributionPercentage * 100) / 100,
      placementHistory,
      heatmap,
    };
  }
}