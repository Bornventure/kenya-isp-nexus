
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, User, Wrench, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';

const TechnicalInstallationManager = () => {
  const { clients, isLoading } = useClients();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');

  // Filter clients based on installation status
  const pendingInstallations = clients.filter(client => 
    client.status === 'approved' && client.installation_status === 'pending'
  );
  
  const inProgressInstallations = clients.filter(client => 
    client.installation_status === 'in_progress'
  );
  
  const completedInstallations = clients.filter(client => 
    client.installation_status === 'completed'
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Installation</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-600">Completed</Badge>;
      default:
        return <Badge variant="destructive">Unknown</Badge>;
    }
  };

  const renderInstallationCard = (client: any) => (
    <Card key={client.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon(client.installation_status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">{client.name}</h3>
                {getStatusBadge(client.installation_status)}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>{client.address}, {client.sub_county}, {client.county}</span>
                </div>
                {client.installation_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Scheduled: {new Date(client.installation_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {client.installation_status === 'pending' && (
              <Button size="sm" variant="outline">
                Schedule Installation
              </Button>
            )}
            {client.installation_status === 'in_progress' && (
              <Button size="sm">
                Mark Complete
              </Button>
            )}
            <Button size="sm" variant="ghost">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading installations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Technical Installation Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingInstallations.length}</div>
              <div className="text-sm text-muted-foreground">Pending Installations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressInstallations.length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedInstallations.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending ({pendingInstallations.length})</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress ({inProgressInstallations.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedInstallations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              {pendingInstallations.length > 0 ? (
                pendingInstallations.map(renderInstallationCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending installations
                </div>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="mt-4">
              {inProgressInstallations.length > 0 ? (
                inProgressInstallations.map(renderInstallationCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No installations in progress
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {completedInstallations.length > 0 ? (
                completedInstallations.map(renderInstallationCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No completed installations
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalInstallationManager;
