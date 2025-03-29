// src/services/websocket.service.ts
import { PixelUpdateData } from '@/types';

/**
 * Service pour gérer les connexions WebSocket
 */
class WebSocketServiceClass {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 secondes
  private pixelUpdateCallbacks: ((data: PixelUpdateData) => void)[] = [];
  private boardId?: string;
  private isConnecting: boolean = false;

  /**
   * Établit une connexion WebSocket
   * @param boardId ID du tableau à rejoindre après la connexion (optionnel)
   */
  connect(boardId?: string) {
    // Si déjà connecté, juste rejoindre le board mais ne pas reconnecter
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket déjà connecté');
      if (boardId) {
        this.boardId = boardId;
        this.joinBoard(boardId);
      }
      return;
    }

    // Si tentative de connexion déjà en cours, juste mettre à jour le boardId
    if (this.isConnecting) {
      console.log('Connexion WebSocket déjà en cours');
      if (boardId) {
        this.boardId = boardId;
        // Le board sera rejoint automatiquement à l'ouverture
      }
      return;
    }

    this.isConnecting = true;

    if (boardId) {
      this.boardId = boardId;
    }

    // Utiliser le même protocole (ws/wss) en fonction du protocole HTTP/HTTPS actuel
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Utiliser le même hôte mais avec le port spécifique pour WebSocket
    const host = window.location.hostname;
    // Port fixe pour WebSocket - 3001 est le port par défaut pour notre serveur WebSocket
    const port = '3001';

    const wsUrl = `${protocol}//${host}:${port}`;
    console.log('Connecting to WebSocket at:', wsUrl);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Gère l'événement d'ouverture de la connexion
   */
  private handleOpen() {
    console.log('WebSocket connection established');
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Si on a un board ID, rejoindre le canal
    if (this.boardId) {
      this.joinBoard(this.boardId);
    }
  }

  /**
   * Gère les messages reçus
   */
  private handleMessage(event: MessageEvent) {
    console.log('WebSocket message received:', event.data);

    try {
      const message = JSON.parse(event.data);
      console.log('Parsed message:', message);

      // Traiter les différents types de messages
      switch (message.type) {
        case 'pixel-update':
          console.log('Pixel update received:', message.data);
          this.pixelUpdateCallbacks.forEach(callback => {
            callback(message.data);
          });
          break;
        case 'welcome':
          console.log('Welcome message received');
          // Si on a un board ID, rejoindre le canal après la bienvenue
          if (this.boardId) {
            this.joinBoard(this.boardId);
          }
          break;
        case 'board-joined':
          console.log('Board joined confirmation received');
          break;
        default:
          console.log('Unrecognized message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Gère la fermeture de la connexion
   */
  private handleClose(event: CloseEvent) {
    console.log('WebSocket connection closed', event.code, event.reason);
    this.isConnecting = false;

    // Tenter de se reconnecter si la connexion a été perdue involontairement
    if (!event.wasClean) {
      this.scheduleReconnect();
    }
  }

  /**
   * Gère les erreurs de connexion
   */
  private handleError(error: Event) {
    console.error('WebSocket error:', error);
    this.isConnecting = false;

    // Planifier une reconnexion en cas d'erreur
    this.scheduleReconnect();
  }

  /**
   * Planifie une tentative de reconnexion
   */
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.warn('Maximum reconnection attempts reached');
    }
  }

  /**
   * Ferme la connexion WebSocket
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.isConnecting = false;
  }

  /**
   * Rejoint un tableau spécifique
   * @param boardId ID du tableau à rejoindre
   */
  joinBoard(boardId: string) {
    this.boardId = boardId;

    // Si le socket existe et est ouvert, rejoindre immédiatement
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Joining board:', boardId);
      try {
        this.socket.send(JSON.stringify({
          type: 'join-board',
          boardId
        }));
      } catch (error) {
        console.error('Error sending join-board message:', error);
        // Tenter de reconnecter en cas d'erreur
        this.reconnect();
      }
    } else if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      // Si le socket est en cours de connexion, on attendra l'événement onopen pour rejoindre
      console.log('WebSocket connecting, will join board after connection');
    } else {
      // Si pas de socket ou socket fermé/en erreur, reconnecter
      console.log('WebSocket not connected, attempting to connect first');
      this.reconnect();
    }
  }

  /**
   * Force une reconnexion du WebSocket
   */
  private reconnect() {
    // Nettoyer tout socket existant
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        // Ignorer les erreurs de fermeture
      }
      this.socket = null;
    }

    // Réinitialiser l'état
    this.isConnecting = false;

    // Relancer la connexion
    this.connect();
  }

  /**
   * S'abonne aux mises à jour de pixels
   * @param callback Fonction à appeler lors de la réception d'une mise à jour
   * @returns Fonction pour se désabonner
   */
  onPixelUpdate(callback: (data: PixelUpdateData) => void) {
    this.pixelUpdateCallbacks.push(callback);
    return () => this.offPixelUpdate(callback); // Retourne une fonction de nettoyage
  }

  /**
   * Se désabonne des mises à jour de pixels
   * @param callback Fonction à supprimer des callbacks
   */
  offPixelUpdate(callback: (data: PixelUpdateData) => void) {
    this.pixelUpdateCallbacks = this.pixelUpdateCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Vérifie si la connexion WebSocket est active
   * @returns true si la connexion est ouverte
   */
  isConnected(): boolean {
    try {
      return !!this.socket && this.socket.readyState === WebSocket.OPEN;
    } catch (error) {
      console.error('Error checking WebSocket connection status:', error);
      return false;
    }
  }

  /**
   * Retourne l'état actuel du WebSocket
   * @returns 'connected', 'connecting', 'disconnected' ou 'error'
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    try {
      if (!this.socket) {
        return 'disconnected';
      }

      switch (this.socket.readyState) {
        case WebSocket.CONNECTING:
          return 'connecting';
        case WebSocket.OPEN:
          return 'connected';
        case WebSocket.CLOSING:
        case WebSocket.CLOSED:
        default:
          return 'disconnected';
      }
    } catch (error) {
      console.error('Error getting WebSocket status:', error);
      return 'error';
    }
  }
}

// Exporter une instance unique pour toute l'application
const WebSocketService = new WebSocketServiceClass();

export { WebSocketService };
export default WebSocketService;
