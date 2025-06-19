
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  BarChart3, 
  Settings, 
  Zap,
  Network,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface LoadBalancerProps {
  selectedHotspot: string | null;
}

const LoadBalancer: React.FC<LoadBalancerProps> = ({ selectedHotspot }) => {
  const [settings, setSettings] = useState({
    enabled: false,
    algorithm: 'round_robin',
    maxConnections: 50,
    healthCheckInterval: 30,
    failoverEnabled: true,
    autoScaling: false,
    bandwidthShaping: true,
    priorityQueuing: false
  });

  const handleSaveSettings = () => {
    // In a real implementation, this would save to the backend
    console.log('Saving load balancer settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Load Balancer Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Manage traffic distribution and performance optimization
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Settings className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      {!selectedHotspot && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-orange-800">
              Please select a hotspot from the Hotspots tab to configure load balancing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  {settings.enabled ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Disabled
                    </>
                  )}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Network className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Load Distribution</p>
                <p className="text-2xl font-bold">76%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">42ms</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Load Balancer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Load Balancing</Label>
                <p className="text-sm text-muted-foreground">
                  Distribute traffic across multiple connections
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
              />
            </div>

            <div className="space-y-2">
              <Label>Load Balancing Algorithm</Label>
              <Select 
                value={settings.algorithm} 
                onValueChange={(value) => setSettings({...settings, algorithm: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="least_connections">Least Connections</SelectItem>
                  <SelectItem value="weighted_round_robin">Weighted Round Robin</SelectItem>
                  <SelectItem value="ip_hash">IP Hash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Connections per Backend</Label>
              <Input
                type="number"
                value={settings.maxConnections}
                onChange={(e) => setSettings({...settings, maxConnections: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="space-y-2">
              <Label>Health Check Interval (seconds)</Label>
              <Input
                type="number"
                value={settings.healthCheckInterval}
                onChange={(e) => setSettings({...settings, healthCheckInterval: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          {/* Advanced Features */}
          <div className="space-y-4">
            <h4 className="font-medium">Advanced Features</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Failover</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically switch to backup connections
                  </p>
                </div>
                <Switch
                  checked={settings.failoverEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, failoverEnabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Scaling</Label>
                  <p className="text-sm text-muted-foreground">
                    Scale resources based on demand
                  </p>
                </div>
                <Switch
                  checked={settings.autoScaling}
                  onCheckedChange={(checked) => setSettings({...settings, autoScaling: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Bandwidth Shaping</Label>
                  <p className="text-sm text-muted-foreground">
                    Control bandwidth allocation per user
                  </p>
                </div>
                <Switch
                  checked={settings.bandwidthShaping}
                  onCheckedChange={(checked) => setSettings({...settings, bandwidthShaping: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Priority Queuing</Label>
                  <p className="text-sm text-muted-foreground">
                    Prioritize traffic by type or user
                  </p>
                </div>
                <Switch
                  checked={settings.priorityQueuing}
                  onCheckedChange={(checked) => setSettings({...settings, priorityQueuing: checked})}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Servers */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1, name: 'Primary Gateway', ip: '192.168.1.1', status: 'healthy', load: 65 },
              { id: 2, name: 'Secondary Gateway', ip: '192.168.1.2', status: 'healthy', load: 45 },
              { id: 3, name: 'Backup Gateway', ip: '192.168.1.3', status: 'standby', load: 0 }
            ].map((server) => (
              <div key={server.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{server.name}</p>
                    <p className="text-sm text-muted-foreground">{server.ip}</p>
                  </div>
                  <Badge variant={
                    server.status === 'healthy' ? 'default' : 
                    server.status === 'standby' ? 'secondary' : 'destructive'
                  }>
                    {server.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Load: {server.load}%</p>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${server.load}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadBalancer;
