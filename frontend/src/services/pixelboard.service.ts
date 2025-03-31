import axios from 'axios';
import { PixelBoard, ApiResponse } from '@/types';

// Configuration
const API_URL = '/api';
const API_TIMEOUT = 30000;

// Create instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error: ', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      if ('data' in response.data) {
        response.data = response.data.data;
      }
    }
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      const errorData = error.response.data as Record<string, any> || {};
      const errorMsg = errorData.message || errorData.error || 'Une erreur est survenue';
      console.error('Response error:', errorMsg);
      return Promise.reject({ error: errorMsg });
    }

    if (error.request) {
      console.error('Network error: No response received', error.request);
      return Promise.reject({
        error: 'Impossible de communiquer avec le serveur. Vérifiez votre connexion internet.',
      });
    }

    console.error('Error:', error.message);
    return Promise.reject({ error: error.message });
  }
);

// Helper for error normalization
function normalizeError(error: any): ApiResponse<any> {
  if (error.error) {
    return { error: error.error };
  }
  return { error: 'Une erreur inattendue est survenue' };
}

const PixelBoardService = {
  // Récupérer tous les PixelBoards
  getAllBoards: async () => {
    try {
      const response = await axiosInstance.get<PixelBoard[]>('/pixelboards');
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  // Récupérer un PixelBoard par ID
  getBoardById: async (id: string) => {
    try {
      const response = await axiosInstance.get<PixelBoard>(`/pixelboards/${id}`);
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  // Créer un nouveau PixelBoard
  createBoard: async (boardData: Omit<PixelBoard, 'id' | 'created_at' | 'is_active' | 'grid' | 'admin_id'> & { initialGrid?: Record<string, string> }) => {
    try {
      const response = await axiosInstance.post<PixelBoard>('/pixelboards', boardData);
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  // Mettre à jour un PixelBoard existant
  updateBoard: async (id: string, boardData: Partial<PixelBoard>) => {
    try {
      const response = await axiosInstance.put<PixelBoard>(`/pixelboards/${id}`, boardData);
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  // Supprimer un PixelBoard
  deleteBoard: async (id: string) => {
    try {
      const response = await axiosInstance.delete<void>(`/pixelboards/${id}`);
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  // Placer un pixel sur le tableau
  placePixel: async (boardId: string, x: number, y: number, color: string): Promise<any> => {
    try {
      const response = await axiosInstance.post(`/pixelboards/${boardId}/pixel`, { x, y, color });
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  // Vérifier le statut du cooldown
  checkCooldown: async (boardId: string) => {
    try {
      const response = await axiosInstance.get(`/pixelboards/${boardId}/cooldown`);
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  // Récupérer l'historique d'un pixel spécifique
  getPixelHistory: async (boardId: string, x: number, y: number) => {
    try {
      const response = await axiosInstance.get(`/pixelboards/${boardId}/position-history?x=${x}&y=${y}`);
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  // Récupérer les données pour le SuperPixelBoard
  getSuperPixelBoardData: async () => {
    try {
      // Puisque la route /pixelboards/all n'existe pas encore, nous allons utiliser une combinaison
      // des routes existantes pour obtenir tous les tableaux
      const [activeResponse, completedResponse] = await Promise.all([
        axiosInstance.get<PixelBoard[]>('/pixelboards/active'),
        axiosInstance.get<PixelBoard[]>('/pixelboards/completed')
      ]);

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
