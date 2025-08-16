
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { DatabaseClient } from '@/types/database';

export interface NOCClientApprovalDialogProps {
  client: DatabaseClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject?: () => void;
}

const NOCClientApprovalDialog: React.FC<NOCClientApprovalDialogProps> = ({
  client,
  open,
  onOpenChange,
  onApprove,
  onReject,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Client Approval Required
            <Badge className={getStatusColor(client.status)}>
              {client.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm font-medium">{client.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{client.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm">{client.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Number</label>
                  <p className="text-sm">{client.id_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Connection Type</label>
                  <p className="text-sm capitalize">{client.connection_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Monthly Rate</label>
                  <p className="text-sm">KSh {client.monthly_rate.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm">{client.address}, {client.sub_county}, {client.county}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            {onReject && (
              <Button
                variant="outline"
                onClick={onReject}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            )}
            <Button
              onClick={onApprove}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NOCClientApprovalDialog;
