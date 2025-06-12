
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Ban, Play, Wifi, WifiOff } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientActionButtonsProps {
  client: Client;
  onEdit: () => void;
  onStatusChange: (status: Client['status']) => void;
}

const ClientActionButtons: React.FC<ClientActionButtonsProps> = ({ 
  client, 
  onEdit, 
  onStatusChange 
}) => {
  return (
    <div className="flex flex-wrap gap-3 pt-4 border-t">
      <Button onClick={onEdit} className="gap-2">
        <Edit className="h-4 w-4" />
        Edit Client
      </Button>
      
      {client.status === 'active' && (
        <>
          <Button 
            variant="outline" 
            onClick={() => onStatusChange('suspended')}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Ban className="h-4 w-4" />
            Suspend
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onStatusChange('disconnected')}
            className="gap-2 text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <WifiOff className="h-4 w-4" />
            Disconnect
          </Button>
        </>
      )}
      
      {(client.status === 'suspended' || client.status === 'pending') && (
        <Button 
          variant="outline" 
          onClick={() => onStatusChange('active')}
          className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
        >
          <Play className="h-4 w-4" />
          Activate
        </Button>
      )}
      
      {client.status === 'disconnected' && (
        <Button 
          variant="outline" 
          onClick={() => onStatusChange('active')}
          className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
        >
          <Wifi className="h-4 w-4" />
          Reconnect
        </Button>
      )}
    </div>
  );
};

export default ClientActionButtons;
