import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClients, type DatabaseClient } from '@/hooks/useClients';
import { Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { EnhancedApprovalDialog } from './EnhancedApprovalDialog';

const WorkflowDashboard: React.FC = () => {
  const { clients, isLoading } = useClients();
  const [selectedClient, setSelectedClient] = useState<DatabaseClient | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const getWorkflowStage = (client: DatabaseClient) => {
    if (client.status === 'pending') return 'Review';
    if (client.status === 'approved' && client.installation_status === 'pending') return 'Installation';
    if (client.installation_status === 'completed' && !client.service_activated_at) return 'Activation';
    if (client.service_activated_at) return 'Active';
    return 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';  
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingClients = clients.filter(client => client.status === 'pending');
  const approvedClients = clients.filter(client => client.status === 'approved');
  const activeClients = clients.filter(client => client.status === 'active');
  const rejectedClients = clients.filter(client => client.status === 'rejected');

  const recentlyActivated = clients
    .filter(client => client.service_activated_at)
    .sort((a, b) => new Date(b.service_activated_at!).getTime() - new Date(a.service_activated_at!).getTime())
    .slice(0, 5);

  const handleApprovalClick = (client: DatabaseClient) => {
    setSelectedClient(client);
    setApprovalDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for installation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Service active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {activeClients.reduce((sum, client) => sum + (client.monthly_rate || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring
            </p>
          </CardContent>
        </Card>
      </div>

      
      
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingClients.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedClients.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeClients.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedClients.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clients Awaiting Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                      <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                    </div>
                    <Button 
                      onClick={() => handleApprovalClick(client)}
                      size="sm"
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>

      <EnhancedApprovalDialog
        client={selectedClient}
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
      />
    </div>
  );
};

export default WorkflowDashboard;
