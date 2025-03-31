import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour détecter et suivre la préférence de thème du système
 * @returns Booléen indiquant si le système préfère le thème sombre
 */
const useSystemTheme = (): boolean => {
  // Fonction mémorisée pour vérifier si le navigateur préfère le thème sombre
  const getSystemTheme = useCallback((): boolean => {
    if (typeof window === 'undefined') return false; // Évite les problèmes de SSR
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // État initial basé sur la préférence actuelle
  const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(getSystemTheme);

  // Utiliser une référence pour stocker le MediaQueryList
  const mediaQueryRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    // Créer le MediaQueryList une seule fois
    if (!mediaQueryRef.current) {
      mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)');
    }

    // Fonction pour mettre à jour l'état - définie une seule fois
    const handleChange = (event: MediaQueryListEvent): void => {
      setPrefersDarkMode(event.matches);
    };

    // Ajouter l'écouteur d'événement
    mediaQueryRef.current.addEventListener('change', handleChange);

    // Nettoyage à la démonture du composant
    return () => {
      if (mediaQueryRef.current) {
        mediaQueryRef.current.removeEventListener('change', handleChange);
      }
    };
  }, []);

  return prefersDarkMode;
};

export default useSystemTheme;
