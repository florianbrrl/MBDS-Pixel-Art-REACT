import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PixelBoardHeatmap from '@/components/pixel-board/PixelBoardHeatmap';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import './../../styles/PixelBoardHeatmapPage.css';

type TimeRangeType = 'all' | 'day' | 'week' | 'month';

const PixelBoardHeatmapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<PixelBoard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRangeType>('all');

  // Charger les données du PixelBoard
  useEffect(() => {
    const loadBoard = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await ApiService.getPixelBoardById(id);
        if (response.error) {
          setError(response.error);
        } else {
          setBoard(response.data || null);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du PixelBoard');
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [id]);

  // Gestionnaire pour changer la plage temporelle
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value as TimeRangeType);
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de la heatmap..." />;
  }

  if (error || !board) {
    return (
      <div className="heatmap-page">
        <ErrorMessage message={error || 'PixelBoard non trouvé'} />
        <button
          onClick={() => navigate('/pixel-boards')}
          className="button-back"
        >
          Retour aux PixelBoards
        </button>
      </div>
    );
  }

  return (
    <div className="heatmap-page">
      <div className="heatmap-header">
        <h1>Heatmap: {board.title}</h1>
        <p className="heatmap-description">
          Visualisation des zones les plus actives du PixelBoard
        </p>
      </div>

      <div className="heatmap-settings">
        <div className="time-range-selector">
          <label htmlFor="time-range">Période:</label>
          <select
            id="time-range"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="all">Tout l'historique</option>
            <option value="day">Dernières 24 heures</option>
            <option value="week">Dernière semaine</option>
            <option value="month">Dernier mois</option>
          </select>
        </div>

        <div className="board-info">
          <span>Dimensions: {board.width}×{board.height}</span>
          <span>Pixels placés: {Object.keys(board.grid).length}</span>
        </div>
      </div>

      <div className="heatmap-main">
        <PixelBoardHeatmap board={board} timeRange={timeRange} />
      </div>

      <div className="heatmap-legend">
        <h3>À propos de la heatmap</h3>
        <p>
          Cette visualisation montre les zones du PixelBoard qui ont reçu le plus d'activité,
          basée sur l'historique réel des placements de pixels.
          Les couleurs chaudes (rouge, orange) indiquent des zones où les pixels ont été placés ou modifiés
          de nombreuses fois, tandis que les couleurs froides (bleu, vert) indiquent des zones
          avec moins de modifications.
        </p>
        <div className="heatmap-insight">
          <h4>Analyse de l'activité</h4>
          <p>
            L'échelle de couleur est relative au nombre maximum de placements ({board ? Object.keys(board.grid).length : 0} pixels placés au total).
            Dans les zones rouges, les pixels ont été placés ou modifiés plusieurs fois, ce qui peut indiquer
            soit des zones de collaboration, soit des zones de conflit entre les participants.
          </p>
        </div>
        <ul>
          <li><span className="legend-color" style={{ backgroundColor: 'rgb(0, 0, 255)' }}></span> 1 placement (faible activité)</li>
          <li><span className="legend-color" style={{ backgroundColor: 'rgb(0, 255, 0)' }}></span> Quelques placements (activité modérée)</li>
          <li><span className="legend-color" style={{ backgroundColor: 'rgb(255, 255, 0)' }}></span> Nombreux placements (activité élevée)</li>
          <li><span className="legend-color" style={{ backgroundColor: 'rgb(255, 0, 0)' }}></span> Placements fréquents (activité très élevée)</li>
        </ul>
      </div>

      <div className="action-buttons">
        <button
          className="button-back"
          onClick={() => navigate(`/pixel-boards/${id}`)}
        >
          Retour au PixelBoard
        </button>
      </div>
    </div>
  );
};

export default PixelBoardHeatmapPage;
