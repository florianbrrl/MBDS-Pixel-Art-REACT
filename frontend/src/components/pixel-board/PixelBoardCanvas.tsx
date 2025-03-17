import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PixelBoard } from '@/types';
import './../../styles/PixelBoardCanvas.css';

interface PixelBoardCanvasProps {
  board: PixelBoard;
  readOnly?: boolean;
  onPixelClick?: (x: number, y: number) => void;
  selectedColor?: string;
}

const PixelBoardCanvas: React.FC<PixelBoardCanvasProps> = ({
  board,
  readOnly = false,
  onPixelClick,
  selectedColor = '#000000',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  const [lastPlacedPixel, setLastPlacedPixel] = useState<{ x: number; y: number } | null>(null);
  const [showPlacementAnimation, setShowPlacementAnimation] = useState<boolean>(false);

  // Calculer la taille de pixel basée sur la taille du canvas et le zoom
  const calculatePixelSize = useCallback((): number => {
    if (!canvasRef.current) return 0;

    const containerWidth = canvasRef.current.width;
    const containerHeight = canvasRef.current.height;

    // Prendre la plus petite dimension pour garantir que tout le board est visible
    const maxDimension = Math.max(board.width, board.height);
    const basePixelSize = Math.min(containerWidth / board.width, containerHeight / board.height);

    return basePixelSize * zoom;
  }, [board.width, board.height, zoom]);

  // Fonction pour convertir les coordonnées du canvas en coordonnées de la grille
  const canvasToGrid = useCallback(
    (canvasX: number, canvasY: number): { x: number; y: number } | null => {
      if (!canvasRef.current) return null;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Coordonnées ajustées au scaling du canvas
      const x = (canvasX - rect.left) * scaleX;
      const y = (canvasY - rect.top) * scaleY;

      const pixelSize = calculatePixelSize();

      // Convertir en coordonnées de grille en tenant compte du zoom et du décalage
      const gridX = Math.floor((x - offset.x) / pixelSize);
      const gridY = Math.floor((y - offset.y) / pixelSize);

      // Vérifier si les coordonnées sont dans les limites du board
      if (gridX >= 0 && gridX < board.width && gridY >= 0 && gridY < board.height) {
        return { x: gridX, y: gridY };
      }

      return null;
    },
    [calculatePixelSize, board.width, board.height, offset.x, offset.y],
  );

  // Dessiner le tableau de pixels avec les améliorations visuelles
  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pixelSize = calculatePixelSize();

    // Dessiner la grille de fond
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner chaque pixel
    Object.entries(board.grid).forEach(([pos, color]) => {
      const [x, y] = pos.split(',').map(Number);

      // Calculer la position sur le canvas avec le zoom et le décalage
      const canvasX = x * pixelSize + offset.x;
      const canvasY = y * pixelSize + offset.y;

      // Vérifier si le pixel est visible
      if (
        canvasX + pixelSize >= 0 &&
        canvasY + pixelSize >= 0 &&
        canvasX < canvas.width &&
        canvasY < canvas.height
      ) {
        ctx.fillStyle = color;
        ctx.fillRect(canvasX, canvasY, pixelSize, pixelSize);
      }
    });

    // Dessiner les lignes de la grille
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;

    // Lignes horizontales
    for (let y = 0; y <= board.height; y++) {
      const canvasY = y * pixelSize + offset.y;
      if (canvasY >= 0 && canvasY <= canvas.height) {
        ctx.beginPath();
        ctx.moveTo(offset.x, canvasY);
        ctx.lineTo(board.width * pixelSize + offset.x, canvasY);
        ctx.stroke();
      }
    }

    // Lignes verticales
    for (let x = 0; x <= board.width; x++) {
      const canvasX = x * pixelSize + offset.x;
      if (canvasX >= 0 && canvasX <= canvas.width) {
        ctx.beginPath();
        ctx.moveTo(canvasX, offset.y);
        ctx.lineTo(canvasX, board.height * pixelSize + offset.y);
        ctx.stroke();
      }
    }

    // Dessiner un aperçu du pixel survolé
    if (hoveredPixel && !readOnly) {
      const canvasX = hoveredPixel.x * pixelSize + offset.x;
      const canvasY = hoveredPixel.y * pixelSize + offset.y;

      // Dessiner une bordure autour du pixel survolé
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(canvasX, canvasY, pixelSize, pixelSize);

      // Dessiner un aperçu semi-transparent
      ctx.fillStyle = `${selectedColor}80`; // 50% de transparence
      ctx.fillRect(canvasX, canvasY, pixelSize, pixelSize);
    }

    // Dessiner l'animation de placement de pixel
    if (showPlacementAnimation && lastPlacedPixel) {
      const canvasX = lastPlacedPixel.x * pixelSize + offset.x;
      const canvasY = lastPlacedPixel.y * pixelSize + offset.y;

      // Créer un effet de "pulsation"
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(canvasX - 2, canvasY - 2, pixelSize + 4, pixelSize + 4);
    }
  }, [
    board.grid,
    board.height,
    board.width,
    calculatePixelSize,
    hoveredPixel,
    lastPlacedPixel,
    offset.x,
    offset.y,
    readOnly,
    selectedColor,
    showPlacementAnimation,
  ]);

  // Gérer le redimensionnement du canvas
  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const container = canvas.parentElement;

      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawBoard();
      }
    };

    // Appel initial
    resizeCanvas();

    // Ajouter un écouteur d'événement pour redimensionner le canvas lorsque la fenêtre change de taille
    window.addEventListener('resize', resizeCanvas);

    // Nettoyage
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [drawBoard]);

  // Re-dessiner le board lorsqu'il change
  useEffect(() => {
    drawBoard();
  }, [board, zoom, offset, hoveredPixel, drawBoard]);

  // Effet pour l'animation de placement de pixel
  useEffect(() => {
    if (!lastPlacedPixel) return;

    setShowPlacementAnimation(true);

    // Masquer l'animation après 500ms
    const timer = setTimeout(() => {
      setShowPlacementAnimation(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [lastPlacedPixel]);

  // Gérer le clic sur un pixel - amélioré avec animation
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !onPixelClick) return; // Changé de onPixelPlaced à onPixelClick

    const gridCoords = canvasToGrid(e.clientX, e.clientY);
    if (gridCoords) {
      onPixelClick(gridCoords.x, gridCoords.y); // Changé de onPixelPlaced à onPixelClick

      // Déclencher l'animation de placement
      setLastPlacedPixel(gridCoords);
    }
  };

  // Gérer le mouvement de la souris pour la prévisualisation
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      // Navigation par glisser-déposer
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setOffset({
        x: offset.x + deltaX,
        y: offset.y + deltaY,
      });

      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    } else if (!readOnly) {
      // Prévisualisation du pixel survolé
      const gridCoords = canvasToGrid(e.clientX, e.clientY);
      setHoveredPixel(gridCoords);
    }
  };

  // Gérer le début du glisser-déposer
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Utiliser le bouton du milieu ou la touche Alt pour la navigation
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
      e.preventDefault();
    }
  };

  // Gérer la fin du glisser-déposer
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Gérer la sortie de la souris du canvas
  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredPixel(null);
  };

  // Gérer le zoom avec la molette de la souris
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const zoomFactor = 0.1;
    const delta = e.deltaY < 0 ? zoomFactor : -zoomFactor;

    // Limiter le zoom entre 0.1 et 10
    const newZoom = Math.max(0.1, Math.min(10, zoom + delta));

    // Calculer le point de référence pour le zoom (position de la souris)
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Ajuster l'offset pour zoomer vers/depuis le point de la souris
    const scaleChange = newZoom / zoom;

    setZoom(newZoom);
    setOffset({
      x: mouseX - (mouseX - offset.x) * scaleChange,
      y: mouseY - (mouseY - offset.y) * scaleChange,
    });
  };

  // Gérer les boutons de zoom
  const handleZoomIn = () => {
    const newZoom = Math.min(10, zoom + 0.1);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom - 0.1);
    setZoom(newZoom);
  };

  const handleResetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="pixel-board-canvas-container">
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className={`pixel-board-canvas ${isDragging ? 'dragging' : ''} ${readOnly ? 'read-only' : ''}`}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        />
      </div>

      <div className="canvas-controls">
        <div className="zoom-info">Zoom: {Math.round(zoom * 100)}%</div>
        <div className="zoom-controls">
          <button onClick={handleZoomOut} disabled={zoom <= 0.1} title="Réduire">
            -
          </button>
          <button onClick={handleResetZoom} title="Réinitialiser le zoom">
            Reset
          </button>
          <button onClick={handleZoomIn} disabled={zoom >= 10} title="Agrandir">
            +
          </button>
        </div>

        {hoveredPixel && (
          <div className="position-info">
            Position: ({hoveredPixel.x}, {hoveredPixel.y})
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelBoardCanvas;
