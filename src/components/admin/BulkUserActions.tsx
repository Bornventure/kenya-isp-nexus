
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Trash2, UserX, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDeletion } from '@/hooks/useUserDeletion';
import type { SystemUser } from '@/types/user';

interface BulkUserActionsProps {
  selectedUsers: SystemUser[];
  onClearSelection: () => void;
}

const BulkUserActions: React.FC<BulkUserActionsProps> = ({ 
  selectedUsers, 
  onClearSelection 
}) => {
  const { profile } = useAuth();
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { deleteUser, isDeletingUser, canDeleteUser } = useUserDeletion();

  if (selectedUsers.length === 0) {
    return null;
  }

  // Filter users that can be deleted
  const deletableUsers = selectedUsers.filter(user => 
    canDeleteUser(user.id, user.role)
  );

  // Check if current user is in selection (prevent self-deletion)
  const containsSelf = selectedUsers.some(user => user.id === profile?.id);

  const handleBulkDelete = async () => {
    console.log('Bulk delete confirmed for users:', deletableUsers.map(u => u.id));
    
    // Delete each user sequentially to avoid overwhelming the system
    for (const user of deletableUsers) {
      try {
        await deleteUser(user.id);
        console.log(`Successfully deleted user: ${user.first_name} ${user.last_name}`);
      } catch (error) {
        console.error(`Failed to delete user ${user.first_name} ${user.last_name}:`, error);
      }
    }
    
    setShowBulkDeleteDialog(false);
    onClearSelection();
  };

  const nonDeletableUsers = selectedUsers.filter(user => 
    !canDeleteUser(user.id, user.role)
  );

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-700">
              <UserX className="h-4 w-4" />
              <span className="font-medium">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
            </div>
            
            {deletableUsers.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={isDeletingUser}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeletingUser ? 'Deleting...' : `Delete ${deletableUsers.length}`}
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {nonDeletableUsers.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-700 font-medium mb-2">
              Cannot delete {nonDeletableUsers.length} selected user{nonDeletableUsers.length > 1 ? 's' : ''}:
            </p>
            <ul className="text-sm text-amber-600 space-y-1">
              {nonDeletableUsers.map(user => (
                <li key={user.id}>
                  • {user.first_name} {user.last_name} 
                  {user.id === profile?.id ? ' (yourself)' : 
                   user.role === 'super_admin' ? ' (super admin)' : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {containsSelf && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ You cannot delete your own account from this selection.
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              Bulk Delete User Accounts
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="font-medium">
                Are you sure you want to permanently delete {deletableUsers.length} user account{deletableUsers.length > 1 ? 's' : ''}?
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Users to be deleted:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 max-h-32 overflow-y-auto">
                  {deletableUsers.map(user => (
                    <li key={user.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {user.first_name} {user.last_name} ({user.role.replace('_', ' ')})
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-2">This action will remove for each user:</p>
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
              onClick={handleBulkDelete}
              disabled={isDeletingUser}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeletingUser ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting Users...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {deletableUsers.length} User{deletableUsers.length > 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkUserActions;
