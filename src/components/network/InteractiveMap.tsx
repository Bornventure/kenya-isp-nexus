
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Client } from '@/types/client';
import { 
  MapPin, 
  Wifi, 
  Phone, 
  Mail,
  ZoomIn,
  ZoomOut,
  Locate
} from 'lucide-react';

interface InteractiveMapProps {
  clients: Client[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ clients }) => {
  const [zoom, setZoom] = useState(1);

  // Kisumu area bounds (more detailed)
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

      {/* Detailed Map Background */}
      <div 
        className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        {/* Lake Victoria */}
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-blue-300 rounded-tr-full opacity-70">
          <div className="absolute top-4 left-4 text-xs text-blue-800 font-medium">Lake Victoria</div>
        </div>
        
        {/* Kisumu CBD */}
        <div className="absolute top-1/4 left-1/3 w-1/5 h-1/6 bg-gray-300 rounded-lg opacity-60">
          <div className="absolute top-1 left-1 text-xs text-gray-700 font-medium">Kisumu CBD</div>
        </div>
        
        {/* Milimani Estate */}
        <div className="absolute top-1/6 right-1/4 w-1/6 h-1/8 bg-green-200 rounded-lg opacity-60">
          <div className="absolute top-1 left-1 text-xs text-green-700 font-medium">Milimani</div>
        </div>
        
        {/* Kondele */}
        <div className="absolute top-1/2 left-1/5 w-1/6 h-1/8 bg-orange-200 rounded-lg opacity-60">
          <div className="absolute top-1 left-1 text-xs text-orange-700 font-medium">Kondele</div>
        </div>
        
        {/* Nyamasaria */}
        <div className="absolute bottom-1/4 right-1/3 w-1/6 h-1/8 bg-purple-200 rounded-lg opacity-60">
          <div className="absolute top-1 left-1 text-xs text-purple-700 font-medium">Nyamasaria</div>
        </div>
        
        {/* Major Roads */}
        <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gray-500 opacity-60">
          <div className="absolute -top-4 left-1/4 text-xs text-gray-600">Kisumu-Kakamega Road</div>
        </div>
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-500 opacity-60">
          <div className="absolute top-1/4 -left-8 text-xs text-gray-600 transform -rotate-90">Nairobi-Kisumu Highway</div>
        </div>
        <div className="absolute top-2/3 left-1/4 w-2/3 h-0.5 bg-gray-400 opacity-50 transform rotate-12">
          <div className="absolute -top-4 left-1/3 text-xs text-gray-600">Bondo Road</div>
        </div>
        
        {/* Client markers with hover cards */}
        {clients.map((client) => {
          const position = getClientPosition(client);
          return (
            <HoverCard key={client.id} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div
                  className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform ${getStatusColor(client.status)}`}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                >
                  <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-current opacity-50 animate-ping"></div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" side="top">
                <div className="space-y-2">
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
              </HoverCardContent>
            </HoverCard>
          );
        })}

        {/* Network towers with labels */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-8 bg-red-600 rounded-sm shadow-lg"></div>
          <div className="absolute -top-1 -left-2 w-7 h-2 bg-red-400 rounded-full"></div>
          <div className="absolute -bottom-6 -left-4 text-xs text-red-700 font-medium">Tower 1</div>
        </div>
        <div className="absolute top-3/4 right-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-8 bg-red-600 rounded-sm shadow-lg"></div>
          <div className="absolute -top-1 -left-2 w-7 h-2 bg-red-400 rounded-full"></div>
          <div className="absolute -bottom-6 -left-4 text-xs text-red-700 font-medium">Tower 2</div>
        </div>
      </div>

      {/* Enhanced Map Legend */}
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
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-gray-500"></div>
                <span>Major Roads</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveMap;
