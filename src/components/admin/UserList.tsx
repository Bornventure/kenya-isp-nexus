
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useUserActivation } from '@/hooks/useUserActivation';
import { useUserDeletion } from '@/hooks/useUserDeletion';
import { useUserMutations } from '@/hooks/useUserMutations';
import type { SystemUser } from '@/types/user';
import EditUserDialog from './EditUserDialog';

interface UserListProps {
  users: SystemUser[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  const { profile } = useAuth();
  const { toggleUserActivation, isUpdatingActivation } = useUserActivation();
  const { deleteUser, isDeletingUser, canDeleteUser } = useUserDeletion();
  const { updateUser, isUpdatingUser } = useUserMutations();
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'isp_admin':
        return 'bg-blue-100 text-blue-800';
      case 'customer_support':
        return 'bg-green-100 text-green-800';
      case 'technician':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleToggleActivation = (userId: string, currentStatus: boolean) => {
    toggleUserActivation({ userId, isActive: !currentStatus });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
  };

  const handleUpdateUser = (userData: any) => {
    if (editingUser) {
      updateUser({ id: editingUser.id, updates: userData });
      setEditingUser(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.email
                      }
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {formatRole(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isp_companies?.name || 'No Company'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.is_active ? (
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-red-500" />
                    )}
                    <span className={user.is_active ? 'text-green-700' : 'text-red-700'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => handleToggleActivation(user.id, user.is_active)}
                        disabled={isUpdatingActivation}
                      >
                        {user.is_active ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>

                      {canDeleteUser(user.id, user.role) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isDeletingUser}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUpdateUser={handleUpdateUser}
          isUpdating={isUpdatingUser}
        />
      )}
    </>
  );
};

export default UserList;
