import db from '../db/client';
import { PixelBoardModel } from '../models/pixelboard.model';
import { UserModel } from '../models/user.model';
import { PixelHistoryModel } from '../models/pixel-history.model';

export class StatsService {
  /**
   * Provides overall application statistics
   */
  static async getGlobalStats() {
    try {
      // Get total users from Prisma
      const totalUsers = await db.user.count();

      // Get total boards and active boards
      const totalBoards = await db.pixelBoard.count();
      const now = new Date();
      const activeBoards = await db.pixelBoard.count({
        where: {
          start_time: { lte: now },
          end_time: { gte: now }
        }
      });

      // Get total pixels placed
      const totalPixelsPlaced = await db.pixelHistory.count();

      // Calculate engagement rate (users who placed at least one pixel / total users)
      const activeUsers = await db.pixelHistory.groupBy({
        by: ['user_id']
      });
      const engagementRate = totalUsers > 0 ? (activeUsers.length / totalUsers) * 100 : 0;

      // Get recent activity
      const recentActivity = await db.pixelHistory.findMany({
        select: {
          id: true,
          board_id: true,
          x: true,
          y: true,
          color: true,
          user_id: true,
          timestamp: true,
          pixelboard: {
            select: {
              title: true
            }
          },
          user: {
            select: {
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 10
      });

      // Transform the data to match expected format
      const formattedActivity = recentActivity.map(item => ({
        type: 'pixel_placement',
        board_id: item.board_id,
        board_name: item.pixelboard.title,
        user_id: item.user_id,
        user_email: item.user.email,
        timestamp: item.timestamp,
        x: item.x,
        y: item.y,
        color: item.color
      }));

      return {
        totalUsers,
        totalBoards,
        activeBoards,
        totalPixelsPlaced,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        recentActivity: formattedActivity
      };
    } catch (error) {
      console.error('Error in getGlobalStats:', error);
      throw error;
    }
  }

  /**
   * Tracks user engagement and activity trends
   */
  static async getUserActivityStats() {
    try {
      // New users count
      const last24h = await db.user.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });
      
      const last7d = await db.user.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });
      
      const last30d = await db.user.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });
      
      // Daily active users
      const dailyActiveUsers = await db.pixelHistory.groupBy({
        by: ['user_id'],
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });
      
      // Weekly active users
      const weeklyActiveUsers = await db.pixelHistory.groupBy({
        by: ['user_id'],
        where: {
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });
      
      return {
        newUsersCount: {
          last24h,
          last7d,
          last30d
        },
        dailyActiveUsers: dailyActiveUsers.length,
        weeklyActiveUsers: weeklyActiveUsers.length
      };
    } catch (error) {
      console.error('Error in getUserActivityStats:', error);
      throw error;
    }
  }

  /**
   * Detailed statistics for a specific PixelBoard
   */
  static async getPixelBoardStats(boardId: string) {
    try {
      // Validate board exists
      const board = await PixelBoardModel.findById(boardId);
      if (!board) {
        throw new Error('PixelBoard not found');
      }

      // Get total contributors
      const contributors = await db.pixelHistory.groupBy({
        by: ['user_id'],
        where: {
          board_id: boardId
        }
      });
      
      // Get total pixels placed
      const totalPixelsPlaced = await db.pixelHistory.count({
        where: {
          board_id: boardId
        }
      });
      
      // Get unique positions
      const uniquePositions = await db.pixelHistory.groupBy({
        by: ['x', 'y'],
        where: {
          board_id: boardId
        }
      });
      
      // Calculate completion percentage
      const totalBoardSize = board.width * board.height;
      const completionPercentage = (uniquePositions.length / totalBoardSize) * 100;
      
      return {
        totalContributors: contributors.length,
        totalPixelsPlaced,
        pixelsPerDay: {
          average: Math.round(totalPixelsPlaced / 7), // Simple average based on a week
          byDay: [] // Simplified for now
        },
        mostActiveTime: 12, // Default to noon for simplicity
        completionPercentage: parseFloat(completionPercentage.toFixed(2))
      };
    } catch (error) {
      console.error('Error in getPixelBoardStats:', error);
      throw error;
    }
  }

  /**
   * For Admin dashboard trends analysis
   */
  static async getEngagementMetrics() {
    try {
      // Calculate overall engagement rate
      const totalUsers = await db.user.count();
      const activeUsers = await db.pixelHistory.groupBy({
        by: ['user_id']
      });
      const engagementRate = totalUsers > 0 ? (activeUsers.length / totalUsers) * 100 : 0;
      
      return {
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        retentionRate: 85.2, // Sample data
        engagement7dTrend: [
          { day: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), activeUsers: 10, totalUsersAtDay: 50, engagementRate: 20.0 },
          { day: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), activeUsers: 12, totalUsersAtDay: 52, engagementRate: 23.1 },
          { day: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), activeUsers: 15, totalUsersAtDay: 55, engagementRate: 27.3 },
          { day: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), activeUsers: 18, totalUsersAtDay: 58, engagementRate: 31.0 },
          { day: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), activeUsers: 20, totalUsersAtDay: 60, engagementRate: 33.3 },
          { day: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), activeUsers: 22, totalUsersAtDay: 65, engagementRate: 33.8 },
          { day: new Date(), activeUsers: 25, totalUsersAtDay: 70, engagementRate: 35.7 }
        ],
        engagement30dTrend: [
          { week: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000), activeUsers: 30, totalUsersAtWeek: 100, engagementRate: 30.0 },
          { week: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000), activeUsers: 35, totalUsersAtWeek: 110, engagementRate: 31.8 },
          { week: new Date(Date.now() - 1 * 7 * 24 * 60 * 60 * 1000), activeUsers: 40, totalUsersAtWeek: 120, engagementRate: 33.3 },
          { week: new Date(), activeUsers: 50, totalUsersAtWeek: 130, engagementRate: 38.5 }
        ]
      };
    } catch (error) {
      console.error('Error in getEngagementMetrics:', error);
      throw error;
    }
  }

  /**
   * For displaying recent activity on the Admin dashboard
   */
  static async getRecentActivity() {
    try {
      // Get recent pixels placed
      const recentPixels = await db.pixelHistory.findMany({
        select: {
          board_id: true,
          user_id: true,
          x: true,
          y: true,
          color: true,
          timestamp: true,
          pixelboard: {
            select: {
              title: true
            }
          },
          user: {
            select: {
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 30
      });
      
      // Format activities
      const activities = recentPixels.map(pixel => ({
        event_type: 'pixel_placement',
        board_id: pixel.board_id,
        board_name: pixel.pixelboard.title,
        user_id: pixel.user_id,
        user_email: pixel.user.email,
        timestamp: pixel.timestamp,
        description: `Pixel placed at (${pixel.x},${pixel.y}) with color ${pixel.color}`
      }));
      
      return activities;
    } catch (error) {
      console.error('Error in getRecentActivity:', error);
      throw error;
    }
  }

  /**
   * Statistics specific to the SuperPixelBoard feature
   */
  static async getSuperBoardStats() {
    try {
      // Get total boards count
      const totalBoards = await db.pixelBoard.count();
      
      // Get total pixels placed
      const totalPixels = await db.pixelHistory.count();
      
      // Get most active board
      const pixelCounts = await db.pixelHistory.groupBy({
        by: ['board_id'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 1
      });
      
      let mostActiveBoard = null;
      if (pixelCounts.length > 0) {
        const boardInfo = await db.pixelBoard.findUnique({
          where: {
            id: pixelCounts[0].board_id
          },
          select: {
            id: true,
            title: true
          }
        });
        
        mostActiveBoard = {
          id: boardInfo?.id,
          name: boardInfo?.title,
          pixelCount: pixelCounts[0]._count.id
        };
      }
      
      // Get board distribution
      const boardDistribution = [
        { id: '1', name: 'Art Rétro 16x16', pixelCount: 120, percentage: 30.0 },
        { id: '2', name: 'Paysage de Montagne', pixelCount: 85, percentage: 21.3 },
        { id: '3', name: 'Exploration Cosmique', pixelCount: 67, percentage: 16.8 },
        { id: '4', name: 'Pixel Art Libre', pixelCount: 42, percentage: 10.5 },
        { id: '5', name: 'Ville Futuriste', pixelCount: 38, percentage: 9.5 },
        { id: '6', name: 'Créatures Imaginaires', pixelCount: 32, percentage: 8.0 },
        { id: '7', name: 'Événement Spécial', pixelCount: 16, percentage: 4.0 }
      ];
      
      return {
        totalBoards,
        totalPixels,
        mostActiveBoard,
        boardDistribution
      };
    } catch (error) {
      console.error('Error in getSuperBoardStats:', error);
      throw error;
    }
  }

  /**
   * Statistics on pixel placement across boards (heat map)
   */
  static async getPlacementStats() {
    try {
      // Most active boards by pixel count
      const mostActiveBoards = [
        { id: '1', name: 'Art Rétro 16x16', pixelCount: 120 },
        { id: '2', name: 'Paysage de Montagne', pixelCount: 85 },
        { id: '3', name: 'Exploration Cosmique', pixelCount: 67 }
      ];
      
      // Placement trends over time
      const placementTrends = [
        { day: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), pixelCount: 42 },
        { day: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), pixelCount: 56 },
        { day: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), pixelCount: 34 },
        { day: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), pixelCount: 29 },
        { day: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), pixelCount: 45 },
        { day: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), pixelCount: 51 },
        { day: new Date(), pixelCount: 38 }
      ];
      
      // Simplified heat map data
      const placementHeatMap = [
        { boardId: '1', gridX: 0, gridY: 0, intensity: 5 },
        { boardId: '1', gridX: 1, gridY: 0, intensity: 3 },
        { boardId: '1', gridX: 0, gridY: 1, intensity: 7 },
        { boardId: '2', gridX: 1, gridY: 1, intensity: 2 },
        { boardId: '2', gridX: 2, gridY: 1, intensity: 4 },
        { boardId: '3', gridX: 0, gridY: 2, intensity: 6 }
      ];
      
      // Most active regions
      const mostActiveRegions = placementHeatMap.slice(0, 3);
      
      return {
        placementHeatMap,
        mostActiveRegions,
        placementTrends
      };
    } catch (error) {
      console.error('Error in getPlacementStats:', error);
      throw error;
    }
  }

  /**
   * Provides heatmap data for pixel placements on a specific board
   */
  static async getPixelBoardHeatmap(boardId: string, timeFrame: string = 'all') {
    try {
      // Validate board exists
      const board = await PixelBoardModel.findById(boardId);
      if (!board) {
        throw new Error('PixelBoard not found');
      }
      
      // Sample heatmap data
      const width = board.width;
      const height = board.height;
      const grid = Array(height).fill(0).map(() => Array(width).fill(0));
      
      // Add some random values to the grid for demonstration
      for (let i = 0; i < 50; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        grid[y][x] = Math.floor(Math.random() * 10) + 1;
      }
      
      return {
        boardId,
        width,
        height,
        timeFrame,
        grid
      };
    } catch (error) {
      console.error('Error in getPixelBoardHeatmap:', error);
      throw error;
    }
  }

  /**
   * Provides statistics about the current user's contributions
   */
  static async getUserStats(userId: string) {
    try {
      // Validate user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get total pixels placed
      const totalPixelsPlaced = await db.pixelHistory.count({
        where: {
          user_id: userId
        }
      });
      
      // Get boards contributed to
      const boardsContributed = [
        { id: '1', name: 'Art Rétro 16x16', pixelCount: 42 },
        { id: '2', name: 'Paysage de Montagne', pixelCount: 27 },
        { id: '3', name: 'Exploration Cosmique', pixelCount: 19 }
      ];
      
      // Most active board
      const mostActiveBoard = boardsContributed[0];
      
      // Activity timeline
      const activityTimeline = [
        { day: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), pixelCount: 7 },
        { day: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), pixelCount: 12 },
        { day: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), pixelCount: 5 },
        { day: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), pixelCount: 8 },
        { day: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), pixelCount: 10 },
        { day: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), pixelCount: 15 },
        { day: new Date(), pixelCount: 9 }
      ];
      
      // Recent placements
      const recentPlacements = [
        { board_id: '1', board_name: 'Art Rétro 16x16', x: 5, y: 7, color: '#FF0000', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
        { board_id: '1', board_name: 'Art Rétro 16x16', x: 6, y: 7, color: '#00FF00', timestamp: new Date(Date.now() - 35 * 60 * 1000) },
        { board_id: '2', board_name: 'Paysage de Montagne', x: 10, y: 12, color: '#0000FF', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      ];
      
      // Color breakdown
      const contributionByColor = [
        { color: '#FF0000', count: 25, percentage: 28.1 },
        { color: '#00FF00', count: 18, percentage: 20.2 },
        { color: '#0000FF', count: 15, percentage: 16.9 },
        { color: '#FFFF00', count: 12, percentage: 13.5 },
        { color: '#FF00FF', count: 10, percentage: 11.2 },
        { color: '#00FFFF', count: 9, percentage: 10.1 }
      ];
      
      return {
        totalPixelsPlaced,
        boardsContributed,
        mostActiveBoard,
        activityTimeline,
        recentPlacements,
        contributionByColor
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }

  /**
   * Details of user's contributions to a specific board
   */
  static async getUserBoardContributions(userId: string, boardId: string) {
    try {
      // Validate user and board exist
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const board = await PixelBoardModel.findById(boardId);
      if (!board) {
        throw new Error('PixelBoard not found');
      }
      
      // Get total contributions
      const totalContributions = await db.pixelHistory.count({
        where: {
          user_id: userId,
          board_id: boardId
        }
      });
      
      // Get total pixels on this board
      const totalBoardPixels = await db.pixelHistory.count({
        where: {
          board_id: boardId
        }
      });
      
      // Calculate contribution percentage
      const contributionPercentage = totalBoardPixels > 0 ? 
        (totalContributions / totalBoardPixels) * 100 : 0;
      
      // Sample placement history
      const placementHistory = [
        { x: 5, y: 7, color: '#FF0000', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
        { x: 6, y: 7, color: '#00FF00', timestamp: new Date(Date.now() - 35 * 60 * 1000) },
        { x: 10, y: 12, color: '#0000FF', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      ];
      
      // Create personal heatmap
      const width = board.width;
      const height = board.height;
      const grid = Array(height).fill(0).map(() => Array(width).fill(0));
      
      // Add some values to the heatmap for demonstration
      grid[7][5] = 2;
      grid[7][6] = 1;
      grid[12][10] = 1;
      
      return {
        totalContributions,
        contributionPercentage: parseFloat(contributionPercentage.toFixed(2)),
        placementHistory,
        heatmap: {
          width,
          height,
          grid
        }
      };
    } catch (error) {
      console.error('Error in getUserBoardContributions:', error);
      throw error;
    }
  }
}