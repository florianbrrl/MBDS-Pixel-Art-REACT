import axios from 'axios';
import { User, PixelBoard, ApiResponse } from '@/types';

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

// API Client functions
async function get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.get<T>(url, config);
    return { data: response.data };
  } catch (error) {
    return normalizeError(error);
  }
}

async function post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.post<T>(url, data, config);
    return { data: response.data };
  } catch (error) {
    return normalizeError(error);
  }
}

async function put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.put<T>(url, data, config);
    return { data: response.data };
  } catch (error) {
    return normalizeError(error);
  }
}

async function del<T>(url: string, config?: any): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.delete<T>(url, config);
    return { data: response.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// Auth Service Functions
const login = async (email: string, password: string): Promise<ApiResponse<{ token: string }>> => {
  return post<{ token: string }>('/auth/login', { email, password });
};

const register = async (email: string, password: string): Promise<ApiResponse<{ userId: string }>> => {
  return post<{ userId: string }>('/auth/register', { email, password });
};

const getProfile = async (): Promise<ApiResponse<User>> => {
  return get<User>('/users/profile');
};

const updateProfile = async (data: Partial<User>): Promise<ApiResponse<User>> => {
  return put<User>('/users/profile', data);
};

const updateTheme = async (theme: string): Promise<ApiResponse<{ theme: string }>> => {
  return put<{ theme: string }>('/users/theme', { theme });
};

const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
  return post<void>('/users/password', { currentPassword, newPassword });
};

const getUserContributions = async (userId?: string): Promise<ApiResponse<{
  totalPixels: number;
  contributedBoards: { boardId: string; pixelCount: number }[];
}>> => {
  const endpoint = userId ? `/users/${userId}/contributions` : '/users/contributions';
  return get(endpoint);
};

const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const logout = (): void => {
  localStorage.removeItem('token');
};

// PixelBoard Service Functions
const getAllPixelBoards = async (): Promise<ApiResponse<PixelBoard[]>> => {
  return get<PixelBoard[]>('/pixelboards');
};

const getPixelBoardById = async (id: string): Promise<ApiResponse<PixelBoard>> => {
  return get<PixelBoard>(`/pixelboards/${id}`);
};

const createPixelBoard = async (boardData: Omit<PixelBoard, 'id' | 'created_at' | 'is_active' | 'grid' | 'admin_id'>): Promise<ApiResponse<PixelBoard>> => {
  return post<PixelBoard>('/pixelboards', boardData);
};

const updatePixelBoard = async (id: string, boardData: Partial<PixelBoard>): Promise<ApiResponse<PixelBoard>> => {
  return put<PixelBoard>(`/pixelboards/${id}`, boardData);
};

const deletePixelBoard = async (id: string): Promise<ApiResponse<void>> => {
  return del<void>(`/pixelboards/${id}`);
};

const placePixel = async (boardId: string, x: number, y: number, color: string): Promise<ApiResponse<any>> => {
  return post(`/pixelboards/${boardId}/pixel`, { x, y, color });
};

const checkCooldown = async (boardId: string): Promise<ApiResponse<any>> => {
  return get(`/pixelboards/${boardId}/cooldown`);
};

const getPixelHistory = async (boardId: string, x: number, y: number): Promise<ApiResponse<any>> => {
  return get(`/pixelboards/${boardId}/position-history?x=${x}&y=${y}`);
};

const getSuperPixelBoardData = async (): Promise<ApiResponse<any>> => {
  try {
    const [activeResponse, completedResponse] = await Promise.all([
      get<PixelBoard[]>('/pixelboards/active'),
      get<PixelBoard[]>('/pixelboards/completed')
    ]);

    if (activeResponse.error && completedResponse.error) {
      return { error: activeResponse.error || completedResponse.error };
    }

    // Combine active and completed boards
    const allBoards = [
      ...(activeResponse.data || []),
      ...(completedResponse.data || [])
    ];

    // If no data returned
    if (allBoards.length === 0) {
      return { data: { boards: [], dimensions: { width: 100, height: 100 } } };
    }

    // Calculate maximum dimensions
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
    return { error: error.message || 'Error retrieving data' };
  }
};

// Import du service WebSocket séparé
import WebSocketService from './websocket.service';

// Export services
export const apiClient = { get, post, put, delete: del };

export const AuthService = {
  login,
  register,
  getProfile,
  updateProfile,
  updateTheme,
  changePassword,
  getUserContributions,
  isAuthenticated,
  getToken,
  logout
};

export const PixelBoardService = {
  getAllBoards: getAllPixelBoards,
  getBoardById: getPixelBoardById,
  createBoard: createPixelBoard,
  updateBoard: updatePixelBoard,
  deleteBoard: deletePixelBoard,
  placePixel,
  checkCooldown,
  getPixelHistory,
  getSuperPixelBoardData
};

// Exporter le service WebSocket importé
export { WebSocketService };

// Additional API methods for admin and user management
const getAllUsers = async (): Promise<ApiResponse<any[]>> => {
  return get('/admin/users');
};

const updateUserRole = async (userId: string, role: string): Promise<ApiResponse<any>> => {
  return put(`/admin/users/${userId}/role`, { role });
};

const toggleUserStatus = async (userId: string, newStatus: boolean): Promise<ApiResponse<any>> => {
  return put(`/admin/users/${userId}/toggle-status`, { is_blocked: newStatus });
};

const getGlobalStats = async (): Promise<ApiResponse<any>> => {
  return get('/stats/global');
};

const getActivePixelBoards = async (): Promise<ApiResponse<PixelBoard[]>> => {
  return get<PixelBoard[]>('/pixelboards/active');
};

const getCompletedPixelBoards = async (): Promise<ApiResponse<PixelBoard[]>> => {
  return get<PixelBoard[]>('/pixelboards/completed');
};

// Export as single API service
const ApiService = {
  // API client methods
  get,
  post,
  put,
  delete: del,

  // Auth methods
  login,
  register,
  getProfile,
  updateProfile,
  updateTheme,
  changePassword,
  getUserContributions,
  isAuthenticated,
  getToken,
  logout,

  // PixelBoard methods
  getAllPixelBoards,
  getPixelBoardById,
  createPixelBoard,
  updatePixelBoard,
  deletePixelBoard,
  placePixel,
  checkCooldown,
  getPixelHistory,
  getSuperPixelBoardData,
  getActivePixelBoards,
  getCompletedPixelBoards,

  // Admin methods
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getGlobalStats,

  // WebSocket instance - Référence au service externe
  WebSocketService
};

export default ApiService;
