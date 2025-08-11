
import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Router,
  Network
} from 'lucide-react';
import { clientDeploymentService } from '@/services/clientDeploymentService';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientNetworkMonitoringProps {
  clientId: string;
  clientName: string;
}

export const ClientNetworkMonitoring: React.FC<ClientNetworkMonitoringProps> = ({
  clientId,
  clientName
}) => {
  const { toast } = useToast();

  // Get client's assigned equipment
  const { data: assignedEquipment = [] } = useQuery({
    queryKey: ['client-assigned-equipment', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('client_id', clientId);

      if (error) throw error;
      return data || [];
    },
  });

  // Get client's network status
  const { data: networkStatus, isLoading } = useQuery({
    queryKey: ['client-network-status', clientId],
    queryFn: () => clientDeploymentService.getClientNetworkStatus(clientId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get RADIUS user info
  const { data: radiusUser } = useQuery({
    queryKey: ['client-radius-user', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('radius_users')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching RADIUS user:', error);
      }
      return data;
    },
  });

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

  return (
    <div className="space-y-6">
      {/* Network Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {networkStatus?.isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              Network Status
            </div>
            <Badge variant={networkStatus?.isOnline ? "default" : "destructive"}>
              {networkStatus?.isOnline ? "Online" : "Offline"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {networkStatus?.isOnline && networkStatus.currentSession ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Session Duration
                </div>
                <div className="text-lg font-semibold">
                  {formatDuration(networkStatus.currentSession.start_time)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Download className="h-4 w-4 text-blue-500" />
                  Data Downloaded
                </div>
                <div className="text-lg font-semibold">
                  {formatBytes(networkStatus.currentSession.bytes_in || 0)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Upload className="h-4 w-4 text-orange-500" />
                  Data Uploaded
                </div>
                <div className="text-lg font-semibold">
                  {formatBytes(networkStatus.currentSession.bytes_out || 0)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <WifiOff className="h-8 w-8 mx-auto mb-2" />
              <p>Client is currently offline</p>
              <p className="text-sm">Last seen: {formatDuration(networkStatus?.lastSeen || new Date().toISOString())} ago</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Assigned Equipment ({assignedEquipment.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedEquipment.length > 0 ? (
            <div className="space-y-3">
              {assignedEquipment.map((equipment) => (
                <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Network className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{equipment.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {equipment.brand} {equipment.model}
                      </div>
                      <div className="text-sm font-mono">{equipment.ip_address}</div>
                    </div>
                  </div>
                  <Badge variant={equipment.status === 'active' ? 'default' : 'secondary'}>
                    {equipment.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Router className="h-8 w-8 mx-auto mb-2" />
              <p>No equipment assigned to this client</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RADIUS Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            RADIUS Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {radiusUser ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Username:</span>
                <span className="font-mono text-sm">{radiusUser.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Group:</span>
                <span className="text-sm">{radiusUser.group_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Download Limit:</span>
                <span className="text-sm">{radiusUser.max_download}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upload Limit:</span>
                <span className="text-sm">{radiusUser.max_upload}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={radiusUser.is_active ? 'default' : 'destructive'}>
                  {radiusUser.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No RADIUS user configured</p>
              <p className="text-sm">Client cannot authenticate to the network</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Usage Today */}
      {networkStatus?.dataUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Today's Data Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Downloaded</div>
                <div className="text-lg font-semibold">
                  {formatBytes(networkStatus.dataUsage.in)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Uploaded</div>
                <div className="text-lg font-semibold">
                  {formatBytes(networkStatus.dataUsage.out)}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Total Usage</span>
                <span>{formatBytes(networkStatus.dataUsage.total)}</span>
              </div>
              <Progress 
                value={Math.min((networkStatus.dataUsage.total / (1024 * 1024 * 1024)) * 100, 100)} 
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Daily limit: 1 GB (if applicable)
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientNetworkMonitoring;
