import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { PixelUpdateData } from '../types/socket.types';

// Stockage des connexions actives
const activeConnections: Map<string, Set<WebSocket>> = new Map();

/**
 * Service WebSocket simplifié utilisant 'ws' au lieu de Socket.IO
 */
export class SimpleWSService {
  private static wss: WebSocketServer;
  private static isInitialized = false;

  /**
   * Initialise le serveur WebSocket sur un port séparé
   * @param server Le serveur HTTP à utiliser (optionnel)
   * @param port Le port à utiliser (si server n'est pas fourni)
   */
  static initialize(server?: http.Server, port = 3001) {
    if (this.isInitialized) return;

    if (server) {
      this.wss = new WebSocketServer({ server });
      console.log('WebSocket server attached to existing HTTP server');
    } else {
      this.wss = new WebSocketServer({ port });
      console.log(`WebSocket server initialized on port ${port}`);
    }

    this.wss.on('connection', (ws, req) => {
      console.log('Client connected to WebSocket server');

      // Extraire le token d'authentification si présent
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        console.log('Client authentifié avec token:', token.substring(0, 10) + '...');
      }

      // Envoyer un message de bienvenue
      ws.send(JSON.stringify({
        type: 'welcome',
        data: { message: 'Connected to WebSocket server!' }
      }));

      // Gérer les messages du client
      ws.on('message', (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());

          // Gérer les différents types de messages
          switch (parsedMessage.type) {
            case 'join-board':
              this.joinBoard(ws, parsedMessage.boardId);
              break;
            case 'leave-board':
              this.leaveBoard(ws, parsedMessage.boardId);
              break;
            case 'get-missed-updates':
              // À implémenter si nécessaire
              break;
            default:
              console.log('Message non reconnu:', parsedMessage);
          }
        } catch (error) {
          console.error('Erreur lors du traitement du message:', error);
        }
      });

      // Gérer la déconnexion
      ws.on('close', () => {
        console.log('Client disconnected from WebSocket server');
        // Nettoyer les connexions à la déconnexion
        this.removeFromAllBoards(ws);
      });
    });

    this.isInitialized = true;
  }

  /**
   * Ajoute un client à un tableau spécifique
   */
  private static joinBoard(ws: WebSocket, boardId: string) {
    if (!activeConnections.has(boardId)) {
      activeConnections.set(boardId, new Set());
    }
    activeConnections.get(boardId)?.add(ws);
    console.log(`Client a rejoint le tableau ${boardId}`);

    // Confirmer au client qu'il a rejoint le tableau
    ws.send(JSON.stringify({
      type: 'board-joined',
      boardId
    }));
  }

  /**
   * Retire un client d'un tableau spécifique
   */
  private static leaveBoard(ws: WebSocket, boardId: string) {
    activeConnections.get(boardId)?.delete(ws);
    console.log(`Client a quitté le tableau ${boardId}`);
  }

  /**
   * Retire un client de tous les tableaux (à la déconnexion)
   */
  private static removeFromAllBoards(ws: WebSocket) {
    for (const [boardId, clients] of activeConnections.entries()) {
      if (clients.has(ws)) {
        clients.delete(ws);
        console.log(`Client retiré du tableau ${boardId} à la déconnexion`);
      }
    }
  }

  /**
   * Émet une mise à jour de pixel à tous les clients connectés à un tableau
   */
  static emitPixelUpdate(boardId: string, data: PixelUpdateData) {
    const clients = activeConnections.get(boardId);
    if (!clients || clients.size === 0) return;

    const message = JSON.stringify({
      type: 'pixel-update',
      data
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
