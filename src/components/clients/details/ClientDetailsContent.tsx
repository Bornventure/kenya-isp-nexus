
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, MapPin, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { DatabaseClient } from '@/hooks/useClients';
import ClientBillingSection from './ClientBillingSection';
import AssignedEquipmentSection from './AssignedEquipmentSection';
import ClientNetworkMonitoring from './ClientNetworkMonitoring';
import { format } from 'date-fns';

interface ClientDetailsContentProps {
  client: DatabaseClient;
  onEdit: () => void;
}

const ClientDetailsContent: React.FC<ClientDetailsContentProps> = ({ client, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      case 'approved': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <Badge variant={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {client.county}, {client.sub_county}
                </div>
              </div>
            </div>
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Service Package</div>
              <div className="text-lg font-semibold">
                {client.service_packages?.name || 'Not assigned'}
              </div>
              {client.service_packages?.speed && (
                <div className="text-sm text-muted-foreground">
                  {client.service_packages.speed}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Monthly Rate</div>
              <div className="text-lg font-semibold">
                KES {client.monthly_rate?.toLocaleString() || '0'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Wallet Balance</div>
              <div className="text-lg font-semibold">
                KES {client.wallet_balance?.toLocaleString() || '0'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Installation Date</div>
              <div className="text-lg font-semibold">
                {client.installation_date 
                  ? format(new Date(client.installation_date), 'PPP')
                  : 'Not set'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Network</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">ID Number</div>
                    <div>{client.id_number}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Client Type</div>
                    <div className="capitalize">{client.client_type}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Connection Type</div>
                    <div className="capitalize">{client.connection_type}</div>
                  </div>
                  {client.kra_pin_number && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">KRA PIN</div>
                      <div>{client.kra_pin_number}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Installation Status</div>
                    <div className="capitalize">{client.installation_status || 'pending'}</div>
                  </div>
                  {client.service_activated_at && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Service Activated</div>
                      <div>{format(new Date(client.service_activated_at), 'PPP')}</div>
                    </div>
                  )}
                  {client.subscription_start_date && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Subscription Period</div>
                      <div>
                        {format(new Date(client.subscription_start_date), 'PP')} - {' '}
                        {client.subscription_end_date 
                          ? format(new Date(client.subscription_end_date), 'PP')
                          : 'Ongoing'
                        }
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <ClientNetworkMonitoring 
            clientId={client.id} 
            clientName={client.name} 
          />
        </TabsContent>

        <TabsContent value="equipment">
          <AssignedEquipmentSection 
            clientId={client.id} 
            clientName={client.name} 
          />
        </TabsContent>

        <TabsContent value="billing">
          <ClientBillingSection 
            clientId={client.id} 
            clientName={client.name} 
          />
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Support ticket system coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetailsContent;
