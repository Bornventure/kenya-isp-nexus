
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useEquipment } from '@/hooks/useEquipment';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, Users, FileText, Settings, Send } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  department: 'sales' | 'network_admin';
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
}

const ClientOnboardingWorkflow: React.FC = () => {
  const { clients, updateClient, isLoading } = useClients();
  const { equipment } = useEquipment();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [processingClient, setProcessingClient] = useState<string | null>(null);

  // Filter clients by workflow stages
  const pendingApplications = clients.filter(client => client.status === 'pending');
  const underReview = clients.filter(client => client.status === 'approved' && !client.service_activated_at);
  const activeClients = clients.filter(client => client.status === 'active' && client.service_activated_at);
  const rejectedApplications = clients.filter(client => client.status === 'rejected');

  const handleApproval = async () => {
    if (!selectedClient || !selectedEquipment) {
      toast({
        title: "Missing Information",
        description: "Please select equipment for the client",
        variant: "destructive",
      });
      return;
    }

    setProcessingClient(selectedClient.id);
    try {
      await updateClient({
        id: selectedClient.id,
        updates: {
          status: 'active',
          approved_at: new Date().toISOString(),
          notes: `Approved with equipment: ${selectedEquipment}`,
        }
      });

      toast({
        title: "Application Approved",
        description: "Client application has been approved and equipment assigned",
      });
      
      setApprovalDialog(false);
      setSelectedClient(null);
      setSelectedEquipment('');
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingClient(null);
    }
  };

  const handleRejection = async () => {
    if (!selectedClient || !rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setProcessingClient(selectedClient.id);
    try {
      await updateClient({
        id: selectedClient.id,
        updates: {
          status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
        }
      });

      toast({
        title: "Application Rejected",
        description: "Client application has been rejected",
      });
      
      setApprovalDialog(false);
      setSelectedClient(null);
      setRejectionReason('');
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingClient(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underReview.length}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients.length}</div>
            <p className="text-xs text-muted-foreground">Service active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedApplications.length}</div>
            <p className="text-xs text-muted-foreground">Need corrections</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Applications ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            Under Review ({underReview.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active Clients ({activeClients.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications Awaiting Network Admin Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApplications.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        Package: KES {client.monthly_rate}/month
                      </p>
                      <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                    </div>
                    <Button 
                      onClick={() => {
                        setSelectedClient(client);
                        setApprovalDialog(true);
                      }}
                      disabled={processingClient === client.id}
                      size="sm"
                    >
                      {processingClient === client.id ? 'Processing...' : 'Review'}
                    </Button>
                  </div>
                ))}
                {pendingApplications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No pending applications
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {underReview.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                      <Badge className={getStatusColor(client.status)}>Approved - Pending Installation</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Generate Invoice
                    </Button>
                  </div>
                ))}
                {underReview.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No applications under review
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        Wallet: KES {client.wallet_balance || 0}
                      </p>
                      <Badge className={getStatusColor(client.status)}>Active</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </div>
                ))}
                {activeClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No active clients
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedApplications.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                      <p className="text-sm text-red-600">
                        Reason: {client.rejection_reason}
                      </p>
                      <Badge className={getStatusColor(client.status)}>Rejected</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Reprocess
                    </Button>
                  </div>
                ))}
                {rejectedApplications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No rejected applications
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval/Rejection Dialog */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedClient.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                <p className="text-sm text-muted-foreground">
                  Package: KES {selectedClient.monthly_rate}/month
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment">Assign Equipment (for approval)</Label>
                <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment?.filter(eq => eq.status === 'available').map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.type} - {eq.model} ({eq.serial_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApproval}
                  disabled={!selectedEquipment || processingClient === selectedClient.id}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processingClient === selectedClient.id ? 'Processing...' : 'Approve'}
                </Button>
                
                <Button
                  onClick={handleRejection}
                  disabled={!rejectionReason.trim() || processingClient === selectedClient.id}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {processingClient === selectedClient.id ? 'Processing...' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientOnboardingWorkflow;
