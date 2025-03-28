import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/SuperPixelBoard.css';
import LoadingSpinner from '../common/LoadingSpinner';
import { PixelBoard } from '@/types';
import PixelBoardService from '@/services/pixelboard.service';
import PixelHistoryTooltip from '../pixel-board/PixelHistoryTooltip';

interface SuperPixelBoardProps {
  boardsData: PixelBoard[];
  width: number;
  height: number;
  onPixelHover?: (x: number, y: number, color: string, boardId: string, boardTitle: string) => void;
}

const SuperPixelBoard: React.FC<SuperPixelBoardProps> = ({
  boardsData,
  width,
  height,
  onPixelHover
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(2.5);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{
    x: number;
    y: number;
    color: string;
    boardId: string;
    boardTitle: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [boardCoordinates, setBoardCoordinates] = useState<{
    [boardId: string]: { x: number; y: number }
  }>({});

  // États pour l'historique des pixels
  const [pixelHistory, setPixelHistory] = useState<any[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{left: number, top: number}>({left: 0, top: 0});
  const debounceTimerRef = useRef<number | null>(null);

  // Fonction pour charger l'historique d'un pixel
  const loadPixelHistory = async (boardId: string, x: number, y: number) => {
    if (!boardId) return;

    setHistoryLoading(true);
    try {
      const response = await PixelBoardService.getPixelHistory(boardId, x, y);
      if (response.data) {
        setPixelHistory(response.data);
      } else {
        setPixelHistory([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique du pixel:', error);
      setPixelHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Calculer la disposition optimale des tableaux
  const calculateBoardLayout = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const maxCanvasWidth = canvas.width;
    const maxCanvasHeight = canvas.height;

    // Calculer la taille d'un pixel en fonction du zoom
    const pixelSize = Math.max(1, zoom);

    // Coordonnées pour placer les boards sur la grille
    const coordinates: { [boardId: string]: { x: number; y: number } } = {};

    // Algorithme simple de placement (rectangles compacts)
    let currentX = 20 + offset.x;
    let currentY = 20 + offset.y;
    let rowHeight = 0;

    // Trier les tableaux par taille décroissante pour optimiser l'espace
    const sortedBoards = [...boardsData].sort((a, b) =>
      (b.width * b.height) - (a.width * a.height)
    );

    sortedBoards.forEach(board => {
      const boardWidth = board.width * pixelSize;
      const boardHeight = board.height * pixelSize;

      // Si le tableau ne tient pas sur la ligne actuelle, passer à la ligne suivante
      if (currentX + boardWidth + 20 > maxCanvasWidth) {
        currentX = 20 + offset.x;
        currentY += rowHeight + 20;
        rowHeight = 0;
      }

      // Enregistrer les coordonnées du tableau
      coordinates[board.id] = { x: currentX, y: currentY };

      // Mettre à jour les coordonnées pour le prochain tableau
      currentX += boardWidth + 40;
      rowHeight = Math.max(rowHeight, boardHeight);
    });

    setBoardCoordinates(coordinates);
  }, [boardsData, offset.x, offset.y, zoom]);

  // Trouver le tableau et les coordonnées du pixel à partir des coordonnées du canvas
  const canvasToPixel = useCallback((canvasX: number, canvasY: number) => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Convertir les coordonnées du client en coordonnées du canvas
    const x = (canvasX - rect.left) * (canvas.width / rect.width);
    const y = (canvasY - rect.top) * (canvas.height / rect.height);

    // Taille d'un pixel en fonction du zoom
    const pixelSize = Math.max(1, zoom);

    // Vérifier chaque tableau pour voir si les coordonnées sont dedans
    for (const board of boardsData) {
      const boardPos = boardCoordinates[board.id];
      if (!boardPos) continue;

      const boardX = boardPos.x;
      const boardY = boardPos.y;
      const boardWidth = board.width * pixelSize;
      const boardHeight = board.height * pixelSize;

      // Vérifier si les coordonnées sont dans ce tableau
      if (
        x >= boardX &&
        x < boardX + boardWidth &&
        y >= boardY &&
        y < boardY + boardHeight
      ) {
        // Calculer les coordonnées du pixel dans le tableau
        const pixelX = Math.floor((x - boardX) / pixelSize);
        const pixelY = Math.floor((y - boardY) / pixelSize);

        // Vérifier si le pixel est dans les limites du tableau
        if (
          pixelX >= 0 &&
          pixelX < board.width &&
          pixelY >= 0 &&
          pixelY < board.height
        ) {
          return {
            boardId: board.id,
            boardTitle: board.title,
            pixelX,
            pixelY
          };
        }
      }
    }

    return null;
  }, [boardsData, boardCoordinates, zoom]);

  // Dessiner tous les tableaux sur le canvas
  const drawBoards = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Définir la taille du canvas pour qu'il occupe tout l'espace disponible
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Calculer la disposition des tableaux avant de dessiner
    calculateBoardLayout();

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner un fond
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Taille d'un pixel en fonction du zoom
    const pixelSize = Math.max(1, zoom);

    // Dessiner chaque tableau
    boardsData.forEach(board => {
      const boardPos = boardCoordinates[board.id];
      if (!boardPos) return;

      const boardX = boardPos.x;
      const boardY = boardPos.y;
      const boardWidth = board.width * pixelSize;
      const boardHeight = board.height * pixelSize;

      // Dessiner un fond blanc pour le tableau
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boardX, boardY, boardWidth, boardHeight);

      // Dessiner les pixels du tableau
      Object.entries(board.grid).forEach(([pos, color]) => {
        const [x, y] = pos.split(',').map(Number);

        // Calculer la position du pixel sur le canvas
        const pixelX = boardX + x * pixelSize;
        const pixelY = boardY + y * pixelSize;

        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
      });

      // Dessiner une grille si le zoom est suffisant
      if (pixelSize >= 2) {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 0.5;

        // Lignes horizontales
        for (let y = 0; y <= board.height; y++) {
          ctx.beginPath();
          ctx.moveTo(boardX, boardY + y * pixelSize);
          ctx.lineTo(boardX + boardWidth, boardY + y * pixelSize);
          ctx.stroke();
        }

        // Lignes verticales
        for (let x = 0; x <= board.width; x++) {
          ctx.beginPath();
          ctx.moveTo(boardX + x * pixelSize, boardY);
          ctx.lineTo(boardX + x * pixelSize, boardY + boardHeight);
          ctx.stroke();
        }
      }

      // Dessiner le cadre du tableau
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.strokeRect(boardX, boardY, boardWidth, boardHeight);

      // Dessiner le titre du tableau en dessous (hors du tableau lui-même)
        ctx.fillStyle = '#000000';
        ctx.font = '12px sans-serif';

        // Texte complet du titre
        const fullTitle = `${board.title} (${board.width}×${board.height})`;

        // Mesurer la largeur du texte
        const textWidth = ctx.measureText(fullTitle).width;

        // Si le texte est plus large que le tableau, le tronquer
        if (textWidth > boardWidth) {
        // Tronquer le titre jusqu'à ce qu'il tienne
        let truncatedTitle = board.title;
        let metrics;

        // Réduire le titre caractère par caractère jusqu'à ce qu'il tienne avec l'ellipsis et les dimensions
        while (truncatedTitle.length > 3) {
            truncatedTitle = truncatedTitle.slice(0, -1);
            metrics = ctx.measureText(`${truncatedTitle}... (${board.width}×${board.height})`);
            if (metrics.width <= boardWidth) break;
        }

        // Dessiner le titre tronqué
        ctx.fillText(`${truncatedTitle}... (${board.width}×${board.height})`, boardX, boardY + boardHeight + 15);
        } else {
        // Dessiner le titre complet
        ctx.fillText(fullTitle, boardX, boardY + boardHeight + 15);
        }
    });

    // Dessiner l'indicateur de pixel survolé
    if (hoveredPixel) {
      const boardPos = boardCoordinates[hoveredPixel.boardId];
      if (boardPos) {
        const pixelX = boardPos.x + hoveredPixel.x * pixelSize;
        const pixelY = boardPos.y + hoveredPixel.y * pixelSize;

        // Dessiner un contour autour du pixel
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);
      }
    }

    setIsLoading(false);
  }, [boardsData, zoom, offset, hoveredPixel, boardCoordinates, calculateBoardLayout]);

  // Initialiser et dessiner le canvas au montage du composant
  useEffect(() => {
    drawBoards();

    // Ajouter un écouteur d'événement pour redimensionner le canvas lorsque la fenêtre change de taille
    const handleResize = () => {
      drawBoards();
    };

    window.addEventListener('resize', handleResize);

    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawBoards]);

  // Re-dessiner lorsque les données ou l'état changent
  useEffect(() => {
    drawBoards();
  }, [boardsData, zoom, offset, hoveredPixel, drawBoards]);

  // Gérer le mouvement de la souris
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      // Navigation par glisser-déposer
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setOffset({
        x: offset.x + deltaX,
        y: offset.y + deltaY
      });

      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    } else {
      // Détection du pixel survolé
      const pixelInfo = canvasToPixel(e.clientX, e.clientY);

      if (pixelInfo) {
        const { boardId, boardTitle, pixelX, pixelY } = pixelInfo;
        const board = boardsData.find(b => b.id === boardId);

        if (board) {
          const key = `${pixelX},${pixelY}`;
          const color = board.grid[key] || '#FFFFFF';

          const newHoveredPixel = {
            x: pixelX,
            y: pixelY,
            color,
            boardId,
            boardTitle
          };

          setHoveredPixel(newHoveredPixel);

          // Position pour l'info-bulle (fixée à côté du curseur)
          setTooltipPosition({
            left: e.clientX + 20,
            top: e.clientY - 20
          });

          // Annuler le précédent timer de debounce si existe
          if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current);
          }

          // Configurer un nouveau timer de debounce pour charger l'historique
          debounceTimerRef.current = window.setTimeout(() => {
            loadPixelHistory(boardId, pixelX, pixelY);
          }, 300);

          if (onPixelHover) {
            onPixelHover(pixelX, pixelY, color, boardId, boardTitle);
          }
        }
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
    // Utiliser le clic gauche + Alt ou le clic molette pour la navigation
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY
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

    // Ajuster le décalage pour zoomer vers/depuis le pointeur de la souris
    const newOffset = {
      x: offset.x - ((mouseX / zoom) * delta),
      y: offset.y - ((mouseY / zoom) * delta)
    };

    setZoom(newZoom);
    setOffset(newOffset);
  };

  // Fonctions de contrôle du zoom
  const zoomIn = () => {
    const newZoom = Math.min(10, zoom + 0.1);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(0.1, zoom - 0.1);
    setZoom(newZoom);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="super-pixelboard-container">
      <div className="super-pixelboard-controls">
        <div className="zoom-controls">
          <button onClick={zoomOut} disabled={zoom <= 0.1} title="Zoom out">
            <span>-</span>
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} disabled={zoom >= 10} title="Zoom in">
            <span>+</span>
          </button>
          <button onClick={resetView} title="Reset view">
            <span>↺</span>
          </button>
        </div>
        <div className="info-display">
          {hoveredPixel ? (
            <div className="pixel-info">
              <span className="board-name">{hoveredPixel.boardTitle}</span>
              <span>({hoveredPixel.x}, {hoveredPixel.y})</span>
              <div
                className="pixel-color"
                style={{ backgroundColor: hoveredPixel.color }}
                title={hoveredPixel.color}
              />
              {!historyLoading && pixelHistory && pixelHistory.length > 0 && (
                <span style={{ marginLeft: '8px' }}>
                  • Placé par {pixelHistory[0].user_email || 'Anonyme'}
                </span>
              )}
            </div>
          ) : (
            <span className="help-tip">Alt + glisser pour naviguer, molette pour zoomer</span>
          )}
        </div>
      </div>

      <div className="super-pixelboard-canvas-container">
        <canvas
          ref={canvasRef}
          className={`super-pixelboard-canvas ${isDragging ? 'dragging' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        />

        {isLoading && (
          <div className="loading-overlay">
            <LoadingSpinner />
          </div>
        )}

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
              zIndex: 9999
            }}
          />
        )}
      </div>

      <div className="boards-info">
        <div className="boards-count">
          {boardsData.length} {boardsData.length > 1 ? 'tableaux' : 'tableau'} chargés
        </div>
      </div>
    </div>
  );
};

export default SuperPixelBoard;
