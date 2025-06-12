
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';
import {
  X,
  CheckCircle,
  Clock,
  Ban,
  AlertCircle
} from 'lucide-react';

import PersonalInfoSection from './details/PersonalInfoSection';
import LocationInfoSection from './details/LocationInfoSection';
import ServiceInfoSection from './details/ServiceInfoSection';
import EquipmentInfoSection from './details/EquipmentInfoSection';
import PaymentInfoSection from './details/PaymentInfoSection';
import ClientActionButtons from './details/ClientActionButtons';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: Client['status']) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ 
  client, 
  onClose, 
  onEdit, 
  onStatusChange 
}) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'suspended':
        return <Ban className="h-4 w-4" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-semibold">{client.name}</CardTitle>
            <Badge className={`${getStatusColor(client.status)} gap-1`}>
              {getStatusIcon(client.status)}
              {client.status}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <PersonalInfoSection client={client} />
          <LocationInfoSection client={client} />
          <ServiceInfoSection client={client} />
          <EquipmentInfoSection client={client} />
          <PaymentInfoSection client={client} />
          <ClientActionButtons 
            client={client} 
            onEdit={onEdit} 
            onStatusChange={onStatusChange} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetails;
