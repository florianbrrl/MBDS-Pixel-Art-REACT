import apiClient from './api.client';
import { User, ApiResponse } from '@/types';
import { AuthToken } from '@/types/auth.types';

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
    return apiClient.post<{ token: string }>('/auth/login', { email, password });
  },

  /**
   * Inscrit un nouvel utilisateur
   * @param email - Email du nouvel utilisateur
   * @param password - Mot de passe du nouvel utilisateur
   */
  register: async (email: string, password: string): Promise<ApiResponse<{ userId: string }>> => {
    return apiClient.post<{ userId: string }>('/auth/register', { email, password });
  },

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<User>('/users/profile');
  },

  /**
   * Met à jour le profil utilisateur
   * @param data - Données à mettre à jour (email, theme_preference)
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put<User>('/users/profile', data);
  },

  /**
   * Met à jour uniquement la préférence de thème
   * @param theme - Nouveau thème ('light', 'dark', 'sys')
   */
  updateTheme: async (theme: string): Promise<ApiResponse<{ theme: string }>> => {
    return apiClient.put<{ theme: string }>('/users/theme', { theme });
  },

  /**
   * Change le mot de passe de l'utilisateur
   * @param currentPassword - Mot de passe actuel
   * @param newPassword - Nouveau mot de passe
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/users/password', {
      currentPassword,
      newPassword
    });
  },

  /**
   * Récupère les contributions d'un utilisateur
   * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur connecté par défaut)
   */
  getUserContributions: async (userId?: string): Promise<ApiResponse<{
    totalPixels: number;
    contributedBoards: { boardId: string; pixelCount: number }[];
  }>> => {
    const endpoint = userId ? `/users/${userId}/contributions` : '/users/contributions';
    return apiClient.get(endpoint);
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
