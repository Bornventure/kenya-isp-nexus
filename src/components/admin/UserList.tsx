
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import UserActions from './UserActions';
import type { SystemUser } from '@/types/user';

interface UserListProps {
  users: SystemUser[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'isp_admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'technician': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-yellow-100 text-yellow-800';
      case 'billing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No users found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {user.first_name} {user.last_name}
              </span>
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role.replace('_', ' ').toUpperCase()}
              </Badge>
              {!user.is_active && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{user.phone || 'No phone'}</p>
            {user.isp_companies?.name && (
              <p className="text-xs text-gray-500">Company: {user.isp_companies.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <UserActions user={user} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
