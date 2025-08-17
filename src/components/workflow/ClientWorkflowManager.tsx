
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Eye, MessageCircle } from 'lucide-react';
import { useClientWorkflow } from '@/hooks/useClientWorkflow';
import { useAuth } from '@/contexts/AuthContext';

interface ClientWorkflowManagerProps {
  clientId?: string;
}

const ClientWorkflowManager: React.FC<ClientWorkflowManagerProps> = ({ clientId }) => {
  const { profile } = useAuth();
  const { 
    workflowItems, 
    isLoading, 
    approveClient, 
    rejectClient, 
    assignEquipment,
    isProcessing 
  } = useClientWorkflow();
  
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [notes, setNotes] = useState('');

  // Filter based on user role
  const relevantItems = workflowItems.filter(item => {
    if (profile?.role === 'sales_account_manager') {
      return item.current_stage === 'rejected' || item.current_stage === 'pending';
    }
    if (profile?.role === 'network_admin') {
      return item.current_stage === 'pending_approval';
    }
    return true;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'pending_approval': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'service_active': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproval = async (clientId: string, equipmentId: string, approvalNotes: string) => {
    await approveClient(clientId, equipmentId, approvalNotes);
    setSelectedClient(null);
    setSelectedEquipment('');
    setNotes('');
  };

  const handleRejection = async (clientId: string, reason: string) => {
    await rejectClient(clientId, reason);
    setSelectedClient(null);
    setRejectionReason('');
  };

  if (isLoading) {
    return <div className="p-6">Loading workflow items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Workflow Management</h2>
        <Badge variant="outline">
          {relevantItems.length} pending items
        </Badge>
      </div>

      <div className="grid gap-4">
        {relevantItems.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.clients?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {item.clients?.email} • {item.clients?.phone}
                  </p>
                </div>
                <Badge className={getStageColor(item.current_stage)}>
                  {item.current_stage.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Package:</span> KES {item.clients?.monthly_rate?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Connection:</span> {item.clients?.connection_type}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {item.clients?.county}, {item.clients?.sub_county}
                </div>
                <div>
                  <span className="font-medium">Submitted:</span> {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>

              {item.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{item.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Client Details - {item.clients?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-medium">Email:</label>
                          <p>{item.clients?.email}</p>
                        </div>
                        <div>
                          <label className="font-medium">Phone:</label>
                          <p>{item.clients?.phone}</p>
                        </div>
                        <div>
                          <label className="font-medium">ID Number:</label>
                          <p>{item.clients?.id_number}</p>
                        </div>
                        <div>
                          <label className="font-medium">M-Pesa Number:</label>
                          <p>{item.clients?.mpesa_number}</p>
                        </div>
                      </div>
                      <div>
                        <label className="font-medium">Address:</label>
                        <p>{item.clients?.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-medium">County:</label>
                          <p>{item.clients?.county}</p>
                        </div>
                        <div>
                          <label className="font-medium">Sub County:</label>
                          <p>{item.clients?.sub_county}</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Network Admin Actions */}
                {profile?.role === 'network_admin' && item.current_stage === 'pending_approval' && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Client Application</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Assign Equipment</label>
                            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select equipment to assign" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equipment-1">Router - MikroTik RB4011</SelectItem>
                                <SelectItem value="equipment-2">ONT - Huawei HG8546M</SelectItem>
                                <SelectItem value="equipment-3">CPE - Ubiquiti NanoStation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Approval Notes</label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add any notes about the approval..."
                            />
                          </div>
                          <Button 
                            onClick={() => handleApproval(item.client_id, selectedEquipment, notes)}
                            disabled={!selectedEquipment || isProcessing}
                            className="w-full"
                          >
                            Approve Application
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Client Application</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Reason for Rejection</label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please provide a detailed reason for rejection..."
                              required
                            />
                          </div>
                          <Button 
                            variant="destructive"
                            onClick={() => handleRejection(item.client_id, rejectionReason)}
                            disabled={!rejectionReason.trim() || isProcessing}
                            className="w-full"
                          >
                            Reject Application
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}

                {/* Sales Actions for Rejected Items */}
                {profile?.role === 'sales_account_manager' && item.current_stage === 'rejected' && (
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Resubmit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {relevantItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Pending Items</h3>
            <p className="text-muted-foreground">
              All client applications are up to date.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientWorkflowManager;
