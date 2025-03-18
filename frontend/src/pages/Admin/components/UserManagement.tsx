import React, { useState } from 'react';
import { UserProfile } from '@/types/auth.types';
import UserList from './UserList';
import UserDetail from './UserDetail';
import '@/styles/admin-user.css';

const UserManagement: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  return (
    <div className="user-management">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Gestion des utilisateurs</h2>
        <p className="text-gray-600">
          Gérez les utilisateurs, modifiez leurs rôles et surveillez leur activité
        </p>
      </div>

      <UserList onSelectUser={setSelectedUser} />
      
      {selectedUser && (
        <UserDetail 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
};

export default UserManagement;