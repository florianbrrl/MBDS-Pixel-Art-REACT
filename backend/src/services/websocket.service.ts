import { io } from '../server';
import { PixelUpdateData } from '../types/socket.types';
import { PixelHistoryModel } from '../models/pixel-history.model';

/**
 * Service gérant les fonctionnalités de WebSocket liées aux PixelBoards
 */
export class WebSocketService {
    /**
     * Émet une mise à jour de pixel à tous les clients connectés à un tableau spécifique
     * @param boardId ID du PixelBoard concerné
     * @param pixelData Données du pixel placé
     */
    static emitPixelUpdate(boardId: string, pixelData: PixelUpdateData): void {
        io.to(boardId).emit('pixel-update', pixelData);
    }

    /**
     * Gère les reconnexions avec un mécanisme anti-perte de données
     * Les clients peuvent demander les mises à jour manquées pendant leur déconnexion
     * @param boardId ID du PixelBoard
     * @param lastTimestamp Horodatage de la dernière mise à jour reçue par le client
     * @returns Promise contenant la liste des mises à jour manquées
     */
    static async getUpdatesAfterTimestamp(boardId: string, lastTimestamp: Date): Promise<PixelUpdateData[]> {
        try {
            // Récupérer l'historique des pixels après le timestamp fourni
            const updates = await PixelHistoryModel.findByBoardIdAfterTimestamp(boardId, lastTimestamp);
            
            // Convertir en format PixelUpdateData
            return updates.map(update => ({
                pixelboard_id: update.board_id,
                x: update.x,
                y: update.y,
                color: update.color,
                timestamp: update.timestamp,
                user_id: update.user_id || undefined
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des mises à jour de pixels:', error);
            return [];
        }
    }
}