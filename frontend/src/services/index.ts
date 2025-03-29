import apiClient from './api.client';

// Export all services
export { default as apiClient } from './api.client';
export { default as AuthService } from './auth.service';
export { default as PixelBoardService } from './pixelboard.service';
export { default as WebSocketService } from './websocket.service';

// Also export default apiClient for backward compatibility
export default apiClient;