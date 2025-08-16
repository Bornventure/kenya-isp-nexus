
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/useClients';
import { Users, Network, AlertTriangle, CheckCircle } from 'lucide-react';
import NOCClientApprovalDialog from '@/components/onboarding/NOCClientApprovalDialog';
import { DatabaseClient } from '@/types/database';

const NetworkOperationsDashboard = () => {
  const { clients, updateClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<DatabaseClient | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  // Filter clients that need approval
  const pendingClients = clients.filter(client => client.status === 'pending');
  const activeClients = clients.filter(client => client.status === 'active');
  const suspendedClients = clients.filter(client => client.status === 'suspended');

  const handleApproveClient = async () => {
    if (!selectedClient) return;

    try {
      await updateClient({
        id: selectedClient.id,
        updates: {
          status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: 'NOC Team', // This should be the current user
        }
      });
      
      setApprovalDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error approving client:', error);
    }
  };

  const openApprovalDialog = (client: DatabaseClient) => {
    setSelectedClient(client);
    setApprovalDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Clients awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Network className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Service suspended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Clients Pending Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingClients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No clients pending approval</p>
          ) : (
            <div className="space-y-4">
              {pendingClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>{client.connection_type}</span> • 
                      <span className="ml-1">KSh {client.monthly_rate.toLocaleString()}/month</span> • 
                      <span className="ml-1">{client.county}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => openApprovalDialog(client)}
                    className="ml-4"
                  >
                    Review & Approve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Clients Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Active Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeClients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active clients</p>
          ) : (
            <div className="space-y-4">
              {activeClients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>{client.connection_type}</span> • 
                      <span className="ml-1">KSh {client.monthly_rate.toLocaleString()}/month</span> • 
                      <span className="ml-1">{client.county}</span>
                    </div>
                  </div>
                </div>
              ))}
              {activeClients.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  And {activeClients.length - 5} more active clients...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      {selectedClient && (
        <NOCClientApprovalDialog
          client={selectedClient}
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          onApprove={handleApproveClient}
        />
      )}
    </div>
  );
};

export default NetworkOperationsDashboard;
