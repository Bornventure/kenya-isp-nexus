
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, UserX, Edit, Lock, Unlock } from 'lucide-react';
import { useUserDeletion } from '@/hooks/useUserDeletion';
import { useUserActivation } from '@/hooks/useUserActivation';
import EditUserDialog from './EditUserDialog';
import type { SystemUser } from '@/types/user';

interface UserActionsProps {
  user: SystemUser;
}

const UserActions: React.FC<UserActionsProps> = ({ user }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { deleteUser, isDeletingUser } = useUserDeletion();
  const { toggleUserActivation, isUpdatingActivation } = useUserActivation();

  const handleDelete = () => {
    deleteUser(user.id);
    setShowDeleteDialog(false);
  };

  const handleToggleActivation = () => {
    toggleUserActivation({ userId: user.id, isActive: !user.is_active });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleToggleActivation}
            disabled={isUpdatingActivation}
          >
            {user.is_active ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <UserX className="h-4 w-4 mr-2" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {user.first_name} {user.last_name}'s account? 
              This action cannot be undone and will remove all associated data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>User profile and credentials</li>
                <li>All created tickets and comments</li>
                <li>Message history</li>
                <li>Activity logs</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeletingUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingUser ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditUserDialog 
        user={user}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
};

export default UserActions;
