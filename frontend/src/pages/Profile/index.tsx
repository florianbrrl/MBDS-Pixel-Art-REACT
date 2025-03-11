import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeSelector from '@/components/common/ThemeSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { User } from '@/types';
import { UserRole, ThemePreference } from '@/types/auth.types';
import '../../styles/profile-page.css';

const Profile: React.FC = () => {
  const { currentUser, updateProfile, changePassword, isLoading: authLoading } = useAuth();

  // États pour le formulaire de modification du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // États pour le formulaire de changement de mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Initialiser les champs du formulaire avec les valeurs actuelles
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setThemePreference(currentUser.theme_preference as ThemePreference || 'system');
    }
  }, [currentUser]);

  // Formater le rôle utilisateur pour l'affichage
  const formatRole = (role?: UserRole): string => {
    if (!role) return 'Utilisateur';

    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'premium':
        return 'Utilisateur premium';
      case 'user':
        return 'Utilisateur';
      case 'guest':
        return 'Invité';
      default:
        return role;
    }
  };

  // Gérer la soumission du formulaire de modification du profil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!currentUser) return;

    try {
      await updateProfile({ email, theme_preference: themePreference });
      setProfileSuccess('Profil mis à jour avec succès');
      setIsEditingProfile(false);
    } catch (error: any) {
      setProfileError(error.error || 'Erreur lors de la mise à jour du profil');
    }
  };

  // Gérer la soumission du formulaire de changement de mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation des mots de passe
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Mot de passe changé avec succès');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      setPasswordError(error.error || 'Erreur lors du changement de mot de passe');
    }
  };

  if (!currentUser) {
    return (
      <div className="profile-page">
        <ErrorMessage message="Vous devez être connecté pour accéder à votre profil." />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="profile-page profile-loading">
        <LoadingSpinner message="Chargement de votre profil..." />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Mon Profil</h1>

      <div className="profile-card">
        <div className="profile-section">
          <div className="section-header">
            <h2>Informations Personnelles</h2>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="edit-button"
              >
                Modifier
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="success-message">
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="error-message">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="error-icon"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{profileError}</span>
            </div>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="themePreference">Préférence de thème:</label>
                <select
                  id="themePreference"
                  value={themePreference}
                  onChange={(e) => setThemePreference(e.target.value as ThemePreference)}
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="system">Système</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={authLoading}
                >
                  {authLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEmail(currentUser.email);
                    setThemePreference(currentUser.theme_preference as ThemePreference || 'system');
                    setProfileError(null);
                  }}
                  className="secondary-button"
                  disabled={authLoading}
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <p>
                <strong>Email:</strong> {currentUser.email}
              </p>
              <p>
                <strong>Rôle:</strong> {formatRole(currentUser.role as UserRole)}
              </p>
              <p>
                <strong>Compte créé le:</strong>{' '}
                {new Date(currentUser.created_at).toLocaleDateString()}
              </p>
              {currentUser.updated_at && (
                <p>
                  <strong>Dernière mise à jour:</strong>{' '}
                  {new Date(currentUser.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Modifier le mot de passe</h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="edit-button"
              >
                Changer
              </button>
            )}
          </div>

          {passwordSuccess && (
            <div className="success-message">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="error-message">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="error-icon"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{passwordError}</span>
            </div>
          )}

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Mot de passe actuel:</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nouveau mot de passe:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe:</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={authLoading}
                >
                  {authLoading ? 'Enregistrement...' : 'Changer le mot de passe'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setPasswordError(null);
                  }}
                  className="secondary-button"
                  disabled={authLoading}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <h2>Préférences</h2>
          <div className="theme-selector-container">
            <label>Thème de l'application:</label>
            <ThemeSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
