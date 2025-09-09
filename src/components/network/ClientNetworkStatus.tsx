import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRadiusAutomation } from '@/hooks/useRadiusAutomation';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  UserCheck
} from 'lucide-react';

interface ClientNetworkStatusProps {
  clients: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    radius_status: string;
    last_activity?: string;
  }>;
}

export const ClientNetworkStatus: React.FC<ClientNetworkStatusProps> = ({ clients }) => {
  const { runBillingAutomation, isRunningBillingAutomation } = useRadiusAutomation();

  const statusCounts = {
    active: clients.filter(c => c.status === 'active').length,
    suspended: clients.filter(c => c.status === 'suspended').length,
    pending: clients.filter(c => c.status === 'pending').length,
    synced: clients.filter(c => c.radius_status === 'synced').length,
    failed: clients.filter(c => c.radius_status === 'failed').length,
    pendingSync: clients.filter(c => c.radius_status === 'pending').length,
  };

  const recentlyActive = clients
    .filter(c => c.last_activity)
    .sort((a, b) => new Date(b.last_activity!).getTime() - new Date(a.last_activity!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Client Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Service Status</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active</span>
                  <Badge variant="default">{statusCounts.active}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Suspended</span>
                  <Badge variant="destructive">{statusCounts.suspended}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending</span>
                  <Badge variant="secondary">{statusCounts.pending}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">RADIUS Sync</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    Synced
                  </span>
                  <Badge variant="default">{statusCounts.synced}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    Failed
                  </span>
                  <Badge variant="destructive">{statusCounts.failed}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    Pending
                  </span>
                  <Badge variant="secondary">{statusCounts.pendingSync}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button 
              onClick={() => runBillingAutomation()}
              disabled={isRunningBillingAutomation}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isRunningBillingAutomation ? 'animate-spin' : ''}`} />
              Run Billing Automation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent RADIUS Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentlyActive.length > 0 ? (
            <div className="space-y-3">
              {recentlyActive.map(client => (
                <div key={client.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={client.radius_status === 'synced' ? 'default' : 'secondary'}>
                      {client.radius_status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {client.last_activity ? new Date(client.last_activity).toLocaleString() : 'No activity'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent RADIUS activity
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};