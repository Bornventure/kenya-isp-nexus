
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Client } from '@/types/client';
import {
  Phone,
  Mail,
  MapPin,
  Wifi,
  Signal,
  CheckCircle,
  WifiOff,
  AlertCircle,
  Clock,
  Users,
  UserCheck
} from 'lucide-react';

interface ClientListViewProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
}

const ClientListView: React.FC<ClientListViewProps> = ({ clients, onViewClient }) => {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Connection</TableHead>
            <TableHead>Monthly Rate</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{client.name}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(client.status)}>
                  {getStatusIcon(client.status)}
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{client.clientType}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {client.location.subCounty}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.location.address}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  {client.servicePackage}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Signal className="h-3 w-3" />
                  {client.connectionType}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(client.monthlyRate)}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${
                  client.balance < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(client.balance)}
                </span>
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewClient(client)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientListView;
