import React from 'react';
import './../../styles/CooldownIndicator.css';

interface CooldownIndicatorProps {
  remainingSeconds: number;
  isPremium: boolean;
  canPlace: boolean;
}

const CooldownIndicator: React.FC<CooldownIndicatorProps> = ({
  remainingSeconds,
  isPremium,
  canPlace
}) => {
  // Formater le temps restant
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0s';

    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSecs}s`;
    }

    return `${remainingSecs}s`;
  };

  // Si l'utilisateur est premium, afficher un badge spécial
  if (isPremium) {
    return (
      <div className="cooldown-indicator premium">
        <span className="premium-badge">Premium</span>
        <span className="cooldown-text">Pas d'attente entre les pixels</span>
      </div>
    );
  }

  // Si l'utilisateur peut placer un pixel
  if (canPlace) {
    return (
      <div className="cooldown-indicator ready">
        <span className="cooldown-ready">Prêt à placer un pixel</span>
      </div>
    );
  }

  // Si l'utilisateur doit attendre
  return (
    <div className="cooldown-indicator waiting">
      <div className="cooldown-progress">
        <div
          className="cooldown-progress-bar"
          style={{
            width: `${Math.min(100, (remainingSeconds / 60) * 100)}%`
          }}
        ></div>
      </div>
      <span className="cooldown-text">
        Prochain pixel disponible dans {formatTime(remainingSeconds)}
      </span>
    </div>
  );
};

export default CooldownIndicator;
