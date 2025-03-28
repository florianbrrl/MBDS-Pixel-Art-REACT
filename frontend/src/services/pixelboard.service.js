"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_client_1 = __importDefault(require("./api.client"));
const PixelBoardService = {
    // Récupérer tous les PixelBoards
    getAllBoards: async () => {
        return api_client_1.default.get('/pixelboards');
    },
    // Récupérer un PixelBoard par ID
    getBoardById: async (id) => {
        return api_client_1.default.get(`/pixelboards/${id}`);
    },
    // Créer un nouveau PixelBoard
    createBoard: async (boardData) => {
        return api_client_1.default.post('/pixelboards', boardData);
    },
    // Mettre à jour un PixelBoard existant
    updateBoard: async (id, boardData) => {
        return api_client_1.default.put(`/pixelboards/${id}`, boardData);
    },
    // Supprimer un PixelBoard
    deleteBoard: async (id) => {
        return api_client_1.default.delete(`/pixelboards/${id}`);
    },
    // Placer un pixel sur le tableau
    placePixel: async (boardId, x, y, color) => {
        return api_client_1.default.post(`/pixelboards/${boardId}/pixel`, { x, y, color });
    },
    // Vérifier le statut du cooldown
    checkCooldown: async (boardId) => {
        return api_client_1.default.get(`/pixelboards/${boardId}/cooldown`);
    },
    // Récupérer l'historique d'un pixel spécifique
    getPixelHistory: async (boardId, x, y) => {
        return api_client_1.default.get(`/pixelboards/${boardId}/position-history?x=${x}&y=${y}`);
    },
    // Récupérer les données pour le SuperPixelBoard
    getSuperPixelBoardData: async () => {
        try {
            // Puisque la route /pixelboards/all n'existe pas encore, nous allons utiliser une combinaison
            // des routes existantes pour obtenir tous les tableaux
            const [activeResponse, completedResponse] = await Promise.all([
                api_client_1.default.get('/pixelboards/active'),
                api_client_1.default.get('/pixelboards/completed')
            ]);
            if (activeResponse.error && completedResponse.error) {
                return { error: activeResponse.error || completedResponse.error };
            }
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