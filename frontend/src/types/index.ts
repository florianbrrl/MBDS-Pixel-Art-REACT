// Types d'entités basés sur le modèle de données

// Type utilisateur
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  theme_preference: "light" | "dark" | "system";
}

// Type PixelBoard
export interface PixelBoard {
  id: string;
  title: string;
  width: number;
  height: number;
  grid: Record<string, string>; // Format: { "x,y": "colorHex" }
  cooldown: number;
  allow_overwrite: boolean;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  admin_id: string;
}

// Type PixelHistory
export interface PixelHistory {
  board_id: string;
  x: number;
  y: number;
  color: string;
  user_id: string;
  timestamp: string;
}

// Type pour les réponses d'API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Type pour les données de mise à jour de pixel
export interface PixelUpdateData {
  pixelboard_id: string;
  x: number;
  y: number;
  color: string;
  timestamp: string;
  user_id?: string;
}
