
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, User, Calendar, Package, CreditCard } from 'lucide-react';
import { Client } from '@/types/client';

export interface ClientDetailsProps {
  client: Client;
  onEdit: () => void;
  onSuspend?: () => void;
  onActivate?: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onEdit, onSuspend, onActivate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusAction = () => {
    if (client.status === 'active' && onSuspend) {
      onSuspend();
    } else if ((client.status === 'suspended' || client.status === 'inactive') && onActivate) {
      onActivate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <Badge className={getStatusColor(client.status)}>
            {client.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit}>Edit Client</Button>
          {(client.status === 'active' || client.status === 'suspended' || client.status === 'inactive') && (
            <Button 
              variant={client.status === 'active' ? 'destructive' : 'default'}
              onClick={handleStatusAction}
            >
              {client.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
          )}
        </div>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{client.phone}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">ID Number</p>
              <p>{client.id_number}</p>
            </div>
            {client.kra_pin_number && (
              <div>
                <p className="text-sm text-muted-foreground">KRA PIN</p>
                <p>{client.kra_pin_number}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Client Type</p>
              <p className="capitalize">{client.client_type}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p>{client.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">County</p>
                <p>{client.county}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sub County</p>
                <p>{client.sub_county}</p>
              </div>
            </div>
            {client.latitude && client.longitude && (
              <div>
                <p className="text-sm text-muted-foreground">Coordinates</p>
                <p className="text-xs font-mono">{client.latitude}, {client.longitude}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Service Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Service Package</p>
              <p>{client.service_packages?.name || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection Type</p>
              <p className="capitalize">{client.connection_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rate</p>
              <p>KES {client.monthly_rate.toLocaleString()}</p>
            </div>
            {client.installation_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Installation Date</p>
                  <p>{new Date(client.installation_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Account Balance</p>
              <p className={`font-semibold ${client.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                KES {client.balance.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet Balance</p>
              <p>KES {client.wallet_balance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">M-Pesa Number</p>
              <p>{client.mpesa_number}</p>
            </div>
            {client.subscription_start_date && (
              <div>
                <p className="text-sm text-muted-foreground">Subscription Period</p>
                <p className="text-sm">
                  {new Date(client.subscription_start_date).toLocaleDateString()} - 
                  {client.subscription_end_date ? new Date(client.subscription_end_date).toLocaleDateString() : 'Ongoing'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetails;
