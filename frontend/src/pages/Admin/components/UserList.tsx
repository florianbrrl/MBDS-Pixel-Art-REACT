import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/auth.types';
import ApiService from '@/services/api.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

interface UserListProps {
  onSelectUser: (user: UserProfile) => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ApiService.getAllUsers();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Appliquer les filtres
    let result = users;

    // Filtre de recherche par email
    if (searchTerm) {
      result = result.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Filtre par statut (actif/bloqué)
    if (statusFilter !== 'all') {
      const isBlocked = statusFilter === 'blocked';
      result = result.filter(user => user.is_blocked === isBlocked);
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleRoleChange = async (user: UserProfile, newRole: UserRole) => {
    try {
      setLoading(true);
      const response = await ApiService.updateUserRole(user.id, newRole);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Mettre à jour l'utilisateur dans la liste
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === user.id ? { ...u, role: newRole } : u)
        );
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du rôle');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user: UserProfile) => {
    try {
      setLoading(true);
      const newStatus = !user.is_blocked;
      const response = await ApiService.toggleUserStatus(user.id, newStatus);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Mettre à jour l'utilisateur dans la liste
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === user.id ? { ...u, is_blocked: newStatus } : u)
        );
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: UserProfile) => {
    onSelectUser(user);
  };

  return (
    <div className="user-list-container">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      
      <div className="user-filters mb-6">
        <div className="flex flex-wrap gap-4 md:flex-nowrap">
          {/* Recherche par email */}
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Rechercher par email
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full p-2 border rounded"
            />
          </div>
          
          {/* Filtre par rôle */}
          <div className="w-full md:w-1/3">
            <label htmlFor="role-filter" className="block text-sm font-medium mb-1">
              Filtrer par rôle
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full p-2 border rounded"
            >
              <option value="all">Tous les rôles</option>
              <option value="guest">Invité</option>
              <option value="user">Utilisateur</option>
              <option value="premium">Premium</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          {/* Filtre par statut */}
          <div className="w-full md:w-1/3">
            <label htmlFor="status-filter" className="block text-sm font-medium mb-1">
              Filtrer par statut
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
              className="w-full p-2 border rounded"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="blocked">Bloqués</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="users-table-container overflow-x-auto">
          <table className="w-full min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Rôle</th>
                <th className="py-3 px-4 text-left">Date de création</th>
                <th className="py-3 px-4 text-left">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 px-4 text-center">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`border-t ${user.is_blocked ? 'blocked-user' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`
                        inline-block px-2 py-1 rounded text-xs 
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
                    </td>
                    <td className="py-3 px-4">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`
                        inline-block px-2 py-1 rounded text-xs
                        ${user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                      `}>
                        {user.is_blocked ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                          className="p-1 text-sm border rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="guest">Invité</option>
                          <option value="user">Utilisateur</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Administrateur</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBlock(user);
                          }}
                          className={`px-3 py-1 text-xs rounded ${
                            user.is_blocked
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {user.is_blocked ? 'Débloquer' : 'Bloquer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;