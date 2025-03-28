import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PixelBoardService } from '@/services/api.service';

interface CooldownStatus {
  canPlace: boolean;
  remainingSeconds: number;
  isPremium: boolean;
}

export function useCooldown(boardId: string | undefined) {
  const [status, setStatus] = useState<CooldownStatus>({
    canPlace: false,
    remainingSeconds: 0,
    isPremium: false
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fonction pour charger le statut du cooldown depuis l'API
  const checkCooldown = async () => {
    if (!boardId || !isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await PixelBoardService.checkCooldown(boardId);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setStatus(response.data as CooldownStatus);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification du cooldown');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le statut initial
  useEffect(() => {
    if (boardId && isAuthenticated) {
      checkCooldown();
    } else {
      setLoading(false);
    }
  }, [boardId, isAuthenticated]);

  // Créer un timer pour décrémenter le temps restant
  useEffect(() => {
    if (!status.canPlace && status.remainingSeconds > 0) {
      const timer = setInterval(() => {
        setStatus(prev => {
          const newRemaining = prev.remainingSeconds - 1;

          if (newRemaining <= 0) {
            clearInterval(timer);
            return {
              ...prev,
              canPlace: true,
              remainingSeconds: 0
            };
          }

          return { ...prev, remainingSeconds: newRemaining };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status.canPlace, status.remainingSeconds]);

  return {
    status,
    loading,
    error,
    refresh: checkCooldown
  };
}
