
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { Client } from '@/types/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClientActionButtonsProps {
  client: Client;
  onEdit: () => void;
  onStatusChange: (status: Client['status']) => void;
  onDelete?: (clientId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const ClientActionButtons: React.FC<ClientActionButtonsProps> = ({ 
  client, 
  onEdit, 
  onStatusChange,
  onDelete,
  isUpdating = false,
  isDeleting = false
}) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'suspended': return <PowerOff className="h-3 w-3 mr-1" />;
      case 'disconnected': return <XCircle className="h-3 w-3 mr-1" />;
      case 'pending': return <AlertCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const canClientLogin = client.status === 'active';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Status & Actions</h3>
          <p className="text-sm text-gray-600">Manage client status and account</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(client.status)}>
            {getStatusIcon(client.status)}
            {client.status}
          </Badge>
          <Badge className={canClientLogin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {canClientLogin ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Can Login
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Cannot Login
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the client "{client.name}" and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(client.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Client
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Status Controls */}
        <div className="grid grid-cols-1 gap-2">
          {client.status === 'pending' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusChange('active')}
              disabled={isUpdating}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Power className="h-4 w-4 mr-2" />
              Activate Client
            </Button>
          )}

          {client.status === 'active' && (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusChange('suspended')}
                disabled={isUpdating}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                Suspend
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusChange('pending')}
                disabled={isUpdating}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                Deactivate
              </Button>
            </div>
          )}
          
          {client.status === 'suspended' && (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusChange('active')}
                disabled={isUpdating}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                Reactivate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusChange('disconnected')}
                disabled={isUpdating}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>
          )}
          
          {client.status === 'disconnected' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusChange('active')}
              disabled={isUpdating}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Power className="h-4 w-4 mr-2" />
              Reconnect Service
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientActionButtons;
