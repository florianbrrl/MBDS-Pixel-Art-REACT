import React, { useState, useEffect } from 'react';
import { UserProfile, UserContributions } from '@/types/auth.types';
import ApiService from '@/services/api.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

interface UserDetailProps {
  user: UserProfile;
  onClose: () => void;
}

const UserDetail: React.FC<UserDetailProps> = ({ user, onClose }) => {
  const [contributions, setContributions] = useState<UserContributions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ApiService.getUserContributions(user.id);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setContributions(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des contributions');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [user.id]);

  return (
    <div className="user-detail-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Détails de l'utilisateur</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        <div className="user-info mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Informations</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p>
                  <span className="font-medium">Rôle:</span> 
                  <span className={`
                    ml-2 inline-block px-2 py-1 rounded text-xs
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                    ${user.role === 'premium' ? 'bg-green-100 text-green-800' : ''}
                    ${user.role === 'user' ? 'bg-blue-100 text-blue-800' : ''}
                    ${user.role === 'guest' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {user.role === 'admin' && 'Administrateur'}
                    {user.role === 'premium' && 'Premium'}
                    {user.role === 'user' && 'Utilisateur'}
                    {user.role === 'guest' && 'Invité'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Statut:</span>
                  <span className={`
                    ml-2 inline-block px-2 py-1 rounded text-xs
                    ${user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                  `}>
                    {user.is_blocked ? 'Bloqué' : 'Actif'}
                  </span>
                </p>
                <p><span className="font-medium">Inscription:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                {user.updated_at && (
                  <p><span className="font-medium">Dernière mise à jour:</span> {new Date(user.updated_at).toLocaleDateString()}</p>
                )}
                <p><span className="font-medium">Préférence de thème:</span> {user.theme_preference || 'Non défini'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Statistiques</h3>
              {loading ? (
                <LoadingSpinner />
              ) : contributions ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700">Total des pixels placés</h4>
                    <p className="text-2xl font-bold text-blue-800">{contributions.totalPixels}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Contributions par tableau</h4>
                    {contributions.contributedBoards.length === 0 ? (
                      <p className="text-gray-500 italic">Aucune contribution</p>
                    ) : (
                      <div className="space-y-2">
                        {contributions.contributedBoards.map((board, index) => (
                          <div key={index} className="flex justify-between border-b pb-1">
                            <span className="truncate">{board.boardId}</span>
                            <span className="font-medium">{board.pixelCount} pixels</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Données non disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;