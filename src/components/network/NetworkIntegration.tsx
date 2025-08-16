
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Server, Wifi, Activity, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RadiusConfig {
  host: string;
  port: number;
  secret: string;
  isConnected: boolean;
  lastSync: string;
}

interface MikrotikConfig {
  host: string;
  username: string;
  password: string;
  isConnected: boolean;
  lastSync: string;
}

interface NetworkService {
  clientId: string;
  clientName: string;
  ipAddress: string;
  status: 'active' | 'suspended' | 'pending';
  packageSpeed: string;
  dataUsage: string;
  lastSeen: string;
}

const NetworkIntegration: React.FC = () => {
  const { toast } = useToast();
  
  const [radiusConfig, setRadiusConfig] = useState<RadiusConfig>({
    host: '192.168.1.10',
    port: 1812,
    secret: 'radius-secret',
    isConnected: false,
    lastSync: '2024-01-15 10:30:00'
  });

  const [mikrotikConfig, setMikrotikConfig] = useState<MikrotikConfig>({
    host: '192.168.1.1',
    username: 'admin',
    password: '',
    isConnected: false,
    lastSync: '2024-01-15 10:35:00'
  });

  const [services, setServices] = useState<NetworkService[]>([
    {
      clientId: '1',
      clientName: 'John Doe',
      ipAddress: '192.168.100.10',
      status: 'active',
      packageSpeed: '10 Mbps',
      dataUsage: '45.2 GB',
      lastSeen: '2024-01-15 14:30:00'
    },
    {
      clientId: '2',  
      clientName: 'Jane Smith',
      ipAddress: '192.168.100.11',
      status: 'suspended',
      packageSpeed: '15 Mbps', 
      dataUsage: '12.8 GB',
      lastSeen: '2024-01-10 08:15:00'
    }
  ]);

  const [autoSync, setAutoSync] = useState(true);

  const testRadiusConnection = async () => {
    console.log('Testing RADIUS connection to:', radiusConfig.host);
    
    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      setRadiusConfig(prev => ({
        ...prev,
        isConnected: success,
        lastSync: new Date().toISOString()
      }));

      toast({
        title: success ? "RADIUS Connected" : "Connection Failed",
        description: success 
          ? "Successfully connected to RADIUS server"
          : "Failed to connect to RADIUS server. Check configuration.",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const testMikrotikConnection = async () => {
    console.log('Testing Mikrotik connection to:', mikrotikConfig.host);
    
    setTimeout(() => {
      const success = Math.random() > 0.3;
      
      setMikrotikConfig(prev => ({
        ...prev,
        isConnected: success,
        lastSync: new Date().toISOString()
      }));

      toast({
        title: success ? "Mikrotik Connected" : "Connection Failed", 
        description: success
          ? "Successfully connected to Mikrotik router"
          : "Failed to connect to Mikrotik. Check credentials.",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const syncServices = async () => {
    console.log('Syncing services with network devices...');
    
    toast({
      title: "Syncing Services",
      description: "Synchronizing client services with RADIUS and Mikrotik...",
    });

    // Simulate sync process
    setTimeout(() => {
      // Update service statuses based on wallet balances
      setServices(prev => prev.map(service => {
        // Simulate status updates
        const rand = Math.random();
        if (rand > 0.8) {
          return { ...service, status: 'suspended' as const };
        } else if (rand > 0.6) {
          return { ...service, status: 'active' as const };
        }
        return service;
      }));

      toast({
        title: "Sync Complete",
        description: "Successfully synchronized all client services",
      });
    }, 3000);
  };

  const activateService = async (clientId: string) => {
    console.log('Activating service for client:', clientId);
    
    const service = services.find(s => s.clientId === clientId);
    if (!service) return;

    // Update service status
    setServices(prev => prev.map(s => 
      s.clientId === clientId 
        ? { ...s, status: 'active' as const, lastSeen: new Date().toISOString() }
        : s
    ));

    toast({
      title: "Service Activated",
      description: `Internet service activated for ${service.clientName}`,
    });
  };

  const suspendService = async (clientId: string) => {
    console.log('Suspending service for client:', clientId);
    
    const service = services.find(s => s.clientId === clientId);
    if (!service) return;

    setServices(prev => prev.map(s => 
      s.clientId === clientId 
        ? { ...s, status: 'suspended' as const }
        : s
    ));

    toast({
      title: "Service Suspended",
      description: `Internet service suspended for ${service.clientName}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'suspended': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';  
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Integration</h1>
          <p className="text-muted-foreground">
            Manage RADIUS and Mikrotik integration for automated service control
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="auto-sync">Auto Sync</Label>
          <Switch
            id="auto-sync"
            checked={autoSync}
            onCheckedChange={setAutoSync}
          />
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="services">Active Services</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5" />
                  RADIUS Configuration
                  {radiusConfig.isConnected ? (
                    <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Configure RADIUS server connection for authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="radius-host">Host</Label>
                  <Input
                    id="radius-host"
                    value={radiusConfig.host}
                    onChange={(e) => setRadiusConfig(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="192.168.1.10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="radius-port">Port</Label>
                  <Input
                    id="radius-port"
                    type="number"
                    value={radiusConfig.port}
                    onChange={(e) => setRadiusConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                    placeholder="1812"
                  />
                </div>

                <div>
                  <Label htmlFor="radius-secret">Shared Secret</Label>
                  <Input
                    id="radius-secret"
                    type="password"
                    value={radiusConfig.secret}
                    onChange={(e) => setRadiusConfig(prev => ({ ...prev, secret: e.target.value }))}
                    placeholder="Enter shared secret"
                  />
                </div>

                <Button onClick={testRadiusConnection} className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>

                {radiusConfig.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {radiusConfig.lastSync}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="mr-2 h-5 w-5" />
                  Mikrotik Configuration
                  {mikrotikConfig.isConnected ? (
                    <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Configure Mikrotik router connection for service control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mikrotik-host">Host</Label>
                  <Input
                    id="mikrotik-host"
                    value={mikrotikConfig.host}
                    onChange={(e) => setMikrotikConfig(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="192.168.1.1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mikrotik-username">Username</Label>
                  <Input
                    id="mikrotik-username"
                    value={mikrotikConfig.username}
                    onChange={(e) => setMikrotikConfig(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="admin"
                  />
                </div>

                <div>
                  <Label htmlFor="mikrotik-password">Password</Label>
                  <Input
                    id="mikrotik-password"
                    type="password"
                    value={mikrotikConfig.password}
                    onChange={(e) => setMikrotikConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>

                <Button onClick={testMikrotikConnection} className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>

                {mikrotikConfig.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {mikrotikConfig.lastSync}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button onClick={syncServices} className="w-full" size="lg">
                <Settings className="h-4 w-4 mr-2" />
                Synchronize All Services
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Network Services</CardTitle>
              <CardDescription>
                Monitor and control client network services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.clientId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <h4 className="font-medium">{service.clientName}</h4>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        {service.status !== 'active' && (
                          <Button 
                            size="sm" 
                            onClick={() => activateService(service.clientId)}
                          >
                            Activate
                          </Button>
                        )}
                        {service.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => suspendService(service.clientId)}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">IP Address:</span>
                        <p className="font-mono">{service.ipAddress}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Package:</span>
                        <p>{service.packageSpeed}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Usage:</span>
                        <p>{service.dataUsage}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Seen:</span>
                        <p>{new Date(service.lastSeen).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {services.filter(s => s.status === 'active').length}
                </div>
                <p className="text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suspended Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {services.filter(s => s.status === 'suspended').length}
                </div>
                <p className="text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">99.8%</div>
                <p className="text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkIntegration;
