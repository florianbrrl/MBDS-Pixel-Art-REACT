import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

// Configuration par défaut
const API_URL = '/api';
const API_TIMEOUT = 30000; // 30 secondes

class ApiClient {
  private static instance: ApiClient;
  private axios: AxiosInstance;

  private constructor() {
    // Créer une instance axios avec la configuration par défaut
    this.axios = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Ajouter un intercepteur pour les requêtes
    this.axios.interceptors.request.use(
      this.handleRequest,
      this.handleRequestError
    );

    // Ajouter un intercepteur pour les réponses
    this.axios.interceptors.response.use(
      this.handleResponse,
      this.handleResponseError
    );
  }

  // Singleton pattern pour obtenir l'instance
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Méthode pour effectuer une requête GET
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.get<T>(url, config);
      return { data: response.data };
    } catch (error) {
      return this.normalizeError(error);
    }
  }

  // Méthode pour effectuer une requête POST
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.post<T>(url, data, config);
      return { data: response.data };
    } catch (error) {
      return this.normalizeError(error);
    }
  }

  // Méthode pour effectuer une requête PUT
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.put<T>(url, data, config);
      return { data: response.data };
    } catch (error) {
      return this.normalizeError(error);
    }
  }

  // Méthode pour effectuer une requête DELETE
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axios.delete<T>(url, config);
      return { data: response.data };
    } catch (error) {
      return this.normalizeError(error);
    }
  }

  // Intercepteur pour les requêtes
  private handleRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Ajouter le token JWT aux headers si présent
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  // Intercepteur pour les erreurs de requête
  private handleRequestError = (error: any): Promise<any> => {
    console.error('Request error: ', error);
    return Promise.reject(error);
  };

  // Dans api.client.ts, modifier handleResponse
private handleResponse = (response: AxiosResponse): AxiosResponse => {
  // Ajouter ce log pour voir la structure de la réponse
  console.log("API response structure:", response);

  // Dans notre API, les données sont toujours dans response.data.data
  if (response.data && typeof response.data === 'object') {
    // Si la structure est { status, data, message }
    if ('data' in response.data) {
      response.data = response.data.data;
    }
  }
  return response;
};

  // Intercepteur pour les erreurs de réponse
  private handleResponseError = (error: AxiosError): Promise<any> => {
    // Gestion des erreurs HTTP spécifiques
    if (error.response) {
      // Gestion de l'authentification expirée
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      // Formater le message d'erreur à partir de la réponse de l'API
      const errorMsg =
        error.response.data?.message ||
        error.response.data?.error ||
        'Une erreur est survenue';

      console.error('Response error:', errorMsg);
      return Promise.reject({ error: errorMsg });
    }

    // Gestion des erreurs de réseau
    if (error.request) {
      console.error('Network error: No response received', error.request);
      return Promise.reject({
        error: 'Impossible de communiquer avec le serveur. Vérifiez votre connexion internet.'
      });
    }

    // Autres erreurs
    console.error('Error:', error.message);
    return Promise.reject({ error: error.message });
  };

  // Normaliser les erreurs pour une interface cohérente
  private normalizeError(error: any): ApiResponse<any> {
    if (error.error) {
      return { error: error.error };
    }
    return { error: 'Une erreur inattendue est survenue' };
  }
}

// Exporter une instance unique
export default ApiClient.getInstance();
