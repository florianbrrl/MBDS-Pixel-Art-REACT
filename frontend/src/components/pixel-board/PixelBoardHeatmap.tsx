import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import '../../styles/PixelBoardHeatmap.css';

interface PixelBoardHeatmapProps {
  board: PixelBoard;
  timeRange?: 'all' | 'day' | 'week' | 'month';
}

const PixelBoardHeatmap: React.FC<PixelBoardHeatmapProps> = ({
  board,
  timeRange = 'all'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [maxDensity, setMaxDensity] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculer les données de heatmap à partir de l'historique des pixels
  const calculateHeatmap = useCallback(async () => {
    setLoading(true);

    try {
      // Récupérer l'historique réel des placements de pixels depuis l'API
      const response = await fetch(`/api/pixelboards/${board.id}/history?timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données d\'historique');
      }

      const historyData = await response.json();
      const pixelHistory = historyData.data || [];

      // Calculer la fréquence de placement pour chaque position
      const heatmap: Record<string, number> = {};
      let max = 0;

      // Parcourir l'historique pour compter les placements à chaque position
      pixelHistory.forEach((entry: any) => {
        const key = `${entry.x},${entry.y}`;
        heatmap[key] = (heatmap[key] || 0) + 1;

        if (heatmap[key] > max) {
          max = heatmap[key];
        }
      });

      // Si aucune donnée d'historique n'est disponible, utiliser la grille actuelle
      if (Object.keys(heatmap).length === 0) {
        // Initialiser avec la grille actuelle (chaque pixel a été placé au moins une fois)
        Object.keys(board.grid).forEach(pos => {
          heatmap[pos] = 1;
        });
        max = 1;
      }

      setHeatmapData(heatmap);
      setMaxDensity(max);
    } catch (error) {
      console.error('Erreur lors du calcul de la heatmap:', error);

      // En cas d'erreur, initialiser avec des données de base
      const heatmap: Record<string, number> = {};

      // Utiliser la grille actuelle comme fallback
      Object.keys(board.grid).forEach(pos => {
        heatmap[pos] = 1;
      });

      setHeatmapData(heatmap);
      setMaxDensity(1);
    } finally {
      setLoading(false);
    }
  }, [board, timeRange]);

  // Fonction pour obtenir la couleur en fonction de la densité
  const getHeatColor = (density: number): string => {
    // Normaliser la densité entre 0 et 1
    const normalized = Math.min(density / maxDensity, 1);

    // Palette de couleurs: bleu (faible) -> vert -> jaune -> rouge (élevée)
    if (normalized < 0.25) {
      // Bleu à cyan
      const g = Math.floor(255 * (normalized * 4));
      return `rgb(0, ${g}, 255)`;
    } else if (normalized < 0.5) {
      // Cyan à vert
      const b = Math.floor(255 * (1 - (normalized - 0.25) * 4));
      return `rgb(0, 255, ${b})`;
    } else if (normalized < 0.75) {
      // Vert à jaune
      const r = Math.floor(255 * ((normalized - 0.5) * 4));
      return `rgb(${r}, 255, 0)`;
    } else {
      // Jaune à rouge
      const g = Math.floor(255 * (1 - (normalized - 0.75) * 4));
      return `rgb(255, ${g}, 0)`;
    }
  };

  // Dessiner le heatmap sur le canvas
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adapter la taille du canvas au conteneur
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner un fond gris clair
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Taille d'un pixel en fonction du zoom
    const pixelSize = Math.max(1, Math.min(20, zoom * 5));

    // Offset ajusté pour centrer la grille
    const offsetX = offset.x + (canvas.width - board.width * pixelSize) / 2;
    const offsetY = offset.y + (canvas.height - board.height * pixelSize) / 2;

    // Dessiner une grille légère
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    // Lignes horizontales
    for (let y = 0; y <= board.height; y++) {
      const yPos = offsetY + y * pixelSize;
      ctx.beginPath();
      ctx.moveTo(offsetX, yPos);
      ctx.lineTo(offsetX + board.width * pixelSize, yPos);
      ctx.stroke();
    }

    // Lignes verticales
    for (let x = 0; x <= board.width; x++) {
      const xPos = offsetX + x * pixelSize;
      ctx.beginPath();
      ctx.moveTo(xPos, offsetY);
      ctx.lineTo(xPos, offsetY + board.height * pixelSize);
      ctx.stroke();
    }

    // Dessiner le heatmap
    Object.entries(heatmapData).forEach(([pos, density]) => {
      const [x, y] = pos.split(',').map(Number);

      // Calculer la position sur le canvas
      const canvasX = offsetX + x * pixelSize;
      const canvasY = offsetY + y * pixelSize;

      // Définir la couleur en fonction de la densité
      ctx.fillStyle = getHeatColor(density);
      ctx.fillRect(canvasX, canvasY, pixelSize, pixelSize);

      // Ajouter une bordure subtile
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.strokeRect(canvasX, canvasY, pixelSize, pixelSize);
    });

    // Ajouter une légende sur le canvas
    drawLegend(ctx, canvas.width, canvas.height);

  }, [board, heatmapData, maxDensity, zoom, offset]);

  // Fonction pour dessiner la légende
  const drawLegend = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const legendWidth = 200;
    const legendHeight = 40;
    const legendX = width - legendWidth - 20;
    const legendY = height - legendHeight - 20;

    // Fond de la légende
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    ctx.strokeStyle = '#ccc';
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    // Gradient de couleurs
    const gradientWidth = legendWidth - 40;
    const gradientX = legendX + 20;
    const gradientY = legendY + 10;

    // Dessiner le gradient
    for (let i = 0; i < gradientWidth; i++) {
      const ratio = i / gradientWidth;
      ctx.fillStyle = getHeatColor(ratio * maxDensity);
      ctx.fillRect(gradientX + i, gradientY, 1, 20);
    }

    // Texte de la légende
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.fillText('Faible', gradientX, gradientY + 35);
    ctx.fillText('Élevée', gradientX + gradientWidth - 30, gradientY + 35);
  };

  // Calculer les données initiales
  useEffect(() => {
    calculateHeatmap();

    // Ajouter un message de log pour la période sélectionnée
    console.log(`Chargement des données de heatmap pour la période: ${timeRange}`);

    // Si la période est 'all', on peut indiquer qu'on charge l'historique complet
    if (timeRange === 'all') {
      console.log(`Chargement de tout l'historique pour le tableau ${board.id}`);
    } else {
      // Convertir la période en texte plus explicite
      const periodText =
        timeRange === 'day' ? 'dernières 24 heures' :
        timeRange === 'week' ? 'dernière semaine' :
        timeRange === 'month' ? 'dernier mois' : 'période inconnue';

      console.log(`Filtrage des données pour les ${periodText}`);
    }
  }, [calculateHeatmap, timeRange, board.id]);

  // Dessiner/redessiner le heatmap
  useEffect(() => {
    if (!loading) {
      drawHeatmap();
    }
  }, [drawHeatmap, loading, zoom, offset]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      drawHeatmap();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawHeatmap]);

  // Gestionnaires d'événements pour l'interactivité
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Clic gauche
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    // Facteur de zoom: négatif pour zoom out, positif pour zoom in
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;

    // Limiter le zoom entre 0.5 et 5
    const newZoom = Math.max(0.5, Math.min(5, zoom + zoomFactor));

    setZoom(newZoom);
  };

  const zoomIn = () => {
    setZoom(Math.min(5, zoom + 0.1));
  };

  const zoomOut = () => {
    setZoom(Math.max(0.5, zoom - 0.1));
  };

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-controls">
        <div className="zoom-controls">
          <button onClick={zoomOut} disabled={zoom <= 0.5}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} disabled={zoom >= 5}>+</button>
          <button onClick={resetZoom}>Reset</button>
        </div>
        <div className="heatmap-info">
          <span>Densité maximale: {maxDensity} placements</span>
        </div>
      </div>

      <div className="heatmap-canvas-container">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <canvas
            ref={canvasRef}
            className={`heatmap-canvas ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          />
        )}
      </div>
    </div>
  );
};

export default PixelBoardHeatmap;
