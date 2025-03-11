import apiClient from './api.client';
import { User, ApiResponse } from '@/types';
import { AuthToken, LoginCredentials, RegisterCredentials } from '@/types/auth.types';

// Interface pour les réponses d'authentification
interface AuthResponse {
  token: string;
  userId: string;
}

// Interface pour les données de profil
interface ProfileResponse {
  id: string;
  email: string;
  role: string;
  theme_preference: string;
  created_at: string;
  updated_at?: string;
}

// Service d'authentification
const AuthService = {
  // Fonction de connexion
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  // Fonction d'inscription
  register: async (credentials: RegisterCredentials): Promise<ApiResponse<{ userId: string }>> => {
    return apiClient.post<{ userId: string }>('/auth/register', credentials);
  },

  // Fonction pour récupérer le profil utilisateur
  getProfile: async (): Promise<ApiResponse<ProfileResponse>> => {
    try {
      const response = await apiClient.get<ProfileResponse>('/auth/profile');
      console.log("Profile response:", response); // Ajouter ce log
      return { data: response.data };
    } catch (error: any) {
      console.error("Profile error:", error); // Ajouter ce log
      return { error: error.error || 'Échec de la récupération du profil' };
    }
  },

  // Fonction pour mettre à jour le profil utilisateur
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put<User>('/auth/profile', data);
  },

  // Fonction pour changer le mot de passe
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiClient.put<void>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Fonction utilitaire pour vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Fonction utilitaire pour obtenir le token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Fonction de déconnexion
  logout: (): void => {
    localStorage.removeItem('token');
  },
};

export default AuthService;
