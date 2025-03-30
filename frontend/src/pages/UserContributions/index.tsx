import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { PixelBoard } from '@/types';
import ApiService from '@/services/api.service';
import './../../styles/user-contributions.css';

type PeriodType = 'day' | 'week' | 'month' | 'all';

interface ProcessedContributions {
  totalPixels: number;
  boardData: {
    boardId: string;
    boardName: string;
    pixelCount: number;
    percentage: number;
  }[];
  timeSeriesData: {
    date: string;
    count: number;
  }[];
}

interface TimelineResponse {
  totalPixels: number;
  timelineData: {
    date: string;
    count: number;
  }[];
}

const UserContributionsPage: React.FC = () => {
  const { currentUser, getUserContributions } = useAuth();
  const [contributions, setContributions] = useState<any | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedContributions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timelineLoading, setTimelineLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [boards, setBoards] = useState<{ [key: string]: PixelBoard }>({});
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!currentUser) {
          setError('Vous devez être connecté pour voir vos contributions.');
          setLoading(false);
          return;
        }

        const response = await getUserContributions();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setContributions(response.data);

          // Récupérer les informations des PixelBoards
          await fetchBoardsInfo(response.data.contributedBoards);
        }
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des contributions.');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [currentUser, getUserContributions]);

  // Charger les données temporelles en fonction de la période sélectionnée
  useEffect(() => {
    const fetchTimelineData = async () => {
      setTimelineLoading(true);
      setTimelineError(null);

      try {
        const response = await ApiService.getUserContributionTimeline(selectedPeriod);
        if (response.error) {
          setTimelineError(response.error);
        } else if (response.data) {
          setTimelineData(response.data);
        }
      } catch (err: any) {
        setTimelineError(err.message || 'Erreur lors du chargement des données temporelles');
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimelineData();
  }, [selectedPeriod]);

  // Récupérer les informations des PixelBoards pour les noms et détails
  const fetchBoardsInfo = async (contributedBoards: any[]) => {
    try {
      const boardsMap: { [key: string]: PixelBoard } = {};

      for (const board of contributedBoards) {
        try {
          const response = await ApiService.getPixelBoardById(board.boardId);
          if (response.data) {
            boardsMap[board.boardId] = response.data;
          }
        } catch (err) {
          console.warn(`Impossible de récupérer les informations du board ${board.boardId}`);
        }
      }

      setBoards(boardsMap);
    } catch (err) {
      console.error('Erreur lors de la récupération des informations des boards', err);
    }
  };

  // Traiter les données de contributions pour les visualisations
  useEffect(() => {
    if (!contributions || !boards || Object.keys(boards).length === 0) return;

    try {
      // Préparer les données pour les graphiques des boards
      const boardData = contributions.contributedBoards.map((board: any) => ({
        boardId: board.boardId,
        boardName: boards[board.boardId]?.title || `Board ${board.boardId.substring(0, 8)}...`,
        pixelCount: board.pixelCount,
        percentage: (board.pixelCount / contributions.totalPixels) * 100,
      }));

      // Utiliser les données de la timeline réelle
      const timeSeriesData = timelineData?.timelineData || [];

      setProcessedData({
        totalPixels: contributions.totalPixels,
        boardData,
        timeSeriesData,
      });
    } catch (err) {
      console.error('Erreur lors du traitement des données de contributions', err);
    }
  }, [contributions, boards, timelineData]);

  // Process timeline data to ensure current day is included
  useEffect(() => {
    if (!timelineData || !timelineData.timelineData) return;

    // Create a copy of the timeline data
    const processedTimelineData = [...timelineData.timelineData];

    // For week view, ensure we have all 7 days
    if (selectedPeriod === 'week') {
      const today = new Date();
      const sevenDaysData: { date: string; count: number }[] = [];

      // Generate data for each of the last 7 days
      for (let i = 6; i >= 0; i--) {  // From 6 days ago to today (7 days total)
        const date = new Date();
        date.setDate(today.getDate() - i);

        const dateKey = `${date.getDate()}/${date.getMonth() + 1}`;

        // Check if this date exists in our data
        const existingDataPoint = processedTimelineData.find(item => item.date === dateKey);

        if (existingDataPoint) {
          sevenDaysData.push(existingDataPoint);
        } else {
          // Add the date with zero count if it doesn't exist
          sevenDaysData.push({
            date: dateKey,
            count: 0
          });
        }
      }

      // Update the processed data with the complete 7-day data
      setProcessedData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          timeSeriesData: sevenDaysData
        };
      });
    }
  }, [timelineData, selectedPeriod]);

  // Gestionnaire pour changer la plage temporelle
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value as PeriodType);
  };

  // Fonction pour exporter les données en CSV
  const exportCSV = () => {
    if (!processedData) return;

    // Créer le contenu CSV
    let csvContent = 'data:text/csv;charset=utf-8,';

    // En-tête pour les données de boards
    csvContent += 'Board ID,Board Name,Pixel Count,Percentage\r\n';

    // Données des boards
    processedData.boardData.forEach((board) => {
      csvContent += `${board.boardId},${board.boardName},${board.pixelCount},${board.percentage.toFixed(2)}\r\n`;
    });

    // Ajouter une ligne vide
    csvContent += '\r\n';

    // En-tête pour les données temporelles
    csvContent += 'Date,Pixel Count\r\n';

    // Données temporelles
    processedData.timeSeriesData.forEach((item) => {
      csvContent += `${item.date},${item.count}\r\n`;
    });

    // Créer un lien de téléchargement
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pixel-contributions-${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de vos contributions..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!processedData) {
    return <div className="contributions-page">Aucune contribution trouvée.</div>;
  }

  return (
    <div className="contributions-page">
      <div className="contributions-header">
        <h1>Historique de vos contributions</h1>
        <div className="contributions-actions">
          <div className="period-selector">
            <label htmlFor="period-select">Période:</label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={handleTimeRangeChange}
            >
              <option value="day">Dernières 24 heures</option>
              <option value="week">Dernière semaine</option>
              <option value="month">Dernier mois</option>
              <option value="all">Tout l'historique</option>
            </select>
          </div>
          <button className="export-button" onClick={exportCSV}>
            Exporter en CSV
          </button>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{processedData.totalPixels}</div>
          <div className="stat-label">Pixels placés au total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{processedData.boardData.length}</div>
          <div className="stat-label">PixelBoards contribués</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {timelineData?.totalPixels || 0}
          </div>
          <div className="stat-label">Pixels sur cette période</div>
        </div>
      </div>

      <div className="chart-container">
        <h2>Contributions au fil du temps</h2>
        <div className="time-chart">
          {timelineLoading ? (
            <div className="chart-loader">
              <LoadingSpinner size="small" message="Chargement des données..." />
            </div>
          ) : timelineError ? (
            <ErrorMessage message={timelineError} />
          ) : processedData.timeSeriesData.length === 0 ? (
            <div className="no-data-message">
              Aucune donnée disponible pour cette période
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={processedData.timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Pixels placés"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="chart-container">
        <h2>Contributions par PixelBoard</h2>
        <div className="board-chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={processedData.boardData.slice(0, 10)} // Limiter aux 10 premiers
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="boardName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pixelCount" name="Nombre de pixels" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="contributions-table">
        <h2>Détail par PixelBoard</h2>
        <table>
          <thead>
            <tr>
              <th>PixelBoard</th>
              <th>Pixels placés</th>
              <th>Pourcentage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedData.boardData.map((board) => (
              <tr key={board.boardId}>
                <td>{board.boardName}</td>
                <td>{board.pixelCount}</td>
                <td>{board.percentage.toFixed(2)}%</td>
                <td>
                  <a href={`/pixel-boards/${board.boardId}`} className="view-button">
                    Voir
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserContributionsPage;
