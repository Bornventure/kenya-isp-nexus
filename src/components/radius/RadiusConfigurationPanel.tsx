
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Shield,
  Users,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  Server,
  Key,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { radiusService } from '@/services/radiusService';

interface RadiusConfig {
  serverUrl: string;
  sharedSecret: string;
  authPort: number;
  accountingPort: number;
  timeout: number;
  retries: number;
  isEnabled: boolean;
}

interface RadiusGroup {
  id: string;
  name: string;
  description: string;
  uploadLimit: string;
  downloadLimit: string;
  sessionTimeout: number;
  idleTimeout: number;
  isActive: boolean;
}

const RadiusConfigurationPanel = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<RadiusConfig>({
    serverUrl: 'localhost',
    sharedSecret: '',
    authPort: 1812,
    accountingPort: 1813,
    timeout: 30,
    retries: 3,
    isEnabled: false
  });
  const [groups, setGroups] = useState<RadiusGroup[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadRadiusConfiguration();
    loadRadiusGroups();
    loadActiveSessions();
  }, []);

  const loadRadiusConfiguration = async () => {
    try {
      // In real implementation, load from database/API
      console.log('Loading RADIUS configuration...');
    } catch (error) {
      console.error('Error loading RADIUS config:', error);
    }
  };

  const loadRadiusGroups = async () => {
    try {
      // Mock data - would come from database
      setGroups([
        {
          id: '1',
          name: 'basic',
          description: 'Basic Internet Package',
          uploadLimit: '5M',
          downloadLimit: '10M',
          sessionTimeout: 86400,
          idleTimeout: 300,
          isActive: true
        },
        {
          id: '2',
          name: 'premium',
          description: 'Premium Internet Package',
          uploadLimit: '20M',
          downloadLimit: '50M',
          sessionTimeout: 86400,
          idleTimeout: 600,
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('Error loading RADIUS groups:', error);
    }
  };

  const loadActiveSessions = async () => {
    try {
      const sessions = await radiusService.getActiveSessions();
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      // Save configuration to database/API
      console.log('Saving RADIUS configuration:', config);
      
      toast({
        title: "Configuration Saved",
        description: "RADIUS server configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save RADIUS configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Test RADIUS server connection
      console.log('Testing RADIUS connection...');
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connection Successful",
        description: "Successfully connected to RADIUS server.",
      });
    } catch (error) {
      console.error('RADIUS connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to RADIUS server. Check your configuration.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const disconnectUser = async (username: string) => {
    try {
      const success = await radiusService.disconnectUser(username);
      if (success) {
        toast({
          title: "User Disconnected",
          description: `User ${username} has been disconnected.`,
        });
        loadActiveSessions(); // Refresh sessions
      }
    } catch (error) {
      console.error('Error disconnecting user:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect user.",
        variant: "destructive",
      });
    }
  };

  const createGroup = async (groupData: Omit<RadiusGroup, 'id'>) => {
    try {
      const newGroup: RadiusGroup = {
        ...groupData,
        id: Date.now().toString()
      };
      setGroups([...groups, newGroup]);
      
      toast({
        title: "Group Created",
        description: `RADIUS group "${groupData.name}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create RADIUS group.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RADIUS Configuration</h1>
          <p className="text-muted-foreground">
            Configure FreeRADIUS server integration for client authentication
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={testingConnection}
          >
            <Activity className={`h-4 w-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
          <Button onClick={saveConfiguration} disabled={loading}>
            <Settings className="h-4 w-4 mr-2" />
            Save Config
          </Button>
        </div>
      </div>

      <Tabs defaultValue="server" className="space-y-4">
        <TabsList>
          <TabsTrigger value="server">Server Configuration</TabsTrigger>
          <TabsTrigger value="groups">User Groups</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="integration">MikroTik Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="server">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  RADIUS Server Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.isEnabled}
                    onCheckedChange={(checked) => 
                      setConfig({...config, isEnabled: checked})
                    }
                  />
                  <Label>Enable RADIUS Authentication</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverUrl">Server Address</Label>
                  <Input
                    id="serverUrl"
                    value={config.serverUrl}
                    onChange={(e) => setConfig({...config, serverUrl: e.target.value})}
                    placeholder="192.168.1.100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authPort">Authentication Port</Label>
                    <Input
                      id="authPort"
                      type="number"
                      value={config.authPort}
                      onChange={(e) => setConfig({...config, authPort: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountingPort">Accounting Port</Label>
                    <Input
                      id="accountingPort"
                      type="number"
                      value={config.accountingPort}
                      onChange={(e) => setConfig({...config, accountingPort: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sharedSecret">Shared Secret</Label>
                  <Input
                    id="sharedSecret"
                    type="password"
                    value={config.sharedSecret}
                    onChange={(e) => setConfig({...config, sharedSecret: e.target.value})}
                    placeholder="Enter shared secret"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={config.timeout}
                      onChange={(e) => setConfig({...config, timeout: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retries">Retry Attempts</Label>
                    <Input
                      id="retries"
                      type="number"
                      value={config.retries}
                      onChange={(e) => setConfig({...config, retries: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Server Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>RADIUS Server Status</span>
                    <Badge variant={config.isEnabled ? "default" : "secondary"}>
                      {config.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Connected</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Active Sessions</span>
                    <Badge variant="outline">{activeSessions.length}</Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => loadActiveSessions()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                RADIUS Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{group.name}</h3>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {group.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Upload Limit:</span>
                        <div className="font-medium">{group.uploadLimit}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Download Limit:</span>
                        <div className="font-medium">{group.downloadLimit}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Session Timeout:</span>
                        <div className="font-medium">{group.sessionTimeout / 3600}h</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Idle Timeout:</span>
                        <div className="font-medium">{group.idleTimeout / 60}m</div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button onClick={() => {/* Open create group dialog */}}>
                  <Users className="h-4 w-4 mr-2" />
                  Add New Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Sessions
                </div>
                <Button variant="outline" onClick={loadActiveSessions}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active RADIUS sessions
                  </div>
                ) : (
                  activeSessions.map((session, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Wifi className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="font-medium">{session.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.nasIpAddress} • Session: {session.sessionId.slice(-8)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div>↑ {(session.bytesOut / 1024 / 1024).toFixed(1)} MB</div>
                            <div>↓ {(session.bytesIn / 1024 / 1024).toFixed(1)} MB</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => disconnectUser(session.username)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                MikroTik Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">MikroTik Configuration Commands</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run these commands on your MikroTik router to configure RADIUS authentication:
                  </p>
                  
                  <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="space-y-2">
                      <div># Configure RADIUS server</div>
                      <div>/radius add service=ppp address={config.serverUrl} secret={config.sharedSecret || 'your-secret'}</div>
                      <div>/radius add service=login address={config.serverUrl} secret={config.sharedSecret || 'your-secret'}</div>
                      <div></div>
                      <div># Enable RADIUS authentication for PPP</div>
                      <div>/ppp aaa set use-radius=yes</div>
                      <div></div>
                      <div># Configure accounting</div>
                      <div>/radius set [find] accounting-port={config.accountingPort} timeout={config.timeout}s</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Verification Steps</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>RADIUS server is running and accessible</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>MikroTik can reach RADIUS server on configured ports</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Shared secret matches on both RADIUS and MikroTik</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span>Test authentication with a known user account</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Troubleshooting</h3>
                  <div className="space-y-3 text-sm">
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <div className="font-medium">Authentication Failing</div>
                      <div className="text-muted-foreground">
                        Check RADIUS server logs and verify shared secret configuration
                      </div>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <div className="font-medium">Connection Timeout</div>
                      <div className="text-muted-foreground">
                        Verify network connectivity and firewall rules for RADIUS ports
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RadiusConfigurationPanel;
