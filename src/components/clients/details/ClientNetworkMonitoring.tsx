
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  XCircle 
} from 'lucide-react';
import { useInventoryItems } from '@/hooks/useInventory';

interface ClientNetworkMonitoringProps {
  clientId: string;
  clientName: string;
}

const ClientNetworkMonitoring: React.FC<ClientNetworkMonitoringProps> = ({ 
  clientId, 
  clientName 
}) => {
  // Get assigned equipment for this client
  const { data: assignedEquipment = [] } = useInventoryItems({});

  const clientEquipment = assignedEquipment.filter(item => 
    item.assigned_customer_id === clientId
  );

  const networkEquipment = clientEquipment.filter(item => 
    item.is_network_equipment || item.category === 'Network Hardware'
  );

  const cpeEquipment = clientEquipment.filter(item => 
    item.category === 'CPE'
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline': return <Badge variant="destructive">Offline</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Warning</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon('online')}
              <span className="text-2xl font-bold">Active</span>
            </div>
            <p className="text-xs text-muted-foreground">Last seen: 2 mins ago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signal Strength</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-65 dBm</div>
            <p className="text-xs text-muted-foreground">Excellent signal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Download Speed</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2 Mbps</div>
            <p className="text-xs text-muted-foreground">Current speed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Speed</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8 Mbps</div>
            <p className="text-xs text-muted-foreground">Current speed</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Assigned Equipment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientEquipment.length > 0 ? (
            <div className="space-y-4">
              {/* Network Equipment */}
              {networkEquipment.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Network Equipment</h4>
                  {networkEquipment.map((equipment) => (
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
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge('online')}
                        <Badge variant="outline" className="text-xs">
                          Network
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge('online')}
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
            RADIUS Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Authentication Status</span>
                {getStatusBadge('online')}
              </div>
              <div className="text-sm text-muted-foreground">
                Client successfully authenticated with RADIUS server
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Session Status</span>
                {getStatusBadge('online')}
              </div>
              <div className="text-sm text-muted-foreground">
                Active session: 2h 45m
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Data Usage (Current Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">125.8 GB</div>
              <div className="text-sm text-muted-foreground">Downloaded</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">32.4 GB</div>
              <div className="text-sm text-muted-foreground">Uploaded</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">158.2 GB</div>
              <div className="text-sm text-muted-foreground">Total Usage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNetworkMonitoring;
