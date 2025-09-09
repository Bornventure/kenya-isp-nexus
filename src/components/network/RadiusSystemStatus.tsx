import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRadiusAutomation } from '@/hooks/useRadiusAutomation';
import { 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Router,
  Database,
  RefreshCw,
  Eye
} from 'lucide-react';

interface RadiusSystemStatusProps {
  radiusData: any[];
  loading: boolean;
  routers: any[];
  detailed?: boolean;
}

export const RadiusSystemStatus: React.FC<RadiusSystemStatusProps> = ({ 
  radiusData, 
  loading, 
  routers,
  detailed = false 
}) => {
  const { generateCredentials, sendWebhook, refetchStatus, isGeneratingCredentials, isSendingWebhook } = useRadiusAutomation();

  const systemStats = {
    totalEntries: radiusData?.length || 0,
    connectedRouters: routers.filter(r => r.connection_status === 'connected').length,
    totalRouters: routers.length,
    syncedUsers: radiusData?.filter(entry => entry.sync_status === 'synced').length || 0,
    failedSyncs: radiusData?.filter(entry => entry.sync_status === 'failed').length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Synced
        </Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Failed
        </Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading RADIUS status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            RADIUS System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* System Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Stats
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Entries</span>
                  <Badge variant="outline">{systemStats.totalEntries}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Synced Users</span>
                  <Badge variant="default">{systemStats.syncedUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Failed Syncs</span>
                  <Badge variant="destructive">{systemStats.failedSyncs}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Router className="h-4 w-4" />
                Router Status
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Routers</span>
                  <Badge variant="outline">{systemStats.totalRouters}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Connected</span>
                  <Badge variant="default">{systemStats.connectedRouters}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Disconnected</span>
                  <Badge variant="secondary">{systemStats.totalRouters - systemStats.connectedRouters}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button 
                onClick={() => generateCredentials({ bulk_generate: true })}
                disabled={isGeneratingCredentials}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isGeneratingCredentials ? 'animate-spin' : ''}`} />
                Bulk Generate
              </Button>

              <Button 
                onClick={() => refetchStatus()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Refresh Status
              </Button>

              <Button 
                onClick={() => sendWebhook({ 
                  client_id: 'bulk', 
                  status: 'sync_request', 
                  action: 'sync_all' 
                })}
                disabled={isSendingWebhook}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Server className={`h-4 w-4 ${isSendingWebhook ? 'animate-spin' : ''}`} />
                Sync All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Status Table */}
      {detailed && radiusData && radiusData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>RADIUS User Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {radiusData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium text-sm">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Username: {entry.username} | Speed: {entry.download_speed_kbps}kbps/{entry.upload_speed_kbps}kbps
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(entry.sync_status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      Last sync: {entry.last_synced ? new Date(entry.last_synced).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};