import React, { useState, useEffect } from 'react';
import './../../styles/ColorPicker.css';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  availableColors?: string[];
  isCompact?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  isCompact = false,
  availableColors = [
    '#000000', // Noir
    '#FFFFFF', // Blanc
    '#FF0000', // Rouge
    '#00FF00', // Vert
    '#0000FF', // Bleu
    '#FFFF00', // Jaune
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Violet
    '#008000', // Vert foncé
    '#800000', // Marron
    '#808080', // Gris
    '#FFC0CB', // Rose
    '#A52A2A', // Brun
    '#FFD700', // Or
  ],
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState(selectedColor);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Écouter les changements de taille de fenêtre
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Déterminer le nombre de couleurs à afficher en fonction de la taille d'écran et du mode
  const getDisplayColors = () => {
    if (isCompact) {
      // En mode compact, on adapte selon la largeur de l'écran
      if (windowWidth <= 480) {
        // Sur très petits écrans, seulement 4 couleurs
        return availableColors.slice(0, 4);
      } else if (windowWidth <= 768) {
        // Sur tablettes, 8 couleurs
        return availableColors.slice(0, 8);
      } else {
        // Sur desktop, toujours 8 couleurs en compact
        return availableColors.slice(0, 8);
      }
    } else {
      // En mode normal, ajuster selon la taille d'écran
      if (windowWidth <= 640) {
        // Sur mobile, réduire à 8 couleurs
        return availableColors.slice(0, 8);
      } else {
        // Sinon, toutes les couleurs
        return availableColors;
      }
    }
  };

  const displayColors = getDisplayColors();

  const handleColorClick = (color: string) => {
    onColorSelect(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleCustomColorSelect = () => {
    onColorSelect(customColor);
    setShowCustomPicker(false);
  };

  return (
    <div className={`color-picker ${isCompact ? 'compact' : ''}`}>
      <h3 className="color-picker-title">
        {isCompact ? 'Couleurs' : 'Palette de couleurs'}
      </h3>

      <div className={`selected-color-display ${isCompact ? 'compact' : ''}`}>
        <div
          className="selected-color-swatch"
          style={{ backgroundColor: selectedColor }}
        />
        {!isCompact && <span className="selected-color-value">{selectedColor}</span>}
      </div>

      <div className={`color-grid ${isCompact ? 'compact-grid' : ''}`}>
        {displayColors.map((color) => (
          <button
            key={color}
            className={`color-swatch ${color === selectedColor ? 'active' : ''} ${isCompact ? 'small' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            title={color}
            aria-label={`Sélectionner la couleur ${color}`}
          />
        ))}

        <button
          className={`custom-color-button ${isCompact ? 'small' : ''}`}
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          title="Couleur personnalisée"
        >
          +
        </button>
      </div>

      {showCustomPicker && (
        <div className={`custom-color-picker ${isCompact ? 'compact' : ''}`}>
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="custom-color-input"
          />
          <button
            className="custom-color-apply"
            onClick={handleCustomColorSelect}
          >
            {isCompact ? 'OK' : 'Appliquer'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
