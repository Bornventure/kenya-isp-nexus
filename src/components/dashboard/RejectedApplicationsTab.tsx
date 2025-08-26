
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Calendar, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const RejectedApplicationsTab = () => {
  const { clients, isLoading } = useClients();
  const { profile } = useAuth();

  // Filter rejected clients submitted by current user
  const rejectedClients = clients.filter(
    client => client.status === 'rejected' && client.submitted_by === profile?.id
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Rejected Applications</h3>
            <p className="text-muted-foreground">
              You don't have any rejected client applications.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Rejected Applications ({rejectedClients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rejectedClients.map((client) => (
            <div key={client.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{client.name}</h3>
                    <Badge variant="destructive" className="text-xs">
                      Rejected
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {client.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Rejected: {client.rejected_at ? format(new Date(client.rejected_at), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {client.rejection_reason && (
                <div className="bg-white border border-red-300 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-red-800 mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-red-700">
                        {client.rejection_reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Service Package:</span>{' '}
                    {client.service_packages?.name || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Monthly Rate:</span>{' '}
                    KSh {client.monthly_rate?.toLocaleString() || '0'}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>{' '}
                    {client.county}, {client.sub_county}
                  </div>
                  <div>
                    <span className="font-medium">Client Type:</span>{' '}
                    {client.client_type}
                  </div>
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
