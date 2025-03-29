"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// Configuration par défaut
const API_URL = '/api';
const API_TIMEOUT = 30000; // 30 secondes
class ApiClient {
    constructor() {
        // Intercepteur pour les requêtes
        this.handleRequest = (config) => {
            // Ajouter le token JWT aux headers si présent
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        };
        // Intercepteur pour les erreurs de requête
        this.handleRequestError = (error) => {
            console.error('Request error: ', error);
            return Promise.reject(error);
        };
        // Dans api.client.ts, modifier handleResponse
        this.handleResponse = (response) => {
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
        this.handleResponseError = (error) => {
            // Gestion des erreurs HTTP spécifiques
            if (error.response) {
                // Gestion de l'authentification expirée
                if (error.response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                // Formater le message d'erreur à partir de la réponse de l'API
                const errorMsg = error.response.data?.message ||
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
        // Créer une instance axios avec la configuration par défaut
        this.axios = axios_1.default.create({
            baseURL: API_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Ajouter un intercepteur pour les requêtes
        this.axios.interceptors.request.use(this.handleRequest, this.handleRequestError);
        // Ajouter un intercepteur pour les réponses
        this.axios.interceptors.response.use(this.handleResponse, this.handleResponseError);
    }
    // Singleton pattern pour obtenir l'instance
    static getInstance() {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }
    // Méthode pour effectuer une requête GET
    async get(url, config) {
        try {
            const response = await this.axios.get(url, config);
            return { data: response.data };
        }
        catch (error) {
            return this.normalizeError(error);
        }
    }
    // Méthode pour effectuer une requête POST
    async post(url, data, config) {
        try {
            const response = await this.axios.post(url, data, config);
            return { data: response.data };
        }
        catch (error) {
            return this.normalizeError(error);
        }
    }
    // Méthode pour effectuer une requête PUT
    async put(url, data, config) {
        try {
            const response = await this.axios.put(url, data, config);
            return { data: response.data };
        }
        catch (error) {
            return this.normalizeError(error);
        }
    }
    // Méthode pour effectuer une requête DELETE
    async delete(url, config) {
        try {
            const response = await this.axios.delete(url, config);
            return { data: response.data };
        }
        catch (error) {
            return this.normalizeError(error);
        }
    }
    // Normaliser les erreurs pour une interface cohérente
    normalizeError(error) {
        if (error.error) {
            return { error: error.error };
        }
        return { error: 'Une erreur inattendue est survenue' };
    }
}
// Exporter une instance unique
exports.default = ApiClient.getInstance();
//# sourceMappingURL=api.client.js.map