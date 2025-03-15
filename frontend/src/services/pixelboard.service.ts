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
  }
};

export default PixelBoardService;
