
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRadiusUsers } from '@/hooks/useRadiusUsers';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { RadiusUser } from '@/services/radiusService';
import { Trash2, Power, RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const RadiusUserManager = () => {
  const { radiusUsers, isLoading, createRadiusUser, updateRadiusUser, deleteRadiusUser, disconnectUser, isCreating, isDeleting, isDisconnecting } = useRadiusUsers();
  const [selectedUser, setSelectedUser] = useState<RadiusUser | null>(null);

  const columns: ColumnDef<RadiusUser>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
    },
    {
      accessorKey: 'group_name',
      header: 'Group',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.group_name}</Badge>
      ),
    },
    {
      accessorKey: 'max_download',
      header: 'Download Limit',
    },
    {
      accessorKey: 'max_upload',
      header: 'Upload Limit',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'destructive'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'expiration',
      header: 'Expiration',
      cell: ({ row }) => 
        row.original.expiration ? new Date(row.original.expiration).toLocaleDateString() : 'No expiration'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => disconnectUser(row.original.username)}
            disabled={isDisconnecting}
          >
            <Power className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateRadiusUser({
              clientId: row.original.client_id,
              updates: { is_active: !row.original.is_active }
            })}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete RADIUS User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the RADIUS user for {row.original.username}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteRadiusUser(row.original.client_id)}
                  disabled={isDeleting}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RADIUS User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Total Users: {radiusUsers.length} | Active: {radiusUsers.filter(u => u.is_active).length}
              </div>
            </div>

            <DataTable
              columns={columns}
              data={radiusUsers}
              loading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
