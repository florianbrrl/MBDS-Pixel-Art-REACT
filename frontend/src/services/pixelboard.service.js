"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// Configuration
const API_URL = '/api';
const API_TIMEOUT = 30000;
// Create instance
const axiosInstance = axios_1.default.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Add request interceptor
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request error: ', error);
    return Promise.reject(error);
});
// Add response interceptor
axiosInstance.interceptors.response.use((response) => {
    if (response.data && typeof response.data === 'object') {
        if ('data' in response.data) {
            response.data = response.data.data;
        }
    }
    return response;
}, (error) => {
    if (error.response) {
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        const errorData = error.response.data || {};
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
});
// Helper for error normalization
function normalizeError(error) {
    if (error.error) {
        return { error: error.error };
    }
    return { error: 'Une erreur inattendue est survenue' };
}
const PixelBoardService = {
    // Récupérer tous les PixelBoards
    getAllBoards: async () => {
        try {
            const response = await axiosInstance.get('/pixelboards');
            return { data: response.data };
        }
        catch (error) {
            return normalizeError(error);
        }
    },
    // Récupérer un PixelBoard par ID
    getBoardById: async (id) => {
        try {
            const response = await axiosInstance.get(`/pixelboards/${id}`);
            return { data: response.data };
        }
        catch (error) {
            return normalizeError(error);
        }
    },
    // Créer un nouveau PixelBoard
    createBoard: async (boardData) => {
        try {
            const response = await axiosInstance.post('/pixelboards', boardData);
            return { data: response.data };
        }
        catch (error) {
            return normalizeError(error);
        }
    },
    // Mettre à jour un PixelBoard existant
    updateBoard: async (id, boardData) => {
        try {
            const response = await axiosInstance.put(`/pixelboards/${id}`, boardData);
            return { data: response.data };
        }
        catch (error) {
            return normalizeError(error);
        }
    },
    // Supprimer un PixelBoard
    deleteBoard: async (id) => {
        try {
            const response = await axiosInstance.delete(`/pixelboards/${id}`);
            return { data: response.data };
        }
        catch (error) {
            return normalizeError(error);
        }
    },
    // Placer un pixel sur le tableau
    placePixel: async (boardId, x, y, color) => {
        try {
            const response = await axiosInstance.post(`/pixelboards/${boardId}/pixel`, { x, y, color });
            return { data: response.data };
        }
        catch (error) {
            return normalizeError(error);
        }
    },
    // Vérifier le statut du cooldown
    checkCooldown: async (boardId) => {
        try {
            const response = await axiosInstance.get(`/pixelboards/${boardId}/cooldown`);
            return { data: response.data };
        }
        catch (error) {
            return normalizeError(error);
        }
    },
    // Récupérer l'historique d'un pixel spécifique
    getPixelHistory: async (boardId, x, y) => {
        try {
            const response = await axiosInstance.get(`/pixelboards/${boardId}/position-history?x=${x}&y=${y}`);
            return { data: response.data };
        }
        catch (error) {
            return normalizeError(error);
        }
    },
    // Récupérer les données pour le SuperPixelBoard
    getSuperPixelBoardData: async () => {
        try {
            // Puisque la route /pixelboards/all n'existe pas encore, nous allons utiliser une combinaison
            // des routes existantes pour obtenir tous les tableaux
            const [activeResponse, completedResponse] = await Promise.all([
                axiosInstance.get('/pixelboards/active'),
                axiosInstance.get('/pixelboards/completed')
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
        }
        catch (error) {
            return { error: error.message || 'Erreur lors de la récupération des données' };
        }
    },
};
exports.default = PixelBoardService;
//# sourceMappingURL=pixelboard.service.js.map