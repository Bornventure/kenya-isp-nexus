
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import MetricCard from '@/components/dashboard/MetricCard';
import ClientRegistrationForm from '@/components/forms/ClientRegistrationForm';
import RejectedApplicationsTab from '@/components/dashboard/RejectedApplicationsTab';
import BulkMessagingInterface from '@/components/communication/BulkMessagingInterface';
import { Users, UserPlus, AlertTriangle, MessageSquare, Eye } from 'lucide-react';

const SalesAccountManagerDashboard = () => {
  const { clients } = useClients();
  const { profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Filter clients by sales person
  const myClients = clients.filter(client => client.submitted_by === profile?.id);
  const rejectedClients = myClients.filter(client => client.rejection_reason);
  const pendingClients = myClients.filter(client => client.status === 'pending');
  const approvedClients = myClients.filter(client => client.status === 'approved');
  const activeClients = myClients.filter(client => client.status === 'active');

  const handleViewClientDetails = (clientId: string) => {
    console.log('View client details:', clientId);
    // Logic to view client details
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-600">Manage client registrations and track your performance</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Clients"
          value={myClients.length}
          icon={Users}
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingClients.length}
          icon={UserPlus}
        />
        <MetricCard
          title="Active Clients"
          value={activeClients.length}
          icon={Users}
        />
        <MetricCard
          title="Rejected"
          value={rejectedClients.length}
          icon={AlertTriangle}
        />
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="register">Register Client</TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedClients.length})
            </TabsTrigger>
            <TabsTrigger value="messaging">Bulk Messaging</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Client Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myClients.slice(0, 10).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{client.name}</h3>
                        <Badge variant={
                          client.status === 'active' ? 'default' :
                          client.status === 'approved' ? 'secondary' :
                          client.status === 'pending' ? 'outline' :
                          client.rejection_reason ? 'destructive' : 'outline'
                        }>
                          {client.rejection_reason ? 'Rejected' : client.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {client.email} • {client.phone}
                      </p>
                      <p className="text-xs text-gray-500">
                        {client.address}, {client.county}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewClientDetails(client.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                {myClients.length === 0 && (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No clients registered yet</h3>
                    <p className="text-gray-500 mb-4">Start by registering your first client</p>
                    <Button onClick={() => setSelectedTab('register')}>
                      Register First Client
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Register New Client</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientRegistrationForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <RejectedApplicationsTab />
        </TabsContent>

        <TabsContent value="messaging">
          <BulkMessagingInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesAccountManagerDashboard;
