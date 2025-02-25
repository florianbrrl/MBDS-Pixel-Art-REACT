import React, { createContext, useContext, useEffect, useState } from 'react';
import useSystemTheme from '@/hooks/useSystemTheme';

// Définir les types de thèmes possibles
type ThemeType = 'light' | 'dark' | 'system';
type ActualTheme = 'light' | 'dark';

// Structure du contexte
interface ThemeContextType {
  theme: ThemeType;
  currentTheme: ActualTheme; // Thème réellement appliqué
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void; // Fonction utilitaire pour basculer entre light et dark
}

// Créer le contexte avec une valeur par défaut
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte de thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Propriétés du provider
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Clé pour stocker le thème dans le localStorage
const THEME_STORAGE_KEY = 'pixelart-theme-preference';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Utiliser notre hook personnalisé pour détecter le thème du système
  const systemPrefersDark = useSystemTheme();
  
  // État pour le thème choisi par l'utilisateur
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Récupérer le thème du localStorage s'il existe
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
      return savedTheme || 'system';
    }
    return 'system';
  });

  // État pour le thème réellement appliqué (light ou dark)
  const [currentTheme, setCurrentTheme] = useState<ActualTheme>(
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : (theme as ActualTheme)
  );
  
  // Mettre à jour le thème réel lorsque la préférence utilisateur ou système change
  useEffect(() => {
    if (theme === 'system') {
      setCurrentTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setCurrentTheme(theme as ActualTheme);
    }
  }, [theme, systemPrefersDark]);

  // Appliquer la classe de thème au document HTML
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${currentTheme}-theme`);
  }, [currentTheme]);

  // Enregistrer la préférence dans le localStorage lorsque le thème change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  // Fonction pour basculer entre thème clair et sombre
  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  // Valeur du contexte
  const contextValue: ThemeContextType = {
    theme,
    currentTheme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
