
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Wifi,
  Settings,
  PlayCircle
} from 'lucide-react';
import ClientNetworkControl from './ClientNetworkControl';
import ClientOnboardingManager from '../ClientOnboardingManager';
import AssignedEquipmentSection from './AssignedEquipmentSection';
import ClientNetworkMonitoring from './ClientNetworkMonitoring';

interface ClientDetailsPageProps {
  client: any;
  onUpdate?: () => void;
}

const ClientDetailsPage: React.FC<ClientDetailsPageProps> = ({ client, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <p className="text-gray-600">{client.email || client.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(client.status)}>
                {client.status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
              {client.status === 'approved' && (
                <Button onClick={() => setActiveTab('onboarding')} className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Start Onboarding
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Client Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p>{client.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">ID Number:</span>
                    <p>{client.id_number}</p>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {client.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">KRA PIN:</span>
                    <p>{client.kra_pin_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">M-Pesa:</span>
                    <p>{client.mpesa_number || client.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Address:</span>
                    <p>{client.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">County:</span>
                      <p>{client.county}</p>
                    </div>
                    <div>
                      <span className="font-medium">Sub County:</span>
                      <p>{client.sub_county}</p>
                    </div>
                  </div>
                  {client.latitude && client.longitude && (
                    <div>
                      <span className="font-medium">Coordinates:</span>
                      <p className="font-mono text-xs">
                        {client.latitude}, {client.longitude}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Service Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Package:</span>
                    <p>{client.service_packages?.name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Monthly Rate:</span>
                    <p>KES {client.monthly_rate?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Connection Type:</span>
                    <p className="capitalize">{client.connection_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Client Type:</span>
                    <p className="capitalize">{client.client_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Installation Date:</span>
                    <p>{client.installation_date ? new Date(client.installation_date).toLocaleDateString() : 'Not scheduled'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Installation Status:</span>
                    <Badge variant="outline">{client.installation_status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Account Balance:</span>
                    <p className={`font-bold ${client.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      KES {client.balance?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Wallet Balance:</span>
                    <p className="font-bold text-blue-600">
                      KES {client.wallet_balance?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Subscription Start:</span>
                    <p>{client.subscription_start_date ? new Date(client.subscription_start_date).toLocaleDateString() : 'Not started'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Subscription End:</span>
                    <p>{client.subscription_end_date ? new Date(client.subscription_end_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <ClientOnboardingManager
            clientId={client.id}
            clientName={client.name}
            onComplete={() => {
              if (onUpdate) onUpdate();
              setActiveTab('network');
            }}
          />
        </TabsContent>

        <TabsContent value="network">
          <ClientNetworkControl
            clientId={client.id}
            clientName={client.name}
          />
        </TabsContent>

        <TabsContent value="equipment">
          <AssignedEquipmentSection clientId={client.id} />
        </TabsContent>

        <TabsContent value="monitoring">
          <ClientNetworkMonitoring clientId={client.id} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Client Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Client settings and configuration options will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetailsPage;
