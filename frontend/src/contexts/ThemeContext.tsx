import React, { createContext, useContext, useEffect, useState } from 'react';

// Types de thèmes disponibles
type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  actualTheme: 'light' | 'dark'; // Thème réellement appliqué
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

// Créer le contexte avec une valeur par défaut undefined
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte de thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Clé pour stocker le thème dans le localStorage
const THEME_STORAGE_KEY = 'pixelart-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hook pour détecter la préférence du système
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // État pour le thème choisi par l'utilisateur
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
      return savedTheme || 'system';
    }
    return 'system';
  });

  // État pour le thème réellement appliqué
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme
  );

  // Effet pour écouter les changements de préférence du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);

      if (theme === 'system') {
        setActualTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Ajouter l'écouteur d'événement
    mediaQuery.addEventListener('change', handleChange);

    // Nettoyage à la démonture du composant
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Mettre à jour le thème réel lorsque la préférence utilisateur change
  useEffect(() => {
    if (theme === 'system') {
      setActualTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setActualTheme(theme);
    }
  }, [theme, systemPrefersDark]);

  // Appliquer la classe de thème au document
  useEffect(() => {
    // Retirer toutes les classes de thème
    document.documentElement.classList.remove('light-theme', 'dark-theme');

    // Ajouter la classe du thème actuel
    document.documentElement.classList.add(`${actualTheme}-theme`);

    // Ajouter également une classe directement au body pour plus de fiabilité
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${actualTheme}-theme`);
  }, [actualTheme]);

  // Enregistrer la préférence dans le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  // Fonction pour basculer entre thème clair et sombre
  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  // Valeur du contexte
  const contextValue: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
