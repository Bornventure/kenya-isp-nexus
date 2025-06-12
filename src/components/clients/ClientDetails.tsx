
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Client } from '@/types/client';
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
  onDelete?: (clientId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ 
  client, 
  onClose, 
  onEdit, 
  onStatusChange,
  onDelete,
  isUpdating = false,
  isDeleting = false
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Details - {client.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <PersonalInfoSection client={client} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <LocationInfoSection client={client} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <ServiceInfoSection client={client} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <ClientActionButtons 
                  client={client} 
                  onEdit={onEdit} 
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <EquipmentInfoSection client={client} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <PaymentInfoSection client={client} />
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;
