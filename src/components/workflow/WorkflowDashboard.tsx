import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  CreditCard,
  Settings,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useWorkflowManagement } from '@/hooks/useWorkflowManagement';
import { useClients } from '@/hooks/useClients';
import EnhancedApprovalDialog from './EnhancedApprovalDialog';

const WorkflowDashboard: React.FC = () => {
  const { workflowStages, getClientsInStage } = useWorkflowManagement();
  const { clients } = useClients();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  const pendingApproval = getClientsInStage('pending_approval');
  const approved = getClientsInStage('approved');
  const rejected = getClientsInStage('rejected');
  const equipmentAssigned = getClientsInStage('equipment_assigned');
  const invoiceGenerated = getClientsInStage('invoice_generated');
  const paymentPending = getClientsInStage('payment_pending');
  const serviceActive = getClientsInStage('service_active');

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'equipment_assigned': return 'bg-blue-100 text-blue-800';
      case 'invoice_generated': return 'bg-purple-100 text-purple-800';
      case 'payment_pending': return 'bg-orange-100 text-orange-800';
      case 'service_active': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReviewClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setIsApprovalDialogOpen(true);
    }
  };

  const StageCard = ({ title, count, stage, icon: Icon, description }: {
    title: string;
    count: number;
    stage: string;
    icon: any;
    description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const WorkflowStageList = ({ stageClients, stageName }: { stageClients: any[], stageName: string }) => (
    <div className="space-y-4">
      {stageClients.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No clients in {stageName} stage
        </p>
      ) : (
        stageClients.map((stage) => {
          const client = clients.find(c => c.id === stage.client_id);
          if (!client) return null;

          return (
            <Card key={stage.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{client.name}</h3>
                      <Badge className={getStageColor(stage.current_stage)}>
                        {stage.current_stage.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Phone: {client.phone}</p>
                      <p>Location: {client.county}, {client.sub_county}</p>
                      <p>Package: KES {client.monthly_rate}</p>
                    </div>
                    {stage.notes && (
                      <p className="text-sm bg-gray-50 p-2 rounded">{stage.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewClient(client.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          {workflowStages.length} Total Active Workflows
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StageCard
          title="Pending Approval"
          count={pendingApproval.length}
          stage="pending_approval"
          icon={Clock}
          description="Awaiting network admin review"
        />
        <StageCard
          title="Equipment Assigned"
          count={equipmentAssigned.length}
          stage="equipment_assigned"
          icon={Package}
          description="Equipment ready for installation"
        />
        <StageCard
          title="Payment Pending"
          count={paymentPending.length}
          stage="payment_pending"
          icon={CreditCard}
          description="Waiting for installation payment"
        />
        <StageCard
          title="Service Active"
          count={serviceActive.length}
          stage="service_active"
          icon={CheckCircle}
          description="Fully activated clients"
        />
      </div>

      {/* Detailed Workflow Stages */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingApproval.length})
          </TabsTrigger>
          <TabsTrigger value="equipment">
            Equipment ({equipmentAssigned.length})
          </TabsTrigger>
          <TabsTrigger value="payment">
            Payment ({paymentPending.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({serviceActive.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Clients Awaiting Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowStageList stageClients={pendingApproval} stageName="pending approval" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Equipment Assignment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowStageList stageClients={equipmentAssigned} stageName="equipment assignment" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Pending Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowStageList stageClients={paymentPending} stageName="payment pending" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Active Service Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowStageList stageClients={serviceActive} stageName="active service" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Approval Dialog */}
      {selectedClient && (
        <EnhancedApprovalDialog
          client={selectedClient}
          open={isApprovalDialogOpen}
          onOpenChange={setIsApprovalDialogOpen}
        />
      )}
    </div>
  );
};

export default WorkflowDashboard;
