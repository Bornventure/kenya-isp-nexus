
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveClientMonitor } from './LiveClientMonitor';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Wifi, 
  CreditCard,
  Calendar,
  Settings
} from 'lucide-react';

interface ClientDetailsViewProps {
  client: any;
}

export const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ client }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {client.name}
              </CardTitle>
              <div className="text-sm text-gray-600">
                Client ID: {client.id}
              </div>
            </div>
            <Badge className={getStatusColor(client.status)}>
              {client.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{client.phone}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{client.county}, {client.sub_county}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network" className="flex items-center gap-1">
            <Wifi className="h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Service
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="network">
          <LiveClientMonitor 
            clientId={client.id} 
            clientName={client.name}
          />
        </TabsContent>

        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600">Service Package</div>
                  <div className="mt-1">{client.service_packages?.name || 'No package assigned'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Monthly Rate</div>
                  <div className="mt-1">KES {client.monthly_rate?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Connection Type</div>
                  <div className="mt-1 capitalize">{client.connection_type}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Speed</div>
                  <div className="mt-1">{client.service_packages?.speed || 'Not specified'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600">Account Balance</div>
                  <div className="mt-1 text-lg font-semibold">
                    KES {client.balance?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Wallet Balance</div>
                  <div className="mt-1 text-lg font-semibold text-green-600">
                    KES {client.wallet_balance?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Subscription Period</div>
                  <div className="mt-1">
                    {client.subscription_start_date && client.subscription_end_date ? (
                      `${new Date(client.subscription_start_date).toLocaleDateString()} - ${new Date(client.subscription_end_date).toLocaleDateString()}`
                    ) : (
                      'Not set'
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">M-Pesa Number</div>
                  <div className="mt-1">{client.mpesa_number || 'Not provided'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Client History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-2 border-blue-200 pl-4">
                  <div className="text-sm font-medium">Client Registered</div>
                  <div className="text-xs text-gray-600">
                    {new Date(client.created_at).toLocaleString()}
                  </div>
                </div>
                {client.approved_at && (
                  <div className="border-l-2 border-green-200 pl-4">
                    <div className="text-sm font-medium">Client Approved</div>
                    <div className="text-xs text-gray-600">
                      {new Date(client.approved_at).toLocaleString()}
                    </div>
                  </div>
                )}
                {client.service_activated_at && (
                  <div className="border-l-2 border-purple-200 pl-4">
                    <div className="text-sm font-medium">Service Activated</div>
                    <div className="text-xs text-gray-600">
                      {new Date(client.service_activated_at).toLocaleString()}
                    </div>
                  </div>
                )}
                {client.installation_completed_at && (
                  <div className="border-l-2 border-orange-200 pl-4">
                    <div className="text-sm font-medium">Installation Completed</div>
                    <div className="text-xs text-gray-600">
                      {new Date(client.installation_completed_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
