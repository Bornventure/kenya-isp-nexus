
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatabaseClient, useClients } from '@/hooks/useClients';
import { Users, Plus, TrendingUp, DollarSign } from 'lucide-react';
import ClientRegistrationForm from '@/components/clients/ClientRegistrationForm';

const SalesAccountManagerDashboard = () => {
  const { clients, isLoading } = useClients();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  // Filter clients by status for different metrics
  const pendingClients = clients.filter(client => client.status === 'pending');
  const activeClients = clients.filter(client => client.status === 'active');
  const recentClients = clients.filter(client => {
    const createdDate = new Date(client.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo && client.submitted_by === 'sales';
  });

  const totalRevenue = activeClients.reduce((sum, client) => sum + client.monthly_rate, 0);

  const handleClientSave = (client: Partial<DatabaseClient>) => {
    console.log('Client saved:', client);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Account Manager Dashboard</h1>
        <Button onClick={() => setShowRegistrationForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeClients.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Additions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Client Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClients.slice(0, 10).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                  <p className="text-sm">
                    Service: {client.service_packages?.name || 'Package not found'} - KSh {client.monthly_rate}/month
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={client.status === 'active' ? 'default' : 
                            client.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {client.status}
                  </Badge>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {recentClients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent client applications found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <ClientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSave={handleClientSave}
        />
      )}
    </div>
  );
};

export default SalesAccountManagerDashboard;
