import React, { useState, useEffect, useRef } from 'react';
import { PixelBoard } from '@/types';
import ApiService from '@/services/api.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import './../../styles/PixelBoardTimelapse.css';

interface PixelHistoryEntry {
  board_id: string;
  x: number;
  y: number;
  color: string;
  user_id?: string;
  user_email?: string;
  timestamp: string;
  user?: {
    email: string;
    id: string;
  };
}

interface PixelBoardTimelapseProps {
  boardId: string;
  width: number;
  height: number;
  onClose: () => void;
}

const PixelBoardTimelapse: React.FC<PixelBoardTimelapseProps> = ({
  boardId,
  width,
  height,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PixelHistoryEntry[]>([]);
  const [currentGrid, setCurrentGrid] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Empêcher la propagation des clics dans le contenu modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Fermer la modale quand on clique sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    // S'assurer qu'on a cliqué sur l'overlay et pas sur le contenu
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Charger l'historique du PixelBoard
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ApiService.get(`/pixelboards/${boardId}/history`);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          // Trier l'historique par ordre chronologique
          const sortedHistory = Array.isArray(response.data) ? [...response.data].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ) : [];
          // Mettre à jour l'état avec l'historique trié
          setHistory(sortedHistory);
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de l'historique");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [boardId]);

  // Mettre à jour la grille en fonction de l'étape actuelle
  useEffect(() => {
    if (history.length === 0) return;

    // Réinitialiser la grille
    const newGrid: Record<string, string> = {};

    // Appliquer tous les pixels jusqu'à l'étape actuelle
    for (let i = 0; i <= currentStep; i++) {
      if (i < history.length) {
        const entry = history[i];
        const key = `${entry.x},${entry.y}`;
        newGrid[key] = entry.color;
      }
    }

    setCurrentGrid(newGrid);
  }, [currentStep, history]);

  // Dessiner la grille actuelle sur le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculer la taille de chaque pixel
    const pixelSize = Math.min(
      canvas.width / width,
      canvas.height / height
    );

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner un fond blanc
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner chaque pixel
    Object.entries(currentGrid).forEach(([pos, color]) => {
      const [x, y] = pos.split(',').map(Number);

      ctx.fillStyle = color;
      ctx.fillRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize
      );
    });

    // Dessiner une grille si les pixels sont assez grands
    if (pixelSize > 2) {
      ctx.strokeStyle = '#EEEEEE';
      ctx.lineWidth = 0.5;

      // Lignes horizontales
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * pixelSize);
        ctx.lineTo(width * pixelSize, y * pixelSize);
        ctx.stroke();
      }

      // Lignes verticales
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * pixelSize, 0);
        ctx.lineTo(x * pixelSize, height * pixelSize);
        ctx.stroke();
      }
    }
  }, [currentGrid, width, height]);

  // Gérer l'animation automatique
  useEffect(() => {
    if (isPlaying && history.length > 0) {
      // Annuler toute animation en cours
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      let lastTime = 0;
      const interval = 1000 / (playbackSpeed * 2); // Ajuster la vitesse

      const animate = (timestamp: number) => {
        if (!lastTime) lastTime = timestamp;

        const elapsed = timestamp - lastTime;

        if (elapsed > interval) {
          // Passer à l'étape suivante
          setCurrentStep(prev => {
            const next = prev + 1;
            // Arrêter l'animation si on atteint la fin
            if (next >= history.length) {
              setIsPlaying(false);
              return prev;
            }
            return next;
          });

          lastTime = timestamp;
        }

        // Continuer l'animation si toujours en cours de lecture
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      // Nettoyage
      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying, history.length, playbackSpeed]);

  // Fonctions de contrôle du timelapse
  const handlePlay = () => {
    // Si on est à la fin, revenir au début
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStep(prev => Math.min(prev + 1, history.length - 1));
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackSpeed(Number(e.target.value));
  };

  // Fonction utilitaire pour extraire les informations utilisateur
  const getUserInfo = (entry: PixelHistoryEntry): string => {
    // Ordre de priorité pour trouver l'information sur l'utilisateur
    if (entry.user && entry.user.email) {
      return entry.user.email;
    }

    if (entry.user_email) {
      return entry.user_email;
    }

    if (entry.user_id) {
      return `Utilisateur #${entry.user_id.substring(0, 8)}`;
    }

    return 'Anonyme';
  };

  // Si le composant est en cours de chargement
  if (loading) {
    return (
      <div className="timelapse-modal" onClick={handleOverlayClick}>
        <div className="timelapse-content" onClick={handleContentClick}>
          <LoadingSpinner message="Chargement de l'historique du PixelBoard..." />
        </div>
      </div>
    );
  }

  // Si une erreur s'est produite
  if (error) {
    return (
      <div className="timelapse-modal" onClick={handleOverlayClick}>
        <div className="timelapse-content" onClick={handleContentClick}>
          <ErrorMessage message={error} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="close-button"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  // Si aucun historique n'a été trouvé
  if (history.length === 0) {
    return (
      <div className="timelapse-modal" onClick={handleOverlayClick}>
        <div className="timelapse-content" onClick={handleContentClick}>
          <div className="empty-message">
            <p>Aucun historique disponible pour ce PixelBoard.</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="close-button"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timelapse-modal" onClick={handleOverlayClick}>
      <div className="timelapse-content" onClick={handleContentClick}>
        <div className="timelapse-header">
          <h2>Timelapse du PixelBoard</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="close-button"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="timelapse-canvas-container">
          <canvas
            ref={canvasRef}
            width={width * 12} // Taille multipliée pour une meilleure qualité
            height={height * 12}
            className="timelapse-canvas"
          />
        </div>

        <div className="timelapse-info">
          {currentStep < history.length && (
            <div className="pixel-info">
              <p>
                Pixel ({history[currentStep].x}, {history[currentStep].y})
                placé par {getUserInfo(history[currentStep])}
                <span className="timestamp">
                  {new Date(history[currentStep].timestamp).toLocaleString()}
                </span>
              </p>
            </div>
          )}
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${(currentStep / Math.max(1, history.length - 1)) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {currentStep + 1} / {history.length}
          </div>
        </div>

        <div className="timelapse-controls">
          <div className="controls-left">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="control-button"
              aria-label="Revenir au début"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStepBackward();
              }}
              className="control-button"
              aria-label="Image précédente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
              </svg>
            </button>
            {isPlaying ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePause();
                }}
                className="play-button"
                aria-label="Pause"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay();
                }}
                className="play-button"
                aria-label="Lecture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStepForward();
              }}
              className="control-button"
              aria-label="Image suivante"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
              </svg>
            </button>
          </div>

          <div className="controls-right">
            <label htmlFor="speed-control">Vitesse:</label>
            <select
              id="speed-control"
              value={playbackSpeed}
              onChange={handleSpeedChange}
              onClick={(e) => e.stopPropagation()}
              className="speed-select"
            >
              <option value="0.5">0.5×</option>
              <option value="1">1×</option>
              <option value="2">2×</option>
              <option value="4">4×</option>
              <option value="8">8×</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelBoardTimelapse;
