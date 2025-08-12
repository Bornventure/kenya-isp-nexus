
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
import { mikrotikService, type MikrotikConfig } from '@/services/mikrotikService';

const MikrotikConfigurationPanel = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<MikrotikConfig>({
    host: '192.168.100.2',
    user: 'admin',
    password: 'admin123',
    port: 8728
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [lastTestTime, setLastTestTime] = useState<string | null>(null);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const currentConfig = await mikrotikService.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load MikroTik configuration:', error);
    }
  };

  const handleConfigChange = (field: keyof MikrotikConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: field === 'port' ? Number(value) : value
    }));
    setConnectionStatus('unknown');
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await mikrotikService.updateConfig(config);
      toast({
        title: "Configuration Saved",
        description: "MikroTik configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('unknown');
    
    try {
      // First save the current config
      await mikrotikService.updateConfig(config);
      
      // Then test the connection
      const result = await mikrotikService.testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        setSystemInfo(result.systemInfo);
        setLastTestTime(new Date().toLocaleString());
        toast({
          title: "Connection Successful",
          description: "Successfully connected to MikroTik router.",
        });
      } else {
        setConnectionStatus('error');
        setSystemInfo(null);
        toast({
          title: "Connection Failed",
          description: result.error || 'Failed to connect to MikroTik router',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setConnectionStatus('error');
      setSystemInfo(null);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = () => {
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
              Configure the connection settings for your MikroTik RouterOS device. 
              Make sure the RouterOS API is enabled and accessible.
            </AlertDescription>
          </Alert>

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
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Configuration'}
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

            {systemInfo && connectionStatus === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  System Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-green-700">Router Identity:</span>
                    <div className="font-mono">{systemInfo.identity}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Interfaces:</span>
                    <div className="font-mono">{systemInfo.interfaceCount}</div>
                  </div>
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
              <h4 className="font-medium text-purple-800 mb-2">3. Firewall Configuration</h4>
              <div className="text-purple-700 text-xs">
                Ensure port 8728 is accessible from your application server. Add firewall rules if necessary.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MikrotikConfigurationPanel;
