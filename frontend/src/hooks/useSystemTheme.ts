import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour détecter et suivre la préférence de thème du système
 * @returns Booléen indiquant si le système préfère le thème sombre
 */
const useSystemTheme = (): boolean => {
  // Vérifie si le navigateur préfère le thème sombre
  const getSystemTheme = (): boolean => {
    if (typeof window === 'undefined') return false; // Évite les problèmes de SSR
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // État initial basé sur la préférence actuelle
  const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(getSystemTheme());

  useEffect(() => {
    // Créer le MediaQueryList
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Fonction pour mettre à jour l'état
    const handleChange = (event: MediaQueryListEvent): void => {
      setPrefersDarkMode(event.matches);
    };

    // Ajouter l'écouteur d'événement
    mediaQuery.addEventListener('change', handleChange);
    
    // Nettoyage à la démonture du composant
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersDarkMode;
};

export default useSystemTheme;
