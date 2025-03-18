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

type PeriodType = 'day' | 'week' | 'month' | 'year' | 'all';

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

const UserContributionsPage: React.FC = () => {
  const { currentUser, getUserContributions } = useAuth();
  const [contributions, setContributions] = useState<any | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedContributions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [boards, setBoards] = useState<{ [key: string]: PixelBoard }>({});
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');

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

      // Préparer des données temporelles simulées pour l'exemple
      // Dans une implémentation réelle, cela viendrait de l'API backend
      const timeSeriesData = generateTimeSeriesData(selectedPeriod);

      setProcessedData({
        totalPixels: contributions.totalPixels,
        boardData,
        timeSeriesData,
      });
    } catch (err) {
      console.error('Erreur lors du traitement des données de contributions', err);
    }
  }, [contributions, boards, selectedPeriod]);

  // Fonction pour générer des données temporelles simulées
  const generateTimeSeriesData = (period: PeriodType) => {
    // Ceci est une simulation. Dans une implémentation réelle, ces données viendraient de l'API.
    const now = new Date();
    const data = [];
    let total = 0;

    if (period === 'day') {
      // Dernières 24 heures
      for (let i = 0; i < 24; i++) {
        const count = Math.floor(Math.random() * 10);
        total += count;
        const date = new Date(now);
        date.setHours(now.getHours() - 23 + i);
        data.push({
          date: `${date.getHours()}:00`,
          count,
        });
      }
    } else if (period === 'week') {
      // Derniers 7 jours
      for (let i = 0; i < 7; i++) {
        const count = Math.floor(Math.random() * 20);
        total += count;
        const date = new Date(now);
        date.setDate(now.getDate() - 6 + i);
        data.push({
          date: date.toLocaleDateString(undefined, { weekday: 'short' }),
          count,
        });
      }
    } else if (period === 'month') {
      // Dernier mois
      for (let i = 0; i < 30; i++) {
        const count = Math.floor(Math.random() * 15);
        total += count;
        const date = new Date(now);
        date.setDate(now.getDate() - 29 + i);
        data.push({
          date: `${date.getDate()}/${date.getMonth() + 1}`,
          count,
        });
      }
    } else if (period === 'year') {
      // Dernière année
      for (let i = 0; i < 12; i++) {
        const count = Math.floor(Math.random() * 100);
        total += count;
        const date = new Date(now);
        date.setMonth(now.getMonth() - 11 + i);
        data.push({
          date: date.toLocaleDateString(undefined, { month: 'short' }),
          count,
        });
      }
    } else {
      // Tous les temps (simulé)
      for (let i = 0; i < 12; i++) {
        const count = Math.floor(Math.random() * 200);
        total += count;
        const date = new Date(now);
        date.setMonth(now.getMonth() - 11 + i);
        data.push({
          date: date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
          count,
        });
      }
    }

    return data;
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
              onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
            >
              <option value="day">Dernières 24 heures</option>
              <option value="week">Dernière semaine</option>
              <option value="month">Dernier mois</option>
              <option value="year">Dernière année</option>
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
            {processedData.timeSeriesData.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <div className="stat-label">Pixels sur cette période</div>
        </div>
      </div>

      <div className="chart-container">
        <h2>Contributions au fil du temps</h2>
        <div className="time-chart">
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
