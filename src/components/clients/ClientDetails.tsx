
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Phone, Mail, MapPin, Package, DollarSign, Calendar, Check, X } from 'lucide-react';
import { Client } from '@/types/client';

export interface ClientDetailsProps {
  client: Client;
  onClose?: () => void;
  onApprove?: (params: { id: string; notes?: string }) => void;
  onReject?: (params: { id: string; reason: string }) => void;
  onUpdate?: (id: string, updates: any) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ 
  client, 
  onClose,
  onApprove, 
  onReject, 
  onUpdate 
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      case 'disconnected':
        return 'outline';
      case 'approved':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove({ id: client.id, notes: approvalNotes });
    }
  };

  const handleReject = () => {
    if (onReject && rejectionReason) {
      onReject({ id: client.id, reason: rejectionReason });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <p className="text-muted-foreground">{client.phone}</p>
        </div>
        <Badge variant={getStatusColor(client.status)}>
          {client.status}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="font-medium">{client.name}</p>
                </div>
                <div>
                  <Label>ID Number</Label>
                  <p className="font-medium">{client.id_number}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{client.phone}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{client.email || 'N/A'}</p>
                </div>
                <div>
                  <Label>M-Pesa Number</Label>
                  <p className="font-medium">{client.mpesa_number || 'N/A'}</p>
                </div>
                <div>
                  <Label>Client Type</Label>
                  <p className="font-medium capitalize">{client.client_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Address</Label>
                <p className="font-medium">{client.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>County</Label>
                  <p className="font-medium">{client.county}</p>
                </div>
                <div>
                  <Label>Sub County</Label>
                  <p className="font-medium">{client.sub_county}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Service Package</Label>
                  <p className="font-medium">{client.service_packages?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Connection Type</Label>
                  <p className="font-medium capitalize">{client.connection_type}</p>
                </div>
                <div>
                  <Label>Monthly Rate</Label>
                  <p className="font-medium">KSh {client.monthly_rate.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Installation Date</Label>
                  <p className="font-medium">{client.installationDate || 'Not scheduled'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account Balance</Label>
                  <p className="font-medium">KSh {client.balance.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Wallet Balance</Label>
                  <p className="font-medium">KSh {client.wallet_balance.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Subscription Start</Label>
                  <p className="font-medium">{client.subscription_start_date || 'N/A'}</p>
                </div>
                <div>
                  <Label>Subscription End</Label>
                  <p className="font-medium">{client.subscription_end_date || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          {client.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Client Approval</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                  <Textarea
                    id="approval-notes"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Enter any notes for approval..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleApprove} className="gap-2">
                    <Check className="h-4 w-4" />
                    Approve Client
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={!rejectionReason}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reject Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {client.status !== 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {client.status}</p>
                  {client.approved_at && (
                    <p><strong>Approved At:</strong> {new Date(client.approved_at).toLocaleString()}</p>
                  )}
                  {client.approved_by && (
                    <p><strong>Approved By:</strong> {client.approved_by}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
