import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClients, DatabaseClient } from '@/hooks/useClients';
import { Client } from '@/types/client';
import { Edit, MapPin, Phone, Mail, User, Calendar, CreditCard, Wifi } from 'lucide-react';
import ClientEditDialog from '../ClientEditDialog';
import ClientNetworkMonitoring from './ClientNetworkMonitoring';
import WalletAnalysisPanel from '../WalletAnalysisPanel';

interface ClientDetailsContentProps {
  client: Client;
  onRefresh?: () => void;
}

const ClientDetailsContent: React.FC<ClientDetailsContentProps> = ({ client, onRefresh }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { updateClient } = useClients();

  const handleUpdateClient = (clientData: any) => {
    updateClient({
      id: client.id,
      updates: clientData
    });
    onRefresh?.();
  };

  // Convert Client to DatabaseClient for the edit dialog
  const databaseClient: DatabaseClient = {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    county: client.county,
    sub_county: client.sub_county,
    id_number: client.id_number,
    kra_pin_number: client.kra_pin_number,
    mpesa_number: client.mpesa_number,
    client_type: client.client_type,
    connection_type: client.connection_type,
    monthly_rate: client.monthly_rate,
    status: client.status,
    service_package_id: client.service_package_id,
    latitude: client.latitude,
    longitude: client.longitude,
    isp_company_id: client.isp_company_id,
    created_at: client.created_at,
    updated_at: client.updated_at,
    balance: client.balance,
    wallet_balance: client.wallet_balance,
    subscription_start_date: client.subscription_start_date,
    subscription_end_date: client.subscription_end_date,
    subscription_type: client.subscription_type,
    is_active: client.is_active,
    submitted_by: client.submitted_by,
    approved_by: client.approved_by,
    approved_at: client.approved_at,
    installation_status: client.installation_status,
    installation_completed_by: client.installation_completed_by,
    installation_completed_at: client.installation_completed_at,
    service_activated_at: client.service_activated_at,
    installation_date: client.installation_date,
  };

  const servicePackage = client.service_packages || {
    name: 'Standard Package',
    speed: '10Mbps',
    monthly_rate: client.monthly_rate || 2500
  };

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {client.name}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                {client.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ID: {client.id_number}
              </span>
            </div>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Client
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(client.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Service Package</h4>
                <p className="text-sm">{servicePackage.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Speed</h4>
                <p className="text-sm">{servicePackage.speed}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Monthly Rate</h4>
                <p className="text-sm font-medium">KES {servicePackage.monthly_rate?.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Connection Type</h4>
                <Badge variant="outline">{client.connectionType}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <ClientNetworkMonitoring clientId={client.id} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <WalletAnalysisPanel clientId={client.id} onRefresh={onRefresh} />
          
          {/* Wallet Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Wallet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Current Balance</h4>
                <p className="text-lg font-semibold text-green-600">
                  KES {(client.wallet_balance || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Account Balance</h4>
                <p className="text-lg font-semibold">
                  KES {(client.balance || 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Support tickets and communication history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClientEditDialog
        client={databaseClient}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateClient={handleUpdateClient}
      />
    </div>
  );
};

export default ClientDetailsContent;
