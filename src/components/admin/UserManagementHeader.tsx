
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import CreateUserDialog from './CreateUserDialog';
import type { CreateUserData } from '@/types/user';

interface UserManagementHeaderProps {
  onCreateUser: (userData: CreateUserData) => void;
  isCreating: boolean;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ onCreateUser, isCreating }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage system users and their permissions
          </CardDescription>
        </div>
        <CreateUserDialog onCreateUser={onCreateUser} isCreating={isCreating} />
      </div>
    </CardHeader>
  );
};

export default UserManagementHeader;
