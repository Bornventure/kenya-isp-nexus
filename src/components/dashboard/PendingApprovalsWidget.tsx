
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';

interface PendingApprovalsWidgetProps {
  onApprove: (clientId: string) => void;
  onReject: (clientId: string) => void;
}

const PendingApprovalsWidget: React.FC<PendingApprovalsWidgetProps> = ({ onApprove, onReject }) => {
  const { clients } = useClients();
  const { profile } = useAuth();

  // Filter pending clients for network admin
  const pendingClients = clients.filter(
    client => client.status === 'pending' && profile?.role === 'network_admin'
  );

  if (pendingClients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No pending approvals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Pending Approvals
          <Badge variant="secondary">{pendingClients.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {pendingClients.map((client) => (
            <div key={client.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{client.name}</h3>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {client.email} • {client.phone}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {client.address}, {client.county}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted {new Date(client.created_at || '').toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Package: KES {client.monthly_rate?.toLocaleString()}/month
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => onApprove(client.id)}
                    className="gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(client.id)}
                    className="gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsWidget;
