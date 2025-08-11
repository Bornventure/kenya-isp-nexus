
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Download, 
  Upload, 
  Clock, 
  Zap,
  AlertTriangle
} from 'lucide-react';
import { liveNetworkMonitoringService, ClientNetworkStatus } from '@/services/liveNetworkMonitoringService';
import { useToast } from '@/hooks/use-toast';

interface LiveClientMonitorProps {
  clientId: string;
  clientName: string;
}

export const LiveClientMonitor: React.FC<LiveClientMonitorProps> = ({
  clientId,
  clientName
}) => {
  const [networkStatus, setNetworkStatus] = useState<ClientNetworkStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = liveNetworkMonitoringService.subscribeToClientStatus(
      clientId,
      (status) => {
        setNetworkStatus(status);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [clientId]);

  const handleDisconnect = async () => {
    const success = await liveNetworkMonitoringService.disconnectClient(clientId);
    if (success) {
      toast({
        title: "Client Disconnected",
        description: `${clientName} has been disconnected from the network.`,
      });
    } else {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSpeedChange = async (newSpeed: string) => {
    const success = await liveNetworkMonitoringService.changeClientSpeedLimit(clientId, newSpeed);
    if (success) {
      toast({
        title: "Speed Limit Updated",
        description: `Speed limit changed to ${newSpeed} for ${clientName}.`,
      });
    } else {
      toast({
        title: "Speed Change Failed",
        description: "Failed to update speed limit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Loading Network Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!networkStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Network Status Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to retrieve network status for this client.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {networkStatus.is_online ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Live Network Status
          </div>
          <Badge variant={networkStatus.is_online ? "default" : "destructive"}>
            {networkStatus.is_online ? "Online" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4" />
              Connection Status
            </div>
            {networkStatus.is_online && networkStatus.current_session ? (
              <div className="space-y-1 text-sm">
                <div>IP: {networkStatus.current_session.ip_address || 'Dynamic'}</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Online for: {formatDuration(networkStatus.current_session.start_time)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Last seen: {formatDuration(networkStatus.last_seen)} ago
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Speed Limits
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3 text-blue-500" />
                Down: {networkStatus.speed_limit.download}
              </div>
              <div className="flex items-center gap-1">
                <Upload className="h-3 w-3 text-orange-500" />
                Up: {networkStatus.speed_limit.upload}
              </div>
            </div>
          </div>
        </div>

        {/* Data Usage Today */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Data Usage Today</span>
            <span className="text-sm text-gray-600">
              {formatBytes(networkStatus.data_usage_today * 1024 * 1024)}
            </span>
          </div>
          <Progress 
            value={Math.min((networkStatus.data_usage_today / 1000) * 100, 100)} 
            className="w-full"
          />
          <div className="text-xs text-gray-500">
            Daily limit: 1 GB (if applicable)
          </div>
        </div>

        {/* Session Details */}
        {networkStatus.is_online && networkStatus.current_session && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Current Session</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Data In</div>
                <div>{formatBytes(networkStatus.current_session.bytes_in)}</div>
              </div>
              <div>
                <div className="text-gray-600">Data Out</div>
                <div>{formatBytes(networkStatus.current_session.bytes_out)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {networkStatus.is_online && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSpeedChange('20Mbps')}
          >
            Upgrade Speed
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Refresh status
              liveNetworkMonitoringService.getClientNetworkStatus(clientId)
                .then(setNetworkStatus);
            }}
          >
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
