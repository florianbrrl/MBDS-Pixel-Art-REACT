import React, { useState, useEffect } from 'react';
import { PixelBoard } from '@/types';
import PixelBoardCanvas from './PixelBoardCanvas';
import PixelBoardInfo from './PixelBoardInfo';
import ColorPicker from './ColorPicker';
import './../../styles/PixelBoardDisplay.css';

interface PixelBoardDisplayProps {
  board: PixelBoard;
  readOnly?: boolean;
  onPixelPlaced?: (x: number, y: number, color: string) => void;
  selectedColor?: string;
  canEdit?: boolean;
  onColorSelect?: (color: string) => void;
}

const PixelBoardDisplay: React.FC<PixelBoardDisplayProps> = ({
  board,
  readOnly = false,
  onPixelPlaced,
  selectedColor = '#000000',
  canEdit = false,
}) => {
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [notification, setNotification] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Détecter si l'appareil est mobile ou desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Vérification initiale
    checkMobile();

    // Ajouter un écouteur pour le redimensionnement
    window.addEventListener('resize', checkMobile);

    // Nettoyer l'écouteur lorsque le composant est démonté
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const handlePixelClick = (x: number, y: number) => {
    if (readOnly || !onPixelPlaced) return;

    // Vérifier si on peut écraser le pixel
    const pixelKey = `${x},${y}`;
    if (board.grid[pixelKey] && !board.allow_overwrite) {
      setNotification('Ce pixel ne peut pas être modifié');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Appeler la fonction parente sans afficher directement une notification
    onPixelPlaced(x, y, currentColor);
  };

  return (
    <div className="pixel-board-display">
      {notification && <div className="pixel-notification">{notification}</div>}

      <div className="display-container with-compact-layout">
        <div className="canvas-panel expanded">
          <PixelBoardCanvas
            board={board}
            readOnly={readOnly}
            onPixelClick={handlePixelClick}
            selectedColor={currentColor}
          />
        </div>

        <div className="side-panel">
          <div className="pixel-board-info">
            <PixelBoardInfo board={board} />
          </div>

          {canEdit && !readOnly && (
            <div className="compact-color-picker">
              <ColorPicker
                selectedColor={currentColor}
                onColorSelect={handleColorChange}
                isCompact={true}
                availableColors={isMobile ? [
                  '#000000', // Noir
                  '#FFFFFF', // Blanc
                  '#FF0000', // Rouge
                  '#00FF00', // Vert
                  '#0000FF', // Bleu
                  '#FFFF00', // Jaune
                  '#FF00FF', // Magenta
                  '#00FFFF', // Cyan
                ] : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PixelBoardDisplay;
