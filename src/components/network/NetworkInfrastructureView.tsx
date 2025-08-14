
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Router, 
  Wifi, 
  Signal, 
  AlertTriangle,
  CheckCircle,
  Settings,
  MapPin,
  Activity
} from 'lucide-react';
import { useNetworkEquipment } from '@/hooks/useNetworkEquipment';
import { useRealNetworkTesting } from '@/hooks/useRealNetworkTesting';

const NetworkInfrastructureView = () => {
  const { equipment, isLoading, error } = useNetworkEquipment();
  const { testConnection, isLoading: isTesting, getDemoStatus } = useRealNetworkTesting();
  const isDemoMode = getDemoStatus();

  const handleTestDevice = async (device: any) => {
    if (!device.ip_address) {
      return;
    }

    const testType = device.snmp_community ? 'snmp' : 'ping';
    await testConnection(device.ip_address, testType);
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'router':
      case 'mikrotik':
        return Router;
      case 'access_point':
      case 'wireless':
        return Wifi;
      case 'switch':
        return Signal;
      default:
        return Router;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'deployed':
        return 'default';
      case 'assigned':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Activity className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Equipment</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Failed to load network equipment'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (equipment.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <Router className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Network Equipment</h3>
          <p className="text-muted-foreground mb-4">
            No approved network equipment found. Add equipment to your inventory and approve it to see it here.
          </p>
          {isDemoMode && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
              <AlertTriangle className="h-5 w-5 text-orange-600 inline mr-2" />
              <span className="text-orange-900 text-sm">
                Demo Mode: Real network equipment will appear here when added and approved
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isDemoMode && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-900">Demo Mode Active</h4>
                <p className="text-sm text-orange-700">
                  Network tests are simulated. Configure network agents for real device testing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network Infrastructure</h2>
          <p className="text-muted-foreground">
            Approved network equipment from your inventory
          </p>
        </div>
        <Badge variant="secondary">
          {equipment.length} {equipment.length === 1 ? 'Device' : 'Devices'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipment.map((device) => {
          const DeviceIcon = getDeviceIcon(device.type);
          
          return (
            <Card key={device.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DeviceIcon className="h-5 w-5" />
                    {device.brand} {device.model}
                  </div>
                  <Badge variant={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {device.type}
                  </div>
                  {device.serial_number && (
                    <div>
                      <span className="font-medium">Serial:</span> {device.serial_number}
                    </div>
                  )}
                  {device.ip_address && (
                    <div>
                      <span className="font-medium">IP:</span> {device.ip_address}
                    </div>
                  )}
                  {device.mac_address && (
                    <div>
                      <span className="font-medium">MAC:</span> {device.mac_address}
                    </div>
                  )}
                  {device.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs">{device.location}</span>
                    </div>
                  )}
                  {device.snmp_community && (
                    <div>
                      <span className="font-medium">SNMP:</span> v{device.snmp_version} ({device.snmp_community})
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {device.ip_address && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestDevice(device)}
                      disabled={isTesting}
                      className="flex-1"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Config
                  </Button>
                </div>

                {device.notes && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {device.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkInfrastructureView;
