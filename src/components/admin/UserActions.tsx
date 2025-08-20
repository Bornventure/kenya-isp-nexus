
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
import { MoreHorizontal, UserX, Edit, Lock, Unlock, Trash2, KeyRound } from 'lucide-react';
import { useUserDeletion } from '@/hooks/useUserDeletion';
import { useUserActivation } from '@/hooks/useUserActivation';
import { useUserUpdate } from '@/hooks/useUserUpdate';
import { useAuth } from '@/contexts/AuthContext';
import EditUserDialog from './EditUserDialog';
import ChangePasswordDialog from './ChangePasswordDialog';
import type { SystemUser } from '@/types/user';

interface UserActionsProps {
  user: SystemUser;
}

const UserActions: React.FC<UserActionsProps> = ({ user }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { deleteUser, isDeletingUser, canDeleteUser } = useUserDeletion();
  const { toggleUserActivation, isUpdatingActivation } = useUserActivation();
  const { updateUser, isUpdating } = useUserUpdate();
  const { profile } = useAuth();

  // Check permissions
  const canDelete = canDeleteUser(user.id, user.role);
  const canEdit = user.role !== 'super_admin' || profile?.role === 'super_admin';
  const canManageActivation = profile?.role === 'super_admin' || 
    (profile?.role === 'isp_admin' && user.role !== 'super_admin');

  const handleDelete = () => {
    console.log('Delete confirmed for user:', user.id, user.first_name, user.last_name);
    deleteUser(user.id);
    setShowDeleteDialog(false);
  };

  const handleToggleActivation = () => {
    toggleUserActivation({ userId: user.id, isActive: !user.is_active });
  };

  const handleUpdateUser = (userData: any) => {
    updateUser({
      userId: user.id,
      userData
    });
    setShowEditDialog(false);
  };

  const getDeleteWarningMessage = () => {
    if (user.role === 'super_admin') {
      return "Deleting a super administrator is a critical action that will permanently remove their access to all system functions.";
    }
    return "This action will permanently delete the user account and cannot be undone.";
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
          {canEdit && (
            <>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
                <KeyRound className="h-4 w-4 mr-2" />
                Change Password
              </DropdownMenuItem>
            </>
          )}
          
          {canManageActivation && (
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
          )}
          
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-600" />
                Delete User Account
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p className="font-medium">
                  Are you sure you want to permanently delete {user.first_name} {user.last_name}'s account?
                </p>
                
                <p className="text-sm text-amber-600 font-medium">
                  {getDeleteWarningMessage()}
                </p>
                
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-red-800 mb-2">This action will remove:</p>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    <li>User profile and credentials</li>
                    <li>All created tickets and comments</li>
                    <li>Message history</li>
                    <li>Activity logs and audit trails</li>
                    <li>Any assigned permissions and roles</li>
                  </ul>
                </div>
                
                <p className="text-sm font-bold text-red-600">
                  This action cannot be undone.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingUser}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeletingUser}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              >
                {isDeletingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {canEdit && (
        <>
          <EditUserDialog 
            user={user}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onUpdateUser={handleUpdateUser}
            isUpdating={isUpdating}
          />
          
          <ChangePasswordDialog 
            user={user}
            open={showPasswordDialog}
            onOpenChange={setShowPasswordDialog}
          />
        </>
      )}
    </>
  );
};

export default UserActions;
