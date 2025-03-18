// Types liés à l'authentification

// Rôles utilisateur possibles
export type UserRole = 'guest' | 'user' | 'premium' | 'admin';

// Type pour les préférences de thème
export type ThemePreference = 'light' | 'dark' | 'system' | 'sys';

// Interface pour le profil utilisateur
export interface UserProfile {
  id: string;
  email: string;
  role?: UserRole;
  theme_preference?: ThemePreference;
  created_at: string;
  updated_at?: string;
  is_blocked?: boolean;
}

// Interface pour les identifiants de connexion
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface pour les identifiants d'inscription
export interface RegisterCredentials {
  email: string;
  password: string;
  password_confirmation?: string;
}

// Interface pour la réponse JWT
export interface AuthToken {
  token: string;
  expires_in?: number;
}

// Interface pour les contributions utilisateur
export interface UserContributions {
  totalPixels: number;
  contributedBoards: {
    boardId: string;
    pixelCount: number;
  }[];
}

// Interface pour les données de changement de mot de passe
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}
