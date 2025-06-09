
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useUserMutations } from '@/hooks/useUserMutations';
import UserManagementInfo from './UserManagementInfo';
import UserManagementHeader from './UserManagementHeader';
import UserList from './UserList';

const UserManagement = () => {
  const { users, isLoading, canManageUsers } = useUsers();
  const { createUser, isCreatingUser } = useUserMutations();

  if (!canManageUsers) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <span>You don't have permission to manage users.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagementInfo />
      
      <Card>
        <UserManagementHeader onCreateUser={createUser} isCreating={isCreatingUser} />
        <CardContent>
          <UserList users={users} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
