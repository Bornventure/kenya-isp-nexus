
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricCard from '@/components/dashboard/MetricCard';
import { Users, UserPlus, Clock, CheckCircle, TrendingUp, Plus, AlertTriangle, MessageSquare } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import SalesClientRegistrationForm from '@/components/onboarding/SalesClientRegistrationForm';
import RejectedApplicationsTab from '@/components/dashboard/RejectedApplicationsTab';
import BulkMessagingInterface from '@/components/communication/BulkMessagingInterface';
import { useWorkflowOrchestration } from '@/hooks/useWorkflowOrchestration';

const SalesAccountManagerDashboard = () => {
  const { clients, isLoading } = useClients();
  const { profile } = useAuth();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const { notifyNetworkAdmin } = useWorkflowOrchestration();

  // Filter clients submitted by this sales user
  const mySubmissions = clients.filter(client => client.submitted_by === profile?.id);
  const pendingSubmissions = mySubmissions.filter(client => client.status === 'pending');
  const approvedSubmissions = mySubmissions.filter(client => client.status === 'approved');
  const activeClients = mySubmissions.filter(client => client.status === 'active');
  const rejectedSubmissions = mySubmissions.filter(client => client.status === 'rejected');

  const handleRegistrationSuccess = async (clientId: string) => {
    // Notify network admin of new registration
    await notifyNetworkAdmin(clientId);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <Button onClick={() => setShowRegistrationForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Register New Client
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <MetricCard
          title="Total Submissions"
          value={mySubmissions.length}
          icon={Users}
        />
        <MetricCard
          title="Pending Approval"
          value={pendingSubmissions.length}
          icon={Clock}
        />
        <MetricCard
          title="Approved Clients"
          value={approvedSubmissions.length}
          icon={CheckCircle}
        />
        <MetricCard
          title="Active Clients"
          value={activeClients.length}
          icon={TrendingUp}
        />
        <MetricCard
          title="Rejected"
          value={rejectedSubmissions.length}
          icon={AlertTriangle}
          className="border-red-200"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Rejected Applications
            {rejectedSubmissions.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {rejectedSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messaging">Bulk Messaging</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Recent Client Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mySubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No client submissions yet</p>
                  <Button 
                    onClick={() => setShowRegistrationForm(true)}
                    className="mt-4 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Register Your First Client
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySubmissions.slice(0, 10).map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <p className="text-sm text-gray-500">
                          {client.address} • {client.county}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            KES {client.monthly_rate.toLocaleString()}/month
                          </p>
                          <p className="text-xs text-gray-500">
                            {client.service_packages?.name}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            client.status === 'active' ? 'default' :
                            client.status === 'approved' ? 'secondary' :
                            client.status === 'rejected' ? 'destructive' :
                            client.status === 'pending' ? 'outline' : 'destructive'
                          }
                        >
                          {client.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <RejectedApplicationsTab />
        </TabsContent>

        <TabsContent value="messaging">
          <BulkMessagingInterface />
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRegistrationForm(true)}
                  className="gap-2 p-6 h-auto flex-col"
                >
                  <UserPlus className="h-8 w-8" />
                  <span>Register New Client</span>
                  <span className="text-xs text-gray-500">Submit for approval</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 p-6 h-auto flex-col"
                >
                  <Clock className="h-8 w-8" />
                  <span>Track Submissions</span>
                  <span className="text-xs text-gray-500">{pendingSubmissions.length} pending</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 p-6 h-auto flex-col"
                >
                  <MessageSquare className="h-8 w-8" />
                  <span>Send Messages</span>
                  <span className="text-xs text-gray-500">Bulk messaging</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <SalesClientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};

export default SalesAccountManagerDashboard;
