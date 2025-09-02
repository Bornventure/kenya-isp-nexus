
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Router, 
  TestTube, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Settings,
  Wifi,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';

const MikrotikConfigurationPanel = () => {
  const { toast } = useToast();
  const { routers, createRouter, testConnection, isCreating, isTesting } = useMikrotikRouters();
  
  const [config, setConfig] = useState({
    host: '192.168.100.2',
    user: 'admin', 
    password: 'admin123',
    port: 8728
  });
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [lastTestTime, setLastTestTime] = useState<string | null>(null);
  const [routerName, setRouterName] = useState('');

  const handleConfigChange = (field: string, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: field === 'port' ? Number(value) : value
    }));
    setConnectionStatus('unknown');
  };

  const handleSave = async () => {
    if (!routerName.trim()) {
      toast({
        title: "Router Name Required",
        description: "Please enter a router name before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const routerData = {
        name: routerName,
        ip_address: config.host,
        admin_username: config.user,
        admin_password: config.password,
        snmp_community: 'public',
        snmp_version: 2,
        pppoe_interface: 'ether1',
        dns_servers: '8.8.8.8,8.8.4.4',
        client_network: '192.168.1.0/24',
        gateway: config.host,
        status: 'offline' as const,
        connection_status: 'disconnected' as const,
        last_test_results: '',
      };

      createRouter(routerData);
      
      setRouterName('');
      setConfig({
        host: '192.168.100.2',
        user: 'admin',
        password: 'admin123',
        port: 8728
      });
      
      toast({
        title: "Router Added",
        description: "MikroTik router has been added to the system and will be picked up by the EC2 server.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save router',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!routerName.trim()) {
      toast({
        title: "Router Name Required", 
        description: "Please enter a router name before testing.",
        variant: "destructive",
      });
      return;
    }

    // First save the router, then test it
    const routerData = {
      name: routerName,
      ip_address: config.host,
      admin_username: config.user,
      admin_password: config.password,
      snmp_community: 'public',
      snmp_version: 2,
      pppoe_interface: 'ether1', 
      dns_servers: '8.8.8.8,8.8.4.4',
      client_network: '192.168.1.0/24',
      gateway: config.host,
      status: 'offline' as const,
      connection_status: 'disconnected' as const,
      last_test_results: '',
    };

    createRouter(routerData);

    // Find the router we just created and test it
    setTimeout(() => {
      const newRouter = routers.find(r => r.name === routerName && r.ip_address === config.host);
      if (newRouter) {
        testConnection(newRouter.id);
        setLastTestTime(new Date().toLocaleString());
      }
    }, 1000);
  };

  const getStatusBadge = () => {
    const latestRouter = routers.find(r => r.name === routerName && r.ip_address === config.host);
    if (latestRouter) {
      switch (latestRouter.connection_status) {
        case 'online':
          return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
        case 'offline':
          return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
        case 'testing':
          return <Badge variant="outline">Testing...</Badge>;
        default:
          return <Badge variant="outline">Unknown</Badge>;
      }
    }
    
    switch (connectionStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            MikroTik Router Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Add MikroTik routers to the system. The EC2 server monitors the database every minute for new routers.
              Make sure the RouterOS API is enabled and accessible.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="routerName">Router Name</Label>
            <Input
              id="routerName"
              value={routerName}
              onChange={(e) => setRouterName(e.target.value)}
              placeholder="Main Office Router"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Router IP Address</Label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => handleConfigChange('host', e.target.value)}
                placeholder="192.168.100.2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">API Port</Label>
              <Input
                id="port"
                type="number"
                value={config.port}
                onChange={(e) => handleConfigChange('port', e.target.value)}
                placeholder="8728"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Username</Label>
              <Input
                id="user"
                value={config.user}
                onChange={(e) => handleConfigChange('user', e.target.value)}
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={config.password}
                onChange={(e) => handleConfigChange('password', e.target.value)}
                placeholder="Enter router password"
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleTestConnection} 
              disabled={isTesting || !routerName.trim()}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isTesting ? 'Testing...' : 'Add & Test Router'}
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={isLoading || isCreating || !routerName.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading || isCreating ? 'Adding...' : 'Add Router'}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Status:</span>
              {getStatusBadge()}
            </div>

            {lastTestTime && (
              <div className="text-xs text-muted-foreground">
                Last tested: {lastTestTime}
              </div>
            )}

            {routers.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Configured Routers ({routers.length})
                </h4>
                <div className="space-y-2">
                  {routers.slice(0, 3).map((router) => (
                    <div key={router.id} className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">{router.name} ({router.ip_address})</span>
                      <Badge 
                        variant={router.connection_status === 'online' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {router.connection_status}
                      </Badge>
                    </div>
                  ))}
                  {routers.length > 3 && (
                    <div className="text-xs text-blue-600">
                      ...and {routers.length - 3} more router(s)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">1. Enable RouterOS API</h4>
              <div className="text-blue-700 font-mono text-xs">
                /ip service enable api<br/>
                /ip service set api port=8728
              </div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">2. Create API User (Optional)</h4>
              <div className="text-orange-700 font-mono text-xs">
                /user add name=api-user password=strong-password group=full
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">3. EC2 Integration</h4>
              <div className="text-purple-700 text-xs">
                Your EC2 server checks the database every minute for new routers. Once added, the router will be automatically picked up and configured for RADIUS integration.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MikrotikConfigurationPanel;
