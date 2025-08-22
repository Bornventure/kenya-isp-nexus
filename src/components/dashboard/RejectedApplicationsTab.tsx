
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Send } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';

const RejectedApplicationsTab = () => {
  const { clients } = useClients();
  const { profile } = useAuth();

  // Filter clients that have rejection data (pending status with rejection_reason)
  const rejectedClients = clients.filter(
    client => client.rejection_reason && client.submitted_by === profile?.id
  );

  const handleResubmit = (clientId: string) => {
    // Logic to reopen client for editing
    console.log('Resubmit client:', clientId);
  };

  const handleContactClient = (client: any) => {
    // Logic to send message to client
    console.log('Contact client:', client);
  };

  if (rejectedClients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Rejected Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No rejected applications</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Rejected Applications ({rejectedClients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rejectedClients.map((client) => (
            <div key={client.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{client.name}</h3>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {client.email} • {client.phone}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    {client.address}, {client.county}
                  </p>
                  
                  {client.rejection_reason && (
                    <div className="bg-white border border-red-300 rounded p-3 mb-3">
                      <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{client.rejection_reason}</p>
                      {client.rejected_at && (
                        <p className="text-xs text-red-600 mt-1">
                          Rejected on {new Date(client.rejected_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResubmit(client.id)}
                    className="gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Resubmit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContactClient(client)}
                    className="gap-1"
                  >
                    <Send className="h-3 w-3" />
                    Contact
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

export default RejectedApplicationsTab;
