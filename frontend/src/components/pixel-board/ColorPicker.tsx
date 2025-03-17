import React, { useState } from 'react';
import './../../styles/ColorPicker.css';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  availableColors?: string[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
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
    <div className="color-picker">
      <h3 className="color-picker-title">Palette de couleurs</h3>

      <div className="selected-color-display">
        <div
          className="selected-color-swatch"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="selected-color-value">{selectedColor}</span>
      </div>

      <div className="color-grid">
        {availableColors.map((color) => (
          <button
            key={color}
            className={`color-swatch ${color === selectedColor ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            title={color}
            aria-label={`Sélectionner la couleur ${color}`}
          />
        ))}

        <button
          className="custom-color-button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          title="Couleur personnalisée"
        >
          +
        </button>
      </div>

      {showCustomPicker && (
        <div className="custom-color-picker">
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
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
