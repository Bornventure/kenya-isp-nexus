
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';
import { MapPin, Phone, Mail, Wifi } from 'lucide-react';
import L from 'leaflet';

interface ClientMarkerProps {
  client: Client;
  showPopup: boolean;
  isHovered?: boolean;
  onTogglePopup: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

const ClientMarker: React.FC<ClientMarkerProps> = ({ 
  client, 
  showPopup, 
  isHovered = false,
  onTogglePopup, 
  onHover,
  onHoverEnd 
}) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return '#10b981'; // green-500
      case 'suspended': return '#ef4444'; // red-500
      case 'pending': return '#eab308'; // yellow-500
      case 'disconnected': return '#6b7280'; // gray-500
      default: return '#6b7280';
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

  // Create custom icon based on client status
  const size = isHovered ? 20 : 16;
  const pulseSize = isHovered ? 24 : 20;
  
  const customIcon = L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${getStatusColor(client.status)};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        position: relative;
        transition: all 0.2s ease;
        ${isHovered ? 'transform: scale(1.2);' : ''}
      ">
        <div style="
          position: absolute;
          top: -2px;
          left: -2px;
          width: ${pulseSize}px;
          height: ${pulseSize}px;
          border: 2px solid ${getStatusColor(client.status)};
          border-radius: 50%;
          opacity: 0.5;
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      </div>
      <style>
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      </style>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  return (
    <Marker
      position={[client.location.coordinates.lat, client.location.coordinates.lng]}
      icon={customIcon}
      eventHandlers={{
        click: onTogglePopup,
        mouseover: onHover,
        mouseout: onHoverEnd,
      }}
    >
      {(showPopup || isHovered) && (
        <Popup
          closeButton={false}
          className="w-80"
          eventHandlers={{
            remove: onTogglePopup,
          }}
        >
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">{client.name}</h4>
              <Badge 
                className="text-white"
                style={{ backgroundColor: getStatusColor(client.status) }}
              >
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
    </Marker>
  );
};

export default ClientMarker;
