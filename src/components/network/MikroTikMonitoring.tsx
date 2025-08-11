
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Router, 
  Activity, 
  Wifi, 
  Users, 
  HardDrive,
  Thermometer,
  Zap,
  RefreshCw,
  Plus,
  AlertTriangle
} from 'lucide-react';

interface RouterStatus {
  id: string;
  name: string;
  ip_address: string;
  status: 'online' | 'offline' | 'warning';
  uptime: string;
  cpu_usage: number;
  memory_usage: number;
  temperature?: number;
  connected_clients: number;
  throughput_in: number;
  throughput_out: number;
  last_updated: string;
}

const MikroTikMonitoring = () => {
  const [routers, setRouters] = useState<RouterStatus[]>([
    {
      id: '1',
      name: 'Main Router',
      ip_address: '192.168.1.1',
      status: 'online',
      uptime: '15d 4h 23m',
      cpu_usage: 25,
      memory_usage: 45,
      temperature: 42,
      connected_clients: 12,
      throughput_in: 125.5,
      throughput_out: 89.2,
      last_updated: new Date().toISOString()
    },
    {
      id: '2', 
      name: 'Sector A Router',
      ip_address: '192.168.1.10',
      status: 'warning',
      uptime: '8d 12h 45m',
      cpu_usage: 78,
      memory_usage: 82,
      temperature: 58,
      connected_clients: 8,
      throughput_in: 95.3,
      throughput_out: 67.8,
      last_updated: new Date().toISOString()
    }
  ]);

  const [showAddRouter, setShowAddRouter] = useState(false);
  const [newRouter, setNewRouter] = useState({
    name: '',
    ip_address: '',
    snmp_community: 'public'
  });

  const handleAddRouter = () => {
    // In real implementation, this would connect to the router via SNMP
    const router: RouterStatus = {
      id: Date.now().toString(),
      name: newRouter.name,
      ip_address: newRouter.ip_address,
      status: 'offline',
      uptime: '0d 0h 0m',
      cpu_usage: 0,
      memory_usage: 0,
      connected_clients: 0,
      throughput_in: 0,
      throughput_out: 0,
      last_updated: new Date().toISOString()
    };

    setRouters([...routers, router]);
    setNewRouter({ name: '', ip_address: '', snmp_community: 'public' });
    setShowAddRouter(false);
  };

  const handleRefreshStatus = () => {
    // In real implementation, this would poll SNMP data
    console.log('Refreshing router status...');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'warning':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Warning</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage > 80) return 'text-red-600';
    if (usage > 60) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MikroTik Router Monitoring</h2>
          <p className="text-muted-foreground">Real-time monitoring of RouterOS devices via SNMP</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button onClick={() => setShowAddRouter(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Router
          </Button>
        </div>
      </div>

      {/* Add Router Form */}
      {showAddRouter && (
        <Card>
          <CardHeader>
            <CardTitle>Add MikroTik Router</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="router-name">Router Name</Label>
                <Input
                  id="router-name"
                  value={newRouter.name}
                  onChange={(e) => setNewRouter({...newRouter, name: e.target.value})}
                  placeholder="Main Router"
                />
              </div>
              <div>
                <Label htmlFor="router-ip">IP Address</Label>
                <Input
                  id="router-ip"
                  value={newRouter.ip_address}
                  onChange={(e) => setNewRouter({...newRouter, ip_address: e.target.value})}
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <Label htmlFor="snmp-community">SNMP Community</Label>
                <Input
                  id="snmp-community"
                  value={newRouter.snmp_community}
                  onChange={(e) => setNewRouter({...newRouter, snmp_community: e.target.value})}
                  placeholder="public"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddRouter}>Add Router</Button>
              <Button variant="outline" onClick={() => setShowAddRouter(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Router Status Grid */}
      <div className="grid gap-6">
        {routers.map((router) => (
          <Card key={router.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Router className="h-5 w-5" />
                  <div>
                    <CardTitle>{router.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{router.ip_address}</p>
                  </div>
                </div>
                {getStatusBadge(router.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* System Info */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    System
                  </h4>
                  <div className="text-sm space-y-1">
                    <div>Uptime: {router.uptime}</div>
                    <div className={`${getUsageColor(router.cpu_usage)}`}>
                      CPU: {router.cpu_usage}%
                    </div>
                    <div className={`${getUsageColor(router.memory_usage)}`}>
                      Memory: {router.memory_usage}%
                    </div>
                    {router.temperature && (
                      <div className={`${router.temperature > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        <Thermometer className="h-3 w-3 inline mr-1" />
                        {router.temperature}°C
                      </div>
                    )}
                  </div>
                </div>

                {/* Network */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    Network
                  </h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <Users className="h-3 w-3 inline mr-1" />
                      Clients: {router.connected_clients}
                    </div>
                    <div>In: {router.throughput_in.toFixed(1)} Mbps</div>
                    <div>Out: {router.throughput_out.toFixed(1)} Mbps</div>
                  </div>
                </div>

                {/* Interfaces */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Interfaces
                  </h4>
                  <div className="text-sm space-y-1">
                    <div className="text-green-600">ether1: Up</div>
                    <div className="text-green-600">wlan1: Up</div>
                    <div className="text-gray-400">ether5: Down</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="space-y-1">
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Manage Rules
                    </Button>
                    {router.status === 'warning' && (
                      <Button size="sm" variant="destructive" className="w-full">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Check Issues
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                Last updated: {new Date(router.last_updated).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {routers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Router className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Routers Configured</h3>
            <p className="text-muted-foreground mb-4">
              Add your first MikroTik router to start monitoring network performance
            </p>
            <Button onClick={() => setShowAddRouter(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Router
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle>About MikroTik Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              This monitoring system connects to your MikroTik RouterOS devices via SNMP to provide 
              real-time insights into network performance, system health, and client connectivity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Monitored Metrics:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• System uptime and resource usage</li>
                  <li>• Network throughput and client count</li>
                  <li>• Interface status and connectivity</li>
                  <li>• Temperature and hardware health</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Requirements:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• SNMP enabled on MikroTik device</li>
                  <li>• Network connectivity to router</li>
                  <li>• Proper SNMP community string</li>
                  <li>• RouterOS 6.x or 7.x</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MikroTikMonitoring;
