
import React from 'react';
import { Marker, Popup } from 'react-map-gl';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';
import { MapPin, Phone, Mail, Wifi } from 'lucide-react';

interface ClientMarkerProps {
  client: Client;
  showPopup: boolean;
  onTogglePopup: () => void;
}

const ClientMarker: React.FC<ClientMarkerProps> = ({ client, showPopup, onTogglePopup }) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'disconnected': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!client.location.coordinates) return null;

  return (
    <>
      <Marker
        longitude={client.location.coordinates.lng}
        latitude={client.location.coordinates.lat}
        anchor="bottom"
      >
        <div
          className={`w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform ${getStatusColor(client.status)}`}
          onClick={onTogglePopup}
        >
          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-current opacity-50 animate-ping"></div>
        </div>
      </Marker>

      {showPopup && (
        <Popup
          longitude={client.location.coordinates.lng}
          latitude={client.location.coordinates.lat}
          anchor="top"
          onClose={onTogglePopup}
          closeButton={false}
          className="w-80"
        >
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">{client.name}</h4>
              <Badge className={`${getStatusColor(client.status)} text-white`}>
                {client.status}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {client.location.address}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {client.phone}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {client.email}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                {client.servicePackage} ({client.connectionType})
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Monthly Rate:</span>
                <span className="font-medium">{formatCurrency(client.monthlyRate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Balance:</span>
                <span className={`font-medium ${client.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(client.balance)}
                </span>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};

export default ClientMarker;
