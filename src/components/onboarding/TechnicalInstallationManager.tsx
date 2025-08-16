
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatabaseClient, useClients } from '@/hooks/useClients';
import { MapPin, Calendar, Settings, CheckCircle } from 'lucide-react';

const TechnicalInstallationManager = () => {
  const { clients, updateClient, isLoading } = useClients();
  const [updatingClient, setUpdatingClient] = useState<string | null>(null);

  // Filter clients based on installation status
  const pendingInstallations = clients.filter(client => 
    client.status === 'approved' && (!client.installation_status || client.installation_status === 'pending')
  );
  
  const inProgressInstallations = clients.filter(client => 
    client.installation_status === 'in_progress'
  );
  
  const completedInstallations = clients.filter(client => 
    client.installation_status === 'completed'
  );

  const handleUpdateInstallationStatus = async (clientId: string, status: string) => {
    setUpdatingClient(clientId);
    try {
      await updateClient({
        id: clientId,
        updates: {
          installation_status: status,
          ...(status === 'completed' && {
            status: 'active',
            installation_date: new Date().toISOString(),
          })
        }
      });
    } catch (error) {
      console.error('Error updating installation status:', error);
    } finally {
      setUpdatingClient(null);
    }
  };

  const InstallationCard: React.FC<{ client: DatabaseClient; showActions?: boolean }> = ({ 
    client, 
    showActions = true 
  }) => (
    <Card key={client.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{client.name}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {client.address}, {client.county}
              </p>
              <p>{client.phone} | {client.email}</p>
              <p>Package: {client.service_packages?.name || 'N/A'} - KSh {client.monthly_rate}/month</p>
              <p>Connection: {client.connection_type}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={
              client.installation_status === 'completed' ? 'default' :
              client.installation_status === 'in_progress' ? 'secondary' : 'outline'
            }>
              {client.installation_status || 'pending'}
            </Badge>
            {showActions && (
              <div className="flex gap-2">
                {(!client.installation_status || client.installation_status === 'pending') && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateInstallationStatus(client.id, 'in_progress')}
                    disabled={updatingClient === client.id}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Start Installation
                  </Button>
                )}
                {client.installation_status === 'in_progress' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateInstallationStatus(client.id, 'completed')}
                    disabled={updatingClient === client.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Complete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Technical Installation Manager</h1>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Pending: {pendingInstallations.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">In Progress: {inProgressInstallations.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">Completed: {completedInstallations.length}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Installations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pending Installations ({pendingInstallations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              {pendingInstallations.map(client => (
                <InstallationCard key={client.id} client={client} />
              ))}
              {pendingInstallations.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No pending installations
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* In Progress Installations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              In Progress ({inProgressInstallations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              {inProgressInstallations.map(client => (
                <InstallationCard key={client.id} client={client} />
              ))}
              {inProgressInstallations.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No installations in progress
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Installations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recently Completed ({completedInstallations.slice(0, 10).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              {completedInstallations.slice(0, 10).map(client => (
                <InstallationCard key={client.id} client={client} showActions={false} />
              ))}
              {completedInstallations.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No completed installations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicalInstallationManager;
