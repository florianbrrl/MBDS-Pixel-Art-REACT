import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
  const [theme, setThemeState] = useState<ThemeType>(() => {
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

  // Fonction optimisée pour définir le thème
  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  }, []);

  // Fonction optimisée pour basculer entre thème clair et sombre
  const toggleTheme = useCallback(() => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [actualTheme, setTheme]);

  // Effet pour écouter les changements de préférence du système - optimisé avec useCallback
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    // Ajouter l'écouteur d'événement
    mediaQuery.addEventListener('change', handleChange);

    // Nettoyage à la démonture du composant
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Mettre à jour le thème réel lorsque la préférence utilisateur change
  useEffect(() => {
    if (theme === 'system') {
      setActualTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setActualTheme(theme);
    }
  }, [theme, systemPrefersDark]);

  // Appliquer la classe de thème au document - optimisé pour réduire les opérations DOM
  useEffect(() => {
    // On n'ajoute que les classes nécessaires sans réinitialiser à chaque fois
    if (actualTheme === 'dark') {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }, [actualTheme]);

  // Valeur du contexte mémorisée
  const contextValue = React.useMemo(
    () => ({
      theme,
      actualTheme,
      setTheme,
      toggleTheme
    }),
    [theme, actualTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
