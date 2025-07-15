
import React, { useState } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CreateUserDialog from './CreateUserDialog';
import type { CreateUserData } from '@/types/user';

interface UserManagementHeaderProps {
  onCreateUser: (userData: CreateUserData) => void;
  isCreating: boolean;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onCreateUser,
  isCreating,
}) => {
  const { profile } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Only super_admin can create users
  const canCreateUsers = profile?.role === 'super_admin';

  const handleCreateUser = (userData: CreateUserData) => {
    onCreateUser(userData);
    setShowCreateDialog(false);
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-bold">User Management</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage system users and their permissions
          </p>
        </div>
        
        {canCreateUsers && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={isCreating}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        )}
      </CardHeader>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateUser={handleCreateUser}
        isCreating={isCreating}
      />
    </>
  );
};

export default UserManagementHeader;
