
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Wifi, 
  CheckCircle, 
  WifiOff, 
  AlertCircle, 
  Clock,
  UserCheck
} from 'lucide-react';

interface ClientGridViewProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
}

const ClientGridView: React.FC<ClientGridViewProps> = ({ clients, onViewClient }) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'approved': return <UserCheck className="h-3 w-3 mr-1" />;
      case 'suspended': return <WifiOff className="h-3 w-3 mr-1" />;
      case 'disconnected': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'pending': return <Clock className="h-3 w-3 mr-1" />;
      default: return null;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => (
        <Card key={client.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{client.clientType}</p>
                </div>
                <Badge className={getStatusColor(client.status)}>
                  {getStatusIcon(client.status)}
                  {client.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {client.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {client.location.subCounty}
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  {client.servicePackage}
                </div>
              </div>

              <div className="pt-2 border-t space-y-1">
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

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onViewClient(client)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientGridView;
