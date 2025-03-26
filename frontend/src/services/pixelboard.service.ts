import apiClient from './api.client';
import { PixelBoard } from '@/types';

const PixelBoardService = {
  // Récupérer tous les PixelBoards
  getAllBoards: async () => {
    return apiClient.get<PixelBoard[]>('/pixelboards');
  },

  // Récupérer un PixelBoard par ID
  getBoardById: async (id: string) => {
    return apiClient.get<PixelBoard>(`/pixelboards/${id}`);
  },

  // Créer un nouveau PixelBoard
  createBoard: async (boardData: Omit<PixelBoard, 'id' | 'created_at' | 'is_active' | 'grid' | 'admin_id'>) => {
    return apiClient.post<PixelBoard>('/pixelboards', boardData);
  },

  // Mettre à jour un PixelBoard existant
  updateBoard: async (id: string, boardData: Partial<PixelBoard>) => {
    return apiClient.put<PixelBoard>(`/pixelboards/${id}`, boardData);
  },

  // Supprimer un PixelBoard
  deleteBoard: async (id: string) => {
    return apiClient.delete<void>(`/pixelboards/${id}`);
  },

  // Placer un pixel sur le tableau
  placePixel: async (boardId: string, x: number, y: number, color: string): Promise<any> => {
    return apiClient.post(`/pixelboards/${boardId}/pixel`, { x, y, color });
  },

  // Vérifier le statut du cooldown
  checkCooldown: async (boardId: string) => {
    return apiClient.get(`/pixelboards/${boardId}/cooldown`);
  },

  // Récupérer les données pour le SuperPixelBoard
  getSuperPixelBoardData: async () => {
    try {
      // Puisque la route /pixelboards/all n'existe pas encore, nous allons utiliser une combinaison
      // des routes existantes pour obtenir tous les tableaux
      const [activeResponse, completedResponse] = await Promise.all([
        apiClient.get<PixelBoard[]>('/pixelboards/active'),
        apiClient.get<PixelBoard[]>('/pixelboards/completed')
      ]);

      if (activeResponse.error && completedResponse.error) {
        return { error: activeResponse.error || completedResponse.error };
      }

      // Combiner les tableaux actifs et terminés
      const allBoards = [
        ...(activeResponse.data || []),
        ...(completedResponse.data || [])
      ];

      // Si aucune donnée n'est retournée
      if (allBoards.length === 0) {
        return { data: { boards: [], dimensions: { width: 100, height: 100 } } };
      }

      // Calculer les dimensions maximales
      const maxWidth = Math.max(...allBoards.map(board => board.width), 100);
      const maxHeight = Math.max(...allBoards.map(board => board.height), 100);

      return {
        data: {
          boards: allBoards,
          dimensions: {
            width: maxWidth,
            height: maxHeight
          }
        }
      };
    } catch (error: any) {
      return { error: error.message || 'Erreur lors de la récupération des données' };
    }
  },
};

export default PixelBoardService;
