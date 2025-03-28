import axios from 'axios';
import { User, ApiResponse } from '@/types';

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

/**
 * Service d'authentification pour les interactions avec l'API
 */
const AuthService = {
  /**
   * Connecte un utilisateur avec son email et mot de passe
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   */
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string }>> => {
    try {
      const response = await axiosInstance.post<{ token: string }>('/auth/login', { email, password });
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  /**
   * Inscrit un nouvel utilisateur
   * @param email - Email du nouvel utilisateur
   * @param password - Mot de passe du nouvel utilisateur
   */
  register: async (email: string, password: string): Promise<ApiResponse<{ userId: string }>> => {
    try {
      const response = await axiosInstance.post<{ userId: string }>('/auth/register', { email, password });
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.get<User>('/users/profile');
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  /**
   * Met à jour le profil utilisateur
   * @param data - Données à mettre à jour (email, theme_preference)
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.put<User>('/users/profile', data);
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  /**
   * Met à jour uniquement la préférence de thème
   * @param theme - Nouveau thème ('light', 'dark', 'sys')
   */
  updateTheme: async (theme: string): Promise<ApiResponse<{ theme: string }>> => {
    try {
      const response = await axiosInstance.put<{ theme: string }>('/users/theme', { theme });
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  /**
   * Change le mot de passe de l'utilisateur
   * @param currentPassword - Mot de passe actuel
   * @param newPassword - Nouveau mot de passe
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosInstance.post<void>('/users/password', {
        currentPassword,
        newPassword
      });
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  /**
   * Récupère les contributions d'un utilisateur
   * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur connecté par défaut)
   */
  getUserContributions: async (userId?: string): Promise<ApiResponse<{
    totalPixels: number;
    contributedBoards: { boardId: string; pixelCount: number }[];
  }>> => {
    try {
      const endpoint = userId ? `/users/${userId}/contributions` : '/users/contributions';
      const response = await axiosInstance.get(endpoint);
      return { data: response.data };
    } catch (error) {
      return normalizeError(error);
    }
  },

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Récupère le token d'authentification
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Déconnecte l'utilisateur
   */
  logout: (): void => {
    localStorage.removeItem('token');
  }
};

export default AuthService;