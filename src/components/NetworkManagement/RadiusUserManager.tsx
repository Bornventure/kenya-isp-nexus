
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRadiusUsers } from '@/hooks/useRadiusUsers';
import { Trash2, Power, RotateCcw, Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const RadiusUserManager = () => {
  const { radiusUsers, isLoading, updateRadiusUser, deleteRadiusUser, disconnectUser, isDeleting, isDisconnecting } = useRadiusUsers();

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading RADIUS users...</div>
        </CardContent>
      </Card>
    );
  }

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

            <div className="grid gap-4">
              {radiusUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{user.username}</h3>
                        {getStatusBadge(user.is_active)}
                      </div>
                      <p className="text-sm text-muted-foreground">Group: {user.group_name}</p>
                      <div className="text-sm">
                        <span>Download: {user.max_download}</span>
                        <span className="ml-4">Upload: {user.max_upload}</span>
                      </div>
                      {user.expiration && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(user.expiration).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => disconnectUser(user.username)}
                        disabled={isDisconnecting}
                        title="Disconnect User"
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRadiusUser({
                          clientId: user.client_id,
                          updates: { is_active: !user.is_active }
                        })}
                        title="Toggle Active Status"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" title="Delete User">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete RADIUS User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the RADIUS user "{user.username}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRadiusUser(user.client_id)}
                              disabled={isDeleting}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}

              {radiusUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No RADIUS Users</h3>
                  <p className="text-gray-500">
                    RADIUS users are automatically created when clients are activated with service packages.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
