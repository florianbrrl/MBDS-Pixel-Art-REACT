import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/auth.types';
import ApiService from '@/services/api.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

type SortField = 'email' | 'role' | 'created_at' | 'status';
type SortDirection = 'asc' | 'desc';

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
  const [sortField, setSortField] = useState<SortField>('email');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  useEffect(() => {
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

    // Tri des résultats
    result = [...result].sort((a, b) => {
      let compareA: any;
      let compareB: any;

      if (sortField === 'email') {
        compareA = a.email.toLowerCase();
        compareB = b.email.toLowerCase();
      } else if (sortField === 'role') {
        compareA = a.role || '';
        compareB = b.role || '';
      } else if (sortField === 'created_at') {
        compareA = new Date(a.created_at).getTime();
        compareB = new Date(b.created_at).getTime();
      } else if (sortField === 'status') {
        compareA = a.is_blocked ? 1 : 0;
        compareB = b.is_blocked ? 1 : 0;
      } else {
        return 0;
      }

      if (sortDirection === 'asc') {
        return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
      } else {
        return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
      }
    });

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

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

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Si on clique sur le même champ, on inverse la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, on change le champ de tri et on remet en ascendant
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="user-list-container">
      {error && <ErrorMessage message={error} onRetry={() => fetchUsers()} />}
      
      <div className="user-filters mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center min-w-[250px]">
            <label htmlFor="search" className="flex-shrink-0 w-24 text-sm font-medium">
              Rechercher:
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Email..."
              className="flex-grow p-2 border rounded"
            />
          </div>
          
          <div className="flex items-center min-w-[200px]">
            <label htmlFor="role-filter" className="flex-shrink-0 w-16 text-sm font-medium">
              Rôle:
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="flex-grow p-2 border rounded"
            >
              <option value="all">Tous les rôles</option>
              <option value="guest">Invité</option>
              <option value="user">Utilisateur</option>
              <option value="premium">Premium</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <div className="flex items-center min-w-[200px]">
            <label htmlFor="status-filter" className="flex-shrink-0 w-16 text-sm font-medium">
              Statut:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
              className="flex-grow p-2 border rounded"
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
            <thead>
              <tr>
                <th 
                  className="py-3 px-4 text-left cursor-pointer" 
                  onClick={() => handleSort('email')}
                >
                  Email
                  {sortField === 'email' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer" 
                  onClick={() => handleSort('role')}
                >
                  Rôle
                  {sortField === 'role' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer" 
                  onClick={() => handleSort('created_at')}
                >
                  Date de création
                  {sortField === 'created_at' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer" 
                  onClick={() => handleSort('status')}
                >
                  Statut
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
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