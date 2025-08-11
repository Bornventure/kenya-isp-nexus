
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Wifi, 
  Router, 
  Signal, 
  Download, 
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw 
} from 'lucide-react';
import { useInventoryItems } from '@/hooks/useInventory';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { liveNetworkMonitoringService } from '@/services/liveNetworkMonitoringService';
import { useToast } from '@/hooks/use-toast';

interface ClientNetworkMonitoringProps {
  clientId: string;
  clientName: string;
}

const ClientNetworkMonitoring: React.FC<ClientNetworkMonitoringProps> = ({ 
  clientId, 
  clientName 
}) => {
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();
  
  // Get assigned equipment for this client
  const { data: assignedEquipment = [] } = useInventoryItems({});
  const { devices, refreshDevices } = useRealSNMP();

  const clientEquipment = assignedEquipment.filter(item => 
    item.assigned_customer_id === clientId
  );

  const networkEquipment = clientEquipment.filter(item => 
    item.is_network_equipment || item.category === 'Network Hardware'
  );

  const cpeEquipment = clientEquipment.filter(item => 
    item.category === 'CPE'
  );

  // Load real network status
  useEffect(() => {
    const loadNetworkStatus = async () => {
      try {
        setIsLoading(true);
        const status = await liveNetworkMonitoringService.getClientNetworkStatus(clientId);
        setNetworkStatus(status);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Error loading network status:', error);
        toast({
          title: "Error",
          description: "Failed to load network status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNetworkStatus();

    // Set up real-time updates
    const unsubscribe = liveNetworkMonitoringService.subscribeToClientStatus(
      clientId,
      (status) => {
        setNetworkStatus(status);
        setLastRefresh(new Date());
      }
    );

    return unsubscribe;
  }, [clientId, toast]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshDevices();
      const status = await liveNetworkMonitoringService.getClientNetworkStatus(clientId);
      setNetworkStatus(status);
      setLastRefresh(new Date());
      toast({
        title: "Refreshed",
        description: "Network status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh network status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const success = await liveNetworkMonitoringService.disconnectClient(clientId);
      if (success) {
        toast({
          title: "Client Disconnected",
          description: `${clientName} has been disconnected from the network.`,
        });
        handleRefresh();
      } else {
        toast({
          title: "Disconnect Failed",
          description: "Failed to disconnect client. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred during disconnect.",
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

  const getStatusIcon = (isOnline: boolean) => {
    return isOnline ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (isOnline: boolean) => {
    return isOnline ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
    ) : (
      <Badge variant="destructive">Offline</Badge>
    );
  };

  const getEquipmentStatus = (equipmentId: string) => {
    const device = devices.find(d => d.id === equipmentId);
    return device?.status || 'unknown';
  };

  if (isLoading && !networkStatus) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Network Monitoring</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Network Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(networkStatus?.is_online || false)}
              <span className="text-2xl font-bold">
                {networkStatus?.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last seen: {networkStatus?.last_seen ? formatDuration(networkStatus.last_seen) + ' ago' : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speed Limits</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3 text-blue-500" />
                Down: {networkStatus?.speed_limit?.download || '10M'}
              </div>
              <div className="flex items-center gap-1">
                <Upload className="h-3 w-3 text-orange-500" />
                Up: {networkStatus?.speed_limit?.upload || '8M'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Usage Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes((networkStatus?.data_usage_today || 0) * 1024 * 1024)}
            </div>
            <Progress 
              value={Math.min((networkStatus?.data_usage_today || 0) / 1000 * 100, 100)} 
              className="w-full mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkStatus?.current_session ? 
                formatDuration(networkStatus.current_session.start_time) : 
                'No Session'
              }
            </div>
            <p className="text-xs text-muted-foreground">Current session</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Session Details */}
      {networkStatus?.is_online && networkStatus?.current_session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Session Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Session ID</div>
                <div className="font-mono text-sm">{networkStatus.current_session.session_id}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                <div className="font-mono text-sm">{networkStatus.current_session.ip_address || 'Dynamic'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">NAS IP</div>
                <div className="font-mono text-sm">{networkStatus.current_session.nas_ip_address || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Data In</div>
                <div>{formatBytes(networkStatus.current_session.bytes_in || 0)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Data Out</div>
                <div>{formatBytes(networkStatus.current_session.bytes_out || 0)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Started</div>
                <div>{new Date(networkStatus.current_session.start_time).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Assigned Equipment & Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientEquipment.length > 0 ? (
            <div className="space-y-4">
              {/* Network Equipment */}
              {networkEquipment.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Network Equipment (Mikrotik Devices)</h4>
                  {networkEquipment.map((equipment) => {
                    const deviceStatus = getEquipmentStatus(equipment.equipment_id || equipment.id);
                    const isOnline = deviceStatus === 'online';
                    
                    return (
                      <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Router className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{equipment.name || equipment.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {equipment.manufacturer} {equipment.model}
                            </div>
                            {equipment.ip_address && (
                              <div className="text-xs text-muted-foreground font-mono">
                                IP: {equipment.ip_address}
                              </div>
                            )}
                            {equipment.mac_address && (
                              <div className="text-xs text-muted-foreground font-mono">
                                MAC: {equipment.mac_address}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(isOnline)}
                          <Badge variant="outline" className="text-xs">
                            Mikrotik
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CPE Equipment */}
              {cpeEquipment.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer Equipment (CPE)</h4>
                  {cpeEquipment.map((equipment) => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wifi className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">{equipment.name || equipment.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {equipment.manufacturer} {equipment.model}
                          </div>
                          {equipment.serial_number && (
                            <div className="text-xs text-muted-foreground font-mono">
                              SN: {equipment.serial_number}
                            </div>
                          )}
                          {equipment.mac_address && (
                            <div className="text-xs text-muted-foreground font-mono">
                              MAC: {equipment.mac_address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          Assigned
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          CPE
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Router className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No equipment assigned</p>
              <p className="text-sm">Assign equipment to monitor network status</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RADIUS Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            RADIUS Authentication & Authorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Authentication Status</span>
                {getStatusBadge(networkStatus?.is_online || false)}
              </div>
              <div className="text-sm text-muted-foreground">
                {networkStatus?.is_online 
                  ? "Client successfully authenticated with RADIUS server"
                  : "Client not currently authenticated"
                }
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Session Status</span>
                {getStatusBadge(!!networkStatus?.current_session)}
              </div>
              <div className="text-sm text-muted-foreground">
                {networkStatus?.current_session 
                  ? `Active session: ${formatDuration(networkStatus.current_session.start_time)}`
                  : "No active session"
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Network Control Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {networkStatus?.is_online && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDisconnect}
              >
                Disconnect Client
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => liveNetworkMonitoringService.changeClientSpeedLimit(clientId, '20Mbps')}
            >
              Upgrade Speed
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNetworkMonitoring;
