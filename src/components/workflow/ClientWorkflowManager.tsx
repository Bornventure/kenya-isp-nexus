
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Package,
  AlertCircle
} from 'lucide-react';
import { useClientWorkflow } from '@/hooks/useClientWorkflow';

const ClientWorkflowManager: React.FC = () => {
  const { 
    pendingClients, 
    isLoading, 
    approveClient, 
    rejectClient, 
    assignEquipment,
    isApproving,
    isRejecting,
    isAssigningEquipment
  } = useClientWorkflow();

  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const getStatusBadge = (stage: string) => {
    switch (stage) {
      case 'pending_verification':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'equipment_assigned':
        return <Badge variant="secondary" className="gap-1"><Package className="h-3 w-3" />Equipment Assigned</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

  const handleApprove = (clientId: string) => {
    approveClient({ clientId, notes: 'Approved by network admin' });
  };

  const handleReject = () => {
    if (selectedClient && rejectionReason.trim()) {
      rejectClient({ clientId: selectedClient, reason: rejectionReason });
      setSelectedClient(null);
      setRejectionReason('');
    }
  };

  const handleAssignEquipment = () => {
    if (selectedClient && selectedEquipment.length > 0) {
      assignEquipment({ 
        clientId: selectedClient, 
        equipmentIds: selectedEquipment,
        notes: assignmentNotes 
      });
      setSelectedClient(null);
      setSelectedEquipment([]);
      setAssignmentNotes('');
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Client Workflow Management</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {pendingClients.filter(c => c.workflow_stage === 'pending_verification').length} Pending Review
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {pendingClients.filter(c => c.workflow_stage === 'approved').length} Approved
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {pendingClients.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-muted-foreground">No clients pending workflow actions.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          pendingClients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {client.name}
                  </CardTitle>
                  {getStatusBadge(client.workflow_stage)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{client.county}, {client.sub_county}</span>
                  </div>
                </div>

                {client.service_packages && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Package: {client.service_packages.name}</span>
                    <Badge variant="outline">KES {client.service_packages.monthly_rate}/month</Badge>
                  </div>
                )}

                {client.rejection_reason && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                      <p className="text-sm text-destructive/80">{client.rejection_reason}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  {client.workflow_stage === 'pending_verification' && (
                    <>
                      <Button 
                        onClick={() => handleApprove(client.id)}
                        disabled={isApproving}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            onClick={() => setSelectedClient(client.id)}
                            disabled={isRejecting}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Client Registration</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Please provide a reason for rejecting {client.name}'s registration:
                            </p>
                            <Textarea
                              placeholder="Enter rejection reason..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button 
                                variant="destructive" 
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || isRejecting}
                                className="flex-1"
                              >
                                Confirm Rejection
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedClient(null);
                                  setRejectionReason('');
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {client.workflow_stage === 'approved' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedClient(client.id)}
                          className="flex-1"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Assign Equipment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Equipment to {client.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Select equipment to assign to this client:
                          </p>
                          {/* Equipment selection would go here - simplified for now */}
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEquipment([...selectedEquipment, 'router-001']);
                                  } else {
                                    setSelectedEquipment(selectedEquipment.filter(id => id !== 'router-001'));
                                  }
                                }}
                              />
                              <span>MikroTik Router (MAC: 00:11:22:33:44:55)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEquipment([...selectedEquipment, 'antenna-001']);
                                  } else {
                                    setSelectedEquipment(selectedEquipment.filter(id => id !== 'antenna-001'));
                                  }
                                }}
                              />
                              <span>Wireless Antenna (Model: AC-5G-20)</span>
                            </label>
                          </div>
                          <Textarea
                            placeholder="Installation notes (optional)..."
                            value={assignmentNotes}
                            onChange={(e) => setAssignmentNotes(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleAssignEquipment}
                              disabled={selectedEquipment.length === 0 || isAssigningEquipment}
                              className="flex-1"
                            >
                              Assign Equipment
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setSelectedClient(null);
                                setSelectedEquipment([]);
                                setAssignmentNotes('');
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {client.workflow_stage === 'equipment_assigned' && (
                    <div className="flex-1 text-center py-2">
                      <Badge variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        Ready for Invoice Generation
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientWorkflowManager;
