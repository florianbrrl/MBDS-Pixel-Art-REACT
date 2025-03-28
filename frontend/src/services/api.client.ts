import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types';

// Configuration par défaut
const API_URL = '/api';
const API_TIMEOUT = 30000; // 30 secondes

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add JWT token to headers if present
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any): Promise<any> => {
    console.error('Request error: ', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log response structure
    console.log('API response structure:', response);

    // In our API, data is always in response.data.data
    if (response.data && typeof response.data === 'object') {
      // If structure is { status, data, message }
      if ('data' in response.data) {
        response.data = response.data.data;
      }
    }
    return response;
  },
  (error: AxiosError): Promise<any> => {
    // Handle specific HTTP errors
    if (error.response) {
      // Handle expired authentication
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      // Format error message from API response
      const errorData = error.response.data as Record<string, any> || {};
      const errorMsg = errorData.message || errorData.error || 'Une erreur est survenue';

      console.error('Response error:', errorMsg);
      return Promise.reject({ error: errorMsg });
    }

    // Handle network errors
    if (error.request) {
      console.error('Network error: No response received', error.request);
      return Promise.reject({
        error: 'Impossible de communiquer avec le serveur. Vérifiez votre connexion internet.',
      });
    }

    // Other errors
    console.error('Error:', error.message);
    return Promise.reject({ error: error.message });
  }
);

// Normalize errors for a consistent interface
function normalizeError(error: any): ApiResponse<any> {
  if (error.error) {
    return { error: error.error };
  }
  return { error: 'Une erreur inattendue est survenue' };
}

// Api client functions
async function get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.get<T>(url, config);
    return { data: response.data };
  } catch (error) {
    return normalizeError(error);
  }
}

async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.post<T>(url, data, config);
    return { data: response.data };
  } catch (error) {
    return normalizeError(error);
  }
}

async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.put<T>(url, data, config);
    return { data: response.data };
  } catch (error) {
    return normalizeError(error);
  }
}

async function deleteReq<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.delete<T>(url, config);
    return { data: response.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// Create the client object
const apiClient = {
  get,
  post,
  put,
  delete: deleteReq
};

export default apiClient;