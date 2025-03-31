import React, { memo, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import './../../styles/theme-selector.css';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  // Utiliser useCallback pour éviter de recréer cette fonction à chaque rendu
  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as 'light' | 'dark' | 'system');
  }, [setTheme]);

  return (
    <div className="theme-selector">
      <label htmlFor="theme-select">Thème:</label>
      <select
        id="theme-select"
        value={theme}
        onChange={handleThemeChange}
        className="theme-select"
      >
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
        <option value="system">Système</option>
      </select>
    </div>
  );
};

// Utiliser memo pour éviter les rendus inutiles
export default memo(ThemeSelector);
