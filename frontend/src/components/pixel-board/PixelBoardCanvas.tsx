import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PixelBoard } from '@/types';
import PixelHistoryTooltip from './PixelHistoryTooltip';
import { PixelBoardService } from '@/services/api.service';
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
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // États pour l'historique des pixels
  const [pixelHistory, setPixelHistory] = useState<any[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  // Fonction pour charger l'historique d'un pixel
  const loadPixelHistory = async (x: number, y: number) => {
    if (!board || !board.id) return;

    setHistoryLoading(true);
    try {
      const response = await PixelBoardService.getPixelHistory(board.id, x, y);
      if (response.data) {
        setPixelHistory(response.data as any[]);
      } else {
        setPixelHistory([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique du pixel:", error);
      setPixelHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Calculer la taille de pixel basée sur la taille du canvas et le zoom
  const calculatePixelSize = useCallback((): number => {
    if (!canvasRef.current) return 0;

    const containerWidth = canvasRef.current.width;
    const containerHeight = canvasRef.current.height;

    // Prendre la plus petite dimension pour garantir que tout le board est visible
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

        // Ajouter une légère bordure aux pixels si la grille est désactivée
        if (!showGrid && pixelSize > 2) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(canvasX, canvasY, pixelSize, pixelSize);
        }
      }
    });

    // Dessiner une bordure autour du tableau de pixels
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      offset.x,
      offset.y,
      board.width * pixelSize,
      board.height * pixelSize
    );

    // Dessiner les lignes de la grille seulement si showGrid est true
    if (showGrid) {
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
    showGrid,
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
    if (readOnly || !onPixelClick) return;

    const gridCoords = canvasToGrid(e.clientX, e.clientY);
    if (gridCoords) {
      onPixelClick(gridCoords.x, gridCoords.y);

      // Déclencher l'animation de placement
      setLastPlacedPixel(gridCoords);
    }
  };

  // Variable pour stocker le timer de debounce
  const debounceTimerRef = useRef<number | null>(null);

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
    } else {
      // Prévisualisation du pixel survolé
      const gridCoords = canvasToGrid(e.clientX, e.clientY);

      if (gridCoords) {
        setHoveredPixel(gridCoords);

        // Position pour l'info-bulle (fixée à côté du curseur)
        setTooltipPosition({
          left: e.clientX + 20,
          top: e.clientY - 20,
        });

        // Annuler le précédent timer de debounce si existe
        if (debounceTimerRef.current) {
          window.clearTimeout(debounceTimerRef.current);
        }

        // Configurer un nouveau timer de debounce pour charger l'historique
        debounceTimerRef.current = window.setTimeout(() => {
          loadPixelHistory(gridCoords.x, gridCoords.y);
        }, 300);
      } else {
        setHoveredPixel(null);
        setPixelHistory(null);

        // Annuler le timer de debounce existant
        if (debounceTimerRef.current) {
          window.clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      }
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
    setPixelHistory(null);

    // Annuler tout timer de debounce en cours
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
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

  // Gestionnaire pour zoomer avec la molette de souris
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    // Empêcher le comportement par défaut (le scroll de la page)
    e.preventDefault();

    // Déterminer la direction du zoom (positif = zoom in, négatif = zoom out)
    const delta = -Math.sign(e.deltaY);
    const factor = 0.1; // Facteur de zoom par incrément

    // Calculer le nouveau zoom
    const newZoom = Math.max(0.1, Math.min(10, zoom + delta * factor));

    // Position du curseur par rapport au canvas
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Position du point sous le curseur avant le zoom
    const beforeZoomX = (mouseX - offset.x) / zoom;
    const beforeZoomY = (mouseY - offset.y) / zoom;

    // Position du point après le zoom
    const afterZoomX = (mouseX - offset.x) / newZoom;
    const afterZoomY = (mouseY - offset.y) / newZoom;

    // Ajuster l'offset pour maintenir le point sous le curseur
    const newOffsetX = offset.x + (beforeZoomX - afterZoomX) * newZoom;
    const newOffsetY = offset.y + (beforeZoomY - afterZoomY) * newZoom;

    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  }, [zoom, offset]);

  useEffect(() => {
    const centerBoard = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const container = canvas.parentElement;

      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const pixelSize = calculatePixelSize();

        // Calculer le décalage pour centrer le tableau
        const offsetX = (containerWidth - board.width * pixelSize) / 2;
        const offsetY = (containerHeight - board.height * pixelSize) / 2;

        setOffset({ x: offsetX, y: offsetY });
      }
    };

    centerBoard();
  }, [board.width, board.height, calculatePixelSize]);

  // Ajouter ce useEffect après vos autres useEffects

  // Empêcher le scroll de la page quand on utilise la molette sur le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefaultScroll = (e: WheelEvent) => {
      e.preventDefault();
      return false;
    };

    // Ajouter l'écouteur d'événement avec passive: false pour autoriser preventDefault()
    canvas.addEventListener('wheel', preventDefaultScroll, { passive: false });

    // Nettoyage lors du démontage du composant
    return () => {
      canvas.removeEventListener('wheel', preventDefaultScroll);
    };
  }, []);

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

        {/* Affichage de l'historique du pixel au survol */}
        {hoveredPixel && pixelHistory && pixelHistory.length > 0 && (
          <PixelHistoryTooltip
            history={pixelHistory}
            loading={historyLoading}
            position={hoveredPixel}
            style={{
              position: 'fixed',
              left: Math.min(tooltipPosition.left, window.innerWidth - 200),
              top: Math.min(tooltipPosition.top - 40, window.innerHeight - 100),
              zIndex: 9999,
            }}
          />
        )}
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

        {/* Bouton pour activer/désactiver la grille */}
        <button
          className={`grid-toggle-button ${showGrid ? 'active-button' : ''}`}
          onClick={() => setShowGrid(!showGrid)}
          title={showGrid ? "Désactiver la grille" : "Activer la grille"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z"></path>
            <path d="M3 9h18"></path>
            <path d="M3 15h18"></path>
            <path d="M9 3v18"></path>
            <path d="M15 3v18"></path>
          </svg>
          {showGrid ? "Grille On" : "Grille Off"}
        </button>

        <div className="position-info">
          Position: ({hoveredPixel?.x ?? 0}, {hoveredPixel?.y ?? 0})
          {!historyLoading && pixelHistory && pixelHistory.length > 0 && (
            <span style={{ marginLeft: '8px' }}>
              • Placé par {pixelHistory[0].user_email || 'Anonyme'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PixelBoardCanvas;
