
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricCard from '@/components/dashboard/MetricCard';
import { Network, Users, Clock, CheckCircle, Settings, AlertTriangle } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import PendingApprovalsWidget from '@/components/dashboard/PendingApprovalsWidget';
import EnhancedApprovalDialog from '@/components/noc/EnhancedApprovalDialog';
import { usePaymentMonitoring } from '@/hooks/usePaymentMonitoring';
import { useWalletMonitoring } from '@/hooks/useWalletMonitoring';

const NetworkAdminDashboard = () => {
  const { clients, isLoading } = useClients();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  // Initialize monitoring hooks
  usePaymentMonitoring();
  useWalletMonitoring();

  // Filter clients by status
  const pendingClients = clients.filter(client => client.status === 'pending');
  const approvedClients = clients.filter(client => client.status === 'approved');
  const activeClients = clients.filter(client => client.status === 'active');
  const rejectedClients = clients.filter(client => client.status === 'rejected');

  const handleApprove = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setShowApprovalDialog(true);
    }
  };

  const handleReject = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setShowApprovalDialog(true);
    }
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
        <h1 className="text-3xl font-bold">Network Operations Center</h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <MetricCard
          title="Pending Approvals"
          value={pendingClients.length}
          icon={Clock}
          className="border-orange-200"
        />
        <MetricCard
          title="Approved Clients"
          value={approvedClients.length}
          icon={CheckCircle}
          className="border-green-200"
        />
        <MetricCard
          title="Active Services"
          value={activeClients.length}
          icon={Network}
        />
        <MetricCard
          title="Total Clients"
          value={clients.length}
          icon={Users}
        />
        <MetricCard
          title="Rejected"
          value={rejectedClients.length}
          icon={AlertTriangle}
          className="border-red-200"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approvals" className="relative">
            Pending Approvals
            {pendingClients.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white rounded-full text-xs h-5 w-5 flex items-center justify-center">
                {pendingClients.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active Services</TabsTrigger>
          <TabsTrigger value="monitoring">Service Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <PendingApprovalsWidget
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Active Services ({activeClients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeClients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active services</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex-1">
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.phone} • {client.email}</p>
                        <p className="text-sm text-gray-500">
                          Package: KES {client.monthly_rate?.toLocaleString()}/month
                        </p>
                        <p className="text-xs text-gray-500">
                          Active since: {new Date(client.service_activated_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">Active</span>
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Service Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Service monitoring is active in the background.
                  Payment monitoring and wallet balance checks are running automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Network Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Network reports will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Approval Dialog */}
      <EnhancedApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        client={selectedClient}
      />
    </div>
  );
};

export default NetworkAdminDashboard;
