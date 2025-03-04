import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="profile-page">
      <h1>Mon Profil</h1>

      <div className="profile-info">
        <p>
          <strong>Email:</strong> {currentUser?.email}
        </p>
        <p>
          <strong>Compte créé le:</strong>{' '}
          {currentUser?.created_at
            ? new Date(currentUser.created_at).toLocaleDateString()
            : 'Non disponible'}
        </p>
      </div>

      <div className="user-contributions">
        <h2>Mes Contributions</h2>
        <p>Chargement des contributions...</p>
      </div>
    </div>
  );
};

export default Profile;
