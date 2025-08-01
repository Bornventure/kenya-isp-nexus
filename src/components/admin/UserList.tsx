
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, User } from 'lucide-react';
import UserActions from './UserActions';
import BulkUserActions from './BulkUserActions';
import type { SystemUser } from '@/types/user';

interface UserListProps {
  users: SystemUser[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const [selectedUsers, setSelectedUsers] = useState<SystemUser[]>([]);

  const handleUserSelect = (user: SystemUser, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, user]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(users);
    } else {
      setSelectedUsers([]);
    }
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some(u => u.id === userId);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'isp_admin': return 'bg-purple-100 text-purple-800';
      case 'customer_support': return 'bg-yellow-100 text-yellow-800';
      case 'sales_manager': return 'bg-blue-100 text-blue-800';
      case 'billing_admin': return 'bg-orange-100 text-orange-800';
      case 'network_engineer': return 'bg-green-100 text-green-800';
      case 'infrastructure_manager': return 'bg-teal-100 text-teal-800';
      case 'hotspot_admin': return 'bg-indigo-100 text-indigo-800';
      case 'technician': return 'bg-cyan-100 text-cyan-800';
      case 'readonly': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No users found</p>
        <p className="text-gray-400 text-sm">Create your first user to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BulkUserActions 
        selectedUsers={selectedUsers}
        onClearSelection={() => setSelectedUsers([])}
      />

      <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
        <Checkbox
          checked={selectedUsers.length === users.length && users.length > 0}
          onCheckedChange={handleSelectAll}
          disabled={users.length === 0}
        />
        <span className="text-sm font-medium text-gray-700">
          Select all users ({users.length})
        </span>
        {selectedUsers.length > 0 && (
          <span className="text-sm text-blue-600 ml-auto">
            {selectedUsers.length} selected
          </span>
        )}
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isUserSelected(user.id)}
                onCheckedChange={(checked) => handleUserSelect(user, checked as boolean)}
              />
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </span>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {!user.is_active && (
                    <Badge variant="secondary" className="text-red-600 bg-red-50">
                      Inactive
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{user.phone || 'No phone number'}</p>
                  {user.isp_companies?.name && (
                    <p className="text-xs text-gray-500">
                      Company: {user.isp_companies.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <UserActions user={user} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
