// src/services/websocket.service.ts
import { PixelUpdateData } from '@/types';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 secondes
  private pixelUpdateCallbacks: ((data: PixelUpdateData) => void)[] = [];
  private boardId?: string;

  connect(boardId?: string) {
    if (boardId) {
      this.boardId = boardId;
    }

    // Utiliser le même hôte que l'application
    const wsUrl = `ws://${window.location.hostname}:3001`;
    console.log('Connecting to WebSocket at:', wsUrl);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;

      // Si on a un board ID, rejoindre le canal
      if (this.boardId) {
        this.joinBoard(this.boardId);
      }
    };

    this.socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);

      try {
        const message = JSON.parse(event.data);
        console.log('Parsed message:', message);

        // Traiter les différents types de messages
        if (message.type === 'pixel-update') {
          console.log('Pixel update received:', message.data);
          this.pixelUpdateCallbacks.forEach(callback => {
            callback(message.data);
          });
        } else if (message.type === 'welcome') {
          console.log('Welcome message received');
          // Si on a un board ID, rejoindre le canal après la bienvenue
          if (this.boardId) {
            this.joinBoard(this.boardId);
          }
        } else if (message.type === 'board-joined') {
          console.log('Board joined confirmation received');
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);

      // Tenter de se reconnecter si la connexion a été perdue involontairement
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          this.connect();
        }, this.reconnectDelay);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  joinBoard(boardId: string) {
    this.boardId = boardId;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Joining board:', boardId);
      this.socket.send(JSON.stringify({
        type: 'join-board',
        boardId
      }));
    } else {
      console.warn('Cannot join board: WebSocket not connected');
    }
  }

  onPixelUpdate(callback: (data: PixelUpdateData) => void) {
    this.pixelUpdateCallbacks.push(callback);
    return () => this.offPixelUpdate(callback); // Retourne une fonction de nettoyage
  }

  offPixelUpdate(callback: (data: PixelUpdateData) => void) {
    this.pixelUpdateCallbacks = this.pixelUpdateCallbacks.filter(cb => cb !== callback);
  }
}

// Exporter une instance unique pour toute l'application
export default new WebSocketService();
