
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
import { Trash2, Users, AlertTriangle } from 'lucide-react';
import { useUserDeletion } from '@/hooks/useUserDeletion';
import { useToast } from '@/hooks/use-toast';
import type { SystemUser } from '@/types/user';

interface BulkUserActionsProps {
  selectedUsers: SystemUser[];
  onClearSelection: () => void;
}

const BulkUserActions: React.FC<BulkUserActionsProps> = ({ 
  selectedUsers, 
  onClearSelection 
}) => {
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { deleteUser, isDeletingUser, canDeleteUser } = useUserDeletion();
  const { toast } = useToast();

  const deletableUsers = selectedUsers.filter(user => canDeleteUser(user.id, user.role));
  const nonDeletableUsers = selectedUsers.filter(user => !canDeleteUser(user.id, user.role));

  const handleBulkDelete = async () => {
    console.log('Starting bulk delete for users:', deletableUsers.map(u => u.id));
    
    try {
      const deletePromises = deletableUsers.map(user => 
        new Promise<void>((resolve, reject) => {
          // Use a setTimeout to avoid overwhelming the system
          setTimeout(() => {
            deleteUser(user.id);
            resolve();
          }, Math.random() * 1000); // Random delay between 0-1 seconds
        })
      );

      await Promise.all(deletePromises);
      
      toast({
        title: "Bulk Delete Initiated",
        description: `Deletion process started for ${deletableUsers.length} users. Check notifications for progress.`,
      });
      
      onClearSelection();
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Bulk Delete Failed",
        description: "Some users could not be deleted. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (selectedUsers.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </span>
          {nonDeletableUsers.length > 0 && (
            <span className="text-xs text-amber-600">
              ({nonDeletableUsers.length} cannot be deleted)
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
          
          {deletableUsers.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={isDeletingUser}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected ({deletableUsers.length})
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Bulk Delete Users
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium">
                You are about to permanently delete {deletableUsers.length} user account{deletableUsers.length > 1 ? 's' : ''}:
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {deletableUsers.map(user => (
                    <li key={user.id} className="flex justify-between">
                      <span>{user.first_name} {user.last_name}</span>
                      <span className="text-gray-500 text-xs">{user.role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {nonDeletableUsers.length > 0 && (
                <div className="bg-amber-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Cannot delete ({nonDeletableUsers.length}):
                  </p>
                  <ul className="text-sm text-amber-700">
                    {nonDeletableUsers.map(user => (
                      <li key={user.id}>
                        {user.first_name} {user.last_name} - {
                          user.id === useUserDeletion().profile?.id ? 'Cannot delete yourself' :
                          user.role === 'super_admin' ? 'Last super admin' :
                          'Insufficient permissions'
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-sm font-bold text-red-600">
                This action cannot be undone and will remove all associated data.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingUser}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={isDeletingUser || deletableUsers.length === 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingUser ? 'Deleting...' : `Delete ${deletableUsers.length} Users`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BulkUserActions;
