
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Router, 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Network,
  Key,
  Wifi
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MikroTikSetupWizard = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  
  const [config, setConfig] = useState({
    // Basic Router Info
    routerName: '',
    ipAddress: '',
    adminUsername: 'admin',
    adminPassword: '',
    
    // SNMP Settings
    snmpCommunity: 'public',
    snmpVersion: '2c',
    
    // PPPoE Settings
    pppoeInterface: 'ether1',
    dnsServers: '8.8.8.8,8.8.4.4',
    
    // Network Settings
    clientNetwork: '10.10.0.0/16',
    gateway: '192.168.1.1',
    
    // Testing
    testResults: {} as any
  });

  const steps = [
    { id: 1, title: 'Router Connection', icon: Router },
    { id: 2, title: 'SNMP Setup', icon: Network },
    { id: 3, title: 'PPPoE Config', icon: Wifi },
    { id: 4, title: 'Test & Verify', icon: TestTube }
  ];

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');
    
    try {
      // Simulate testing the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test results
      const results = {
        ping: Math.random() > 0.2,
        ssh: Math.random() > 0.3,
        snmp: Math.random() > 0.2,
        api: Math.random() > 0.4
      };
      
      setConfig(prev => ({ ...prev, testResults: results }));
      
      const allPassed = Object.values(results).every(Boolean);
      setConnectionStatus(allPassed ? 'success' : 'failed');
      
      toast({
        title: allPassed ? "Connection Successful" : "Connection Issues Detected",
        description: allPassed 
          ? "All tests passed! Your MikroTik router is ready for integration." 
          : "Some tests failed. Please check your configuration.",
        variant: allPassed ? "default" : "destructive",
      });
      
    } catch (error) {
      setConnectionStatus('failed');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the router. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      // Here you would save to your database/backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: "MikroTik router has been successfully integrated with your ISP system.",
      });
      
      // Reset wizard or redirect
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return null;
    
    const Icon = step.icon;
    return <Icon className="h-5 w-5" />;
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-6 w-6" />
            MikroTik Router Setup Wizard
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`flex items-center gap-1 ${currentStep >= step.id ? 'text-primary' : ''}`}
                >
                  {getStepIcon(step.id)}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep.toString()} className="w-full">
            <TabsContent value="1" className="space-y-4">
              <h3 className="text-lg font-semibold">Step 1: Router Connection Details</h3>
              <p className="text-muted-foreground">
                Enter your MikroTik router's basic connection information.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routerName">Router Name</Label>
                  <Input
                    id="routerName"
                    placeholder="Main Router"
                    value={config.routerName}
                    onChange={(e) => handleInputChange('routerName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    placeholder="192.168.1.1"
                    value={config.ipAddress}
                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminUsername">Admin Username</Label>
                  <Input
                    id="adminUsername"
                    placeholder="admin"
                    value={config.adminUsername}
                    onChange={(e) => handleInputChange('adminUsername', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Enter router password"
                    value={config.adminPassword}
                    onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make sure your MikroTik router is accessible from this network and has API access enabled.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="2" className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: SNMP Configuration</h3>
              <p className="text-muted-foreground">
                Configure SNMP settings for network monitoring.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="snmpCommunity">SNMP Community String</Label>
                  <Input
                    id="snmpCommunity"
                    placeholder="public"
                    value={config.snmpCommunity}
                    onChange={(e) => handleInputChange('snmpCommunity', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="snmpVersion">SNMP Version</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={config.snmpVersion}
                    onChange={(e) => handleInputChange('snmpVersion', e.target.value)}
                  >
                    <option value="1">SNMP v1</option>
                    <option value="2c">SNMP v2c</option>
                    <option value="3">SNMP v3</option>
                  </select>
                </div>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  You need to enable SNMP on your MikroTik router: <br />
                  <code className="text-sm">/snmp set enabled=yes</code>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="3" className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: PPPoE Configuration</h3>
              <p className="text-muted-foreground">
                Configure PPPoE settings for client connections.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pppoeInterface">PPPoE Interface</Label>
                  <Input
                    id="pppoeInterface"
                    placeholder="ether1"
                    value={config.pppoeInterface}
                    onChange={(e) => handleInputChange('pppoeInterface', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientNetwork">Client Network Range</Label>
                  <Input
                    id="clientNetwork"
                    placeholder="10.10.0.0/16"
                    value={config.clientNetwork}
                    onChange={(e) => handleInputChange('clientNetwork', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dnsServers">DNS Servers</Label>
                  <Input
                    id="dnsServers"
                    placeholder="8.8.8.8,8.8.4.4"
                    value={config.dnsServers}
                    onChange={(e) => handleInputChange('dnsServers', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gateway">Gateway</Label>
                  <Input
                    id="gateway"
                    placeholder="192.168.1.1"
                    value={config.gateway}
                    onChange={(e) => handleInputChange('gateway', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>RouterOS Commands (Copy these to your router)</Label>
                <Textarea
                  readOnly
                  className="font-mono text-sm"
                  rows={6}
                  value={`# Enable PPPoE Server
/interface pppoe-server server
add service-name=isp-service interface=${config.pppoeInterface} disabled=no

# Create IP Pool for clients
/ip pool add name=client-pool ranges=${config.clientNetwork.split('/')[0]}-${config.clientNetwork.split('/')[0].replace(/\d+$/, '254')}

# Create PPP Profile  
/ppp profile add name=client-profile local-address=${config.gateway} remote-address=client-pool dns-server=${config.dnsServers}`}
                />
              </div>
            </TabsContent>

            <TabsContent value="4" className="space-y-4">
              <h3 className="text-lg font-semibold">Step 4: Test & Verify Connection</h3>
              <p className="text-muted-foreground">
                Test the connection to your MikroTik router and verify all services.
              </p>
              
              <div className="flex gap-4 mb-6">
                <Button 
                  onClick={testConnection} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {isLoading ? 'Testing...' : 'Run Connection Tests'}
                </Button>
              </div>

              {Object.keys(config.testResults).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(config.testResults).map(([test, passed]) => (
                    <Card key={test} className="p-4">
                      <div className="flex items-center gap-2">
                        {passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium capitalize">{test}</div>
                          <Badge variant={passed ? "default" : "destructive"}>
                            {passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {connectionStatus === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All connection tests passed! Your MikroTik router is ready for integration.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === 'failed' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Some tests failed. Please check your router configuration and network connectivity.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={currentStep === 1 && (!config.ipAddress || !config.adminUsername)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={saveConfiguration}
                disabled={isLoading || connectionStatus !== 'success'}
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MikroTikSetupWizard;
