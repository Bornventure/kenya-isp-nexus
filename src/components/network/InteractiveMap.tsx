
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';
import { 
  MapPin, 
  Wifi, 
  Phone, 
  Mail, 
  X,
  ZoomIn,
  ZoomOut,
  Locate
} from 'lucide-react';

interface InteractiveMapProps {
  clients: Client[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [zoom, setZoom] = useState(1);

  // Kisumu area bounds (simplified)
  const mapBounds = {
    minLat: -0.15,
    maxLat: -0.05,
    minLng: 34.70,
    maxLng: 34.80
  };

  const getClientPosition = (client: Client) => {
    if (!client.location.coordinates) return { x: 0, y: 0 };
    
    const { lat, lng } = client.location.coordinates;
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

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

  return (
    <div className="relative bg-slate-50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-white shadow-md"
          onClick={() => setZoom(Math.min(3, zoom + 0.2))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-white shadow-md"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-white shadow-md"
          onClick={() => setZoom(1)}
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Background */}
      <div 
        className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        {/* Kisumu Lake Victoria representation */}
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-blue-200 rounded-tr-full opacity-60"></div>
        
        {/* City areas */}
        <div className="absolute top-1/4 left-1/3 w-1/4 h-1/4 bg-gray-200 rounded-lg opacity-40"></div>
        <div className="absolute top-1/2 right-1/4 w-1/5 h-1/5 bg-gray-200 rounded-lg opacity-40"></div>
        
        {/* Roads (simplified) */}
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gray-400 opacity-50"></div>
        <div className="absolute top-0 left-1/2 w-1 h-full bg-gray-400 opacity-50"></div>
        
        {/* Client markers */}
        {clients.map((client) => {
          const position = getClientPosition(client);
          return (
            <div
              key={client.id}
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform ${getStatusColor(client.status)}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              onClick={() => setSelectedClient(client)}
            >
              <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-current opacity-50 animate-ping"></div>
            </div>
          );
        })}

        {/* Network towers (mock positions) */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-8 bg-red-600 rounded-sm shadow-lg"></div>
          <div className="absolute -top-1 -left-2 w-7 h-2 bg-red-400 rounded-full"></div>
        </div>
        <div className="absolute top-3/4 right-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-8 bg-red-600 rounded-sm shadow-lg"></div>
          <div className="absolute -top-1 -left-2 w-7 h-2 bg-red-400 rounded-full"></div>
        </div>
      </div>

      {/* Client Details Popup */}
      {selectedClient && (
        <div className="absolute top-4 left-4 z-30">
          <Card className="w-80 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedClient(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(selectedClient.status)} text-white`}>
                    {selectedClient.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedClient.clientType}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {selectedClient.location.address}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {selectedClient.phone}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {selectedClient.email}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  {selectedClient.servicePackage} ({selectedClient.connectionType})
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Rate:</span>
                    <span className="font-medium">{formatCurrency(selectedClient.monthlyRate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Balance:</span>
                    <span className={`font-medium ${selectedClient.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedClient.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="shadow-md">
          <CardContent className="p-3">
            <h4 className="font-medium text-sm mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Active Client</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Suspended</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-8 bg-red-600 rounded-sm"></div>
                <span>Network Tower</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveMap;
