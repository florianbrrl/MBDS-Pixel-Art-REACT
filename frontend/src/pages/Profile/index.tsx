import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeSelector from '@/components/common/ThemeSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { UserRole, ThemePreference, UserContributions } from '@/types/auth.types';
import { PixelBoard } from '@/types';
import { Link } from 'react-router-dom';
import ApiService from '@/services/api.service';
import '../../styles/profile-page.css';

const Profile: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    changePassword,
    getUserContributions,
    isLoading: authLoading,
  } = useAuth();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État pour les contributions
  const [contributions, setContributions] = useState<UserContributions | null>(null);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [contributionsError, setContributionsError] = useState<string | null>(null);

  // États pour les détails des PixelBoards
  const [boardDetails, setBoardDetails] = useState<{ [id: string]: PixelBoard | null }>({});
  const [loadingBoards, setLoadingBoards] = useState<{ [id: string]: boolean }>({});

  // Initialiser les champs du formulaire avec les valeurs actuelles
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      // 'sys' est le format stocké dans la BD, 'system' est le format utilisé côté client
      const themeValue =
        currentUser.theme_preference === 'sys'
          ? 'system'
          : (currentUser.theme_preference as ThemePreference) || 'system';
      setThemePreference(themeValue);
    }
  }, [currentUser]);

  // Charger les contributions utilisateur
  useEffect(() => {
    const loadContributions = async () => {
      if (!currentUser) return;

      setContributionsLoading(true);
      setContributionsError(null);

      try {
        const response = await getUserContributions();
        if (response.data) {
          setContributions(response.data);
        } else if (response.error) {
          setContributionsError(response.error);
        }
      } catch (error: any) {
        setContributionsError(error.message || 'Erreur lors du chargement des contributions');
      } finally {
        setContributionsLoading(false);
      }
    };

    loadContributions();
  }, [currentUser, getUserContributions]);

  // Fonction pour charger les détails d'un PixelBoard
  const loadBoardDetails = useCallback(
    async (boardId: string) => {
      // Éviter de recharger si déjà chargé ou en cours de chargement
      if (boardDetails[boardId] || loadingBoards[boardId]) return;

      setLoadingBoards((prev) => ({ ...prev, [boardId]: true }));

      try {
        const response = await ApiService.getPixelBoardById(boardId);
        if (response.data) {
          setBoardDetails((prev) => ({ ...prev, [boardId]: response.data }));
        }
      } catch (error) {
        console.error(`Erreur lors du chargement du PixelBoard ${boardId}:`, error);
      } finally {
        setLoadingBoards((prev) => ({ ...prev, [boardId]: false }));
      }
    },
    [boardDetails, loadingBoards],
  );

  // Charger les détails des PixelBoards quand les contributions sont disponibles
  useEffect(() => {
    if (contributions?.contributedBoards?.length) {
      contributions.contributedBoards.forEach((board) => {
        loadBoardDetails(board.boardId);
      });
    }
  }, [contributions, loadBoardDetails]);

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
      // Convertir 'system' en 'sys' pour le backend
      const theme_preference = themePreference === 'system' ? 'sys' : themePreference;

      await updateProfile({ email, theme_preference });
      setProfileSuccess('Profil mis à jour avec succès');
      setIsEditingProfile(false);
    } catch (error: any) {
      setProfileError(error.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  // Gérer la soumission du formulaire de changement de mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsSubmitting(true);

    // Validation des mots de passe
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      setIsSubmitting(false);
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
      setPasswordError(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsSubmitting(false);
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
              <button onClick={() => setIsEditingProfile(true)} className="edit-button">
                Modifier
              </button>
            )}
          </div>

          {profileSuccess && <div className="success-message">{profileSuccess}</div>}

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
                <button type="submit" className="primary-button" disabled={authLoading}>
                  {authLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEmail(currentUser.email);
                    // 'sys' est le format stocké dans la BD, 'system' est le format utilisé côté client
                    const themeValue =
                      currentUser.theme_preference === 'sys'
                        ? 'system'
                        : (currentUser.theme_preference as ThemePreference) || 'system';
                    setThemePreference(themeValue);
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
              <button onClick={() => setIsChangingPassword(true)} className="edit-button">
                Changer
              </button>
            )}
          </div>

          {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

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
                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Modification en cours...' : 'Changer le mot de passe'}
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
                  disabled={isSubmitting}
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

        {/* Section des contributions */}
        <div className="profile-section contributions-section">
          <h2>Mes Contributions</h2>

          {contributionsLoading ? (
            <div className="contributions-loading">
              <LoadingSpinner size="small" message="Chargement des contributions..." />
            </div>
          ) : contributionsError ? (
            <div className="error-message">
              <span>{contributionsError}</span>
            </div>
          ) : contributions ? (
            <div className="contributions">
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24"
                    >
                      <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
                      <path d="M15 9h2v2h-2V9zm-4 0h2v2h-2V9zm-4 0h2v2H7V9zm8 4h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4 0h2v2H7v-2z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total de pixels placés</span>
                    <span className="stat-value">{contributions.totalPixels}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24"
                    >
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
                      <path d="M6 10h12v2H6zm0 4h8v2H6z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">PixelBoards contribués</span>
                    <span className="stat-value">{contributions.contributedBoards.length}</span>
                  </div>
                </div>
              </div>

              {contributions.contributedBoards.length > 0 && (
                <div className="contributions-boards">
                  <h3>Tableaux avec contributions</h3>
                  <div className="boards-table">
                    {contributions.contributedBoards.slice(0, 5).map((board) => (
                      <Link
                        to={`/pixel-boards/${board.boardId}`}
                        key={board.boardId}
                        className="board-item"
                      >
                        <span className="board-title">
                          {loadingBoards[board.boardId] ? (
                            <span className="loading-title">Chargement...</span>
                          ) : boardDetails[board.boardId] ? (
                            boardDetails[board.boardId].title
                          ) : (
                            `Tableau #${board.boardId.substring(0, 4)}`
                          )}
                        </span>
                        <div className="board-pixels">
                          <span className="pixel-count">{board.pixelCount}</span>
                          <span className="pixel-label">
                            pixel{board.pixelCount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="board-view-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="16"
                            height="16"
                          >
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                          </svg>
                        </span>
                      </Link>
                    ))}
                  </div>

                  <Link to="/contributions" className="view-all-button">
                    <span>Voir l'historique détaillé des contributions</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="16"
                      height="16"
                    >
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="no-contributions">
              <div className="empty-state-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="48"
                  height="48"
                >
                  <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <p>Aucune contribution trouvée.</p>
              <p className="empty-state-hint">
                Explorez les tableaux et placez des pixels pour voir vos contributions ici.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
