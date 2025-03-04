import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Valeur par défaut du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Propriétés du provider
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Ici on simule une vérification d'authentification
        // À remplacer par un vrai appel API pour vérifier le token
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simuler un appel d'API - À remplacer par un vrai appel
      const mockUser: User = {
        id: '1',
        email,
        created_at: new Date().toISOString(),
        theme_preference: 'system',
      };

      // Stocker l'utilisateur dans le localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simuler un appel d'API - À remplacer par un vrai appel
      const mockUser: User = {
        id: '1',
        email,
        created_at: new Date().toISOString(),
        theme_preference: 'system',
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Valeur du contexte
  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
