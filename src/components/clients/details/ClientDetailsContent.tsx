
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatabaseClient } from '@/types/database';

interface ClientDetailsContentProps {
  client: DatabaseClient;
}

const ClientDetailsContent: React.FC<ClientDetailsContentProps> = ({ client }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
      case 'disconnected':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const clientData: DatabaseClient = {
    ...client,
    notes: client.notes || null,
    rejection_reason: client.rejection_reason || null,
    rejected_at: client.rejected_at || null,
    rejected_by: client.rejected_by || null,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{clientData.name}</h2>
        <Badge className={getStatusColor(clientData.status)}>
          {clientData.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm">{clientData.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-sm">{clientData.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">M-Pesa Number</label>
              <p className="text-sm">{clientData.mpesa_number}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Connection Type</label>
              <p className="text-sm capitalize">{clientData.connection_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Monthly Rate</label>
              <p className="text-sm">KSh {clientData.monthly_rate.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Installation Date</label>
              <p className="text-sm">{clientData.installation_date}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-sm">{clientData.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">County</label>
              <p className="text-sm">{clientData.county}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Sub County</label>
              <p className="text-sm">{clientData.sub_county}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Account Balance</label>
              <p className="text-sm">KSh {clientData.balance.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Wallet Balance</label>
              <p className="text-sm">KSh {clientData.wallet_balance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetailsContent;
