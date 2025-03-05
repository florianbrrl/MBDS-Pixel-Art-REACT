import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`theme-selector ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="theme-select"
        aria-label="Sélectionner le thème"
      >
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
        <option value="system">Système</option>
      </select>
    </div>
  );
};

export default ThemeSelector;
