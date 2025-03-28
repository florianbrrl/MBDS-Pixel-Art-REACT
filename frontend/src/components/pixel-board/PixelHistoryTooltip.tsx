// Dans PixelHistoryTooltip.tsx
import React from 'react';
import './../../styles/PixelHistoryTooltip.css';

interface PixelHistoryTooltipProps {
  history: any[];
  loading: boolean;
  position: { x: number; y: number };
  style?: React.CSSProperties;
}

const PixelHistoryTooltip: React.FC<PixelHistoryTooltipProps> = ({
  history,
  loading,
  position,
  style
}) => {
  if (loading) {
    return (
      <div className="pixel-history-tooltip" style={style}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="pixel-history-tooltip" style={style}>
        <p>Aucune information disponible</p>
      </div>
    );
  }

  // Nous prenons uniquement le premier élément (le plus récent)
  const lastPlacement = history[0];

  return (
    <div className="pixel-history-tooltip" style={style}>
      <div className="last-placement">
        <div
          className="history-color"
          style={{ backgroundColor: lastPlacement.color }}
          title={lastPlacement.color}
        />
        <div className="history-info">
          <span className="history-user">{lastPlacement.user_email || 'Utilisateur anonyme'}</span>
          <span className="history-date">
            {new Date(lastPlacement.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PixelHistoryTooltip;
