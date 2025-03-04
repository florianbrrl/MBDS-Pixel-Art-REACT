import axios from 'axios';
import { User, PixelBoard, PixelHistory, ApiResponse } from '@/types';
import MockApiService from './api.mock';

// Décider si on utilise l'API mock ou l'API réelle
const USE_MOCK_API = true; // Mettre à jour cette valeur pour basculer entre mock et réel

// Configuration de l'API réelle
const API_URL = '/api';
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercepteur pour normaliser les réponses d'erreur
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      return Promise.reject({
        error: error.response.data.message || 'Une erreur est survenue.',
        status: error.response.status,
      });
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse
      return Promise.reject({
        error: 'Impossible de communiquer avec le serveur.',
      });
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      return Promise.reject({
        error: error.message,
      });
    }
  },
);

// API Service réel
const RealApiService = {
  // Authentification
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || 'Échec de connexion' };
    }
  },

  register: async (email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.post('/auth/register', { email, password });
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || "Échec d'inscription" };
    }
  },

  // PixelBoards
  getActivePixelBoards: async (): Promise<ApiResponse<PixelBoard[]>> => {
    try {
      const response = await axiosInstance.get('/pixelboards/active');
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || 'Impossible de récupérer les PixelBoards actifs' };
    }
  },

  getCompletedPixelBoards: async (): Promise<ApiResponse<PixelBoard[]>> => {
    try {
      const response = await axiosInstance.get('/pixelboards/completed');
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || 'Impossible de récupérer les PixelBoards terminés' };
    }
  },

  getAllPixelBoards: async (): Promise<ApiResponse<PixelBoard[]>> => {
    try {
      const response = await axiosInstance.get('/pixelboards');
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || 'Impossible de récupérer les PixelBoards' };
    }
  },

  getPixelBoardById: async (id: string): Promise<ApiResponse<PixelBoard>> => {
    try {
      const response = await axiosInstance.get(`/pixelboards/${id}`);
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || 'Impossible de récupérer les détails du PixelBoard' };
    }
  },

  // Historique des pixels
  getPixelHistory: async (boardId: string): Promise<ApiResponse<PixelHistory[]>> => {
    try {
      const response = await axiosInstance.get(`/pixelboards/${boardId}/history`);
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || "Impossible de récupérer l'historique des pixels" };
    }
  },

  // Statistiques
  getGlobalStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.get('/stats');
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || 'Impossible de récupérer les statistiques globales' };
    }
  },

  // Contributions utilisateur
  getUserContributions: async (userId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/contributions`);
      return { data: response.data.data };
    } catch (error: any) {
      return { error: error.error || 'Impossible de récupérer les contributions' };
    }
  },
};

// Exporter le service approprié selon la configuration
const ApiService = USE_MOCK_API ? MockApiService : RealApiService;

export default ApiService;
