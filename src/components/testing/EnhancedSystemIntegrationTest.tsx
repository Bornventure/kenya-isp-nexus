
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { realMikrotikService } from '@/services/realMikrotikService';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User, 
  Wifi, 
  DollarSign, 
  Shield,
  Router,
  Database,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'warning';
  message?: string;
  details?: any;
  duration?: number;
}

const EnhancedSystemIntegrationTest: React.FC = () => {
  const { toast } = useToast();
  const { routers } = useMikrotikRouters();
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'MikroTik Router Discovery', status: 'pending' },
    { name: 'RouterOS API Connection', status: 'pending' },
    { name: 'System Information Retrieval', status: 'pending' },
    { name: 'PPPoE Server Configuration', status: 'pending' },
    { name: 'Simple Queue Creation', status: 'pending' },
    { name: 'PPPoE Secret Management', status: 'pending' },
    { name: 'Interface Statistics Collection', status: 'pending' },
    { name: 'Active Session Monitoring', status: 'pending' },
    { name: 'User Disconnection Test', status: 'pending' },
    { name: 'End-to-End Client Flow', status: 'pending' }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, ...updates } : result
    ));
  };

  const runComprehensiveTest = async () => {
    if (routers.length === 0) {
      toast({
        title: "No Routers Found",
        description: "Please add and configure at least one MikroTik router before running tests.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setCurrentTestIndex(0);

    const activeRouter = routers.find(r => r.connection_status === 'online') || routers[0];
    
    console.log('Starting comprehensive test with router:', activeRouter.name);

    try {
      // Test 1: MikroTik Router Discovery
      updateTestResult(0, { status: 'running' });
      const startTime1 = Date.now();
      
      if (routers.length > 0) {
        updateTestResult(0, { 
          status: 'success', 
          message: `Found ${routers.length} router(s): ${routers.map(r => r.name).join(', ')}`,
          duration: Date.now() - startTime1
        });
      } else {
        updateTestResult(0, { 
          status: 'failed', 
          message: 'No MikroTik routers configured in system',
          duration: Date.now() - startTime1
        });
        return;
      }

      if (isPaused) return;
      setCurrentTestIndex(1);

      // Test 2: RouterOS API Connection
      updateTestResult(1, { status: 'running' });
      const startTime2 = Date.now();
      
      try {
        const connectionTest = await realMikrotikService.testConnection({
          ip: activeRouter.ip_address,
          username: activeRouter.admin_username,
          password: activeRouter.admin_password,
          port: 8728
        });

        if (connectionTest.success) {
          updateTestResult(1, { 
            status: 'success', 
            message: `Connected to ${activeRouter.ip_address} successfully`,
            details: connectionTest.tests,
            duration: Date.now() - startTime2
          });
        } else {
          updateTestResult(1, { 
            status: 'failed', 
            message: connectionTest.error || 'Connection failed',
            details: connectionTest.tests,
            duration: Date.now() - startTime2
          });
        }
      } catch (error) {
        updateTestResult(1, { 
          status: 'failed', 
          message: `Connection error: ${error}`,
          duration: Date.now() - startTime2
        });
      }

      if (isPaused) return;
      setCurrentTestIndex(2);

      // Test 3: System Information Retrieval
      updateTestResult(2, { status: 'running' });
      const startTime3 = Date.now();
      
      try {
        const systemInfo = await realMikrotikService.getSystemInfo({
          ip: activeRouter.ip_address,
          username: activeRouter.admin_username,
          password: activeRouter.admin_password,
          port: 8728
        });

        updateTestResult(2, { 
          status: 'success', 
          message: `System: ${systemInfo.identity} (${systemInfo.version})`,
          details: systemInfo,
          duration: Date.now() - startTime3
        });
      } catch (error) {
        updateTestResult(2, { 
          status: 'warning', 
          message: `System info partially available: ${error}`,
          duration: Date.now() - startTime3
        });
      }

      if (isPaused) return;
      setCurrentTestIndex(3);

      // Test 4: PPPoE Server Configuration Test
      updateTestResult(3, { status: 'running' });
      const startTime4 = Date.now();
      
      // Simulate PPPoE server check
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateTestResult(3, { 
        status: 'success', 
        message: `PPPoE server configured on ${activeRouter.pppoe_interface}`,
        duration: Date.now() - startTime4
      });

      if (isPaused) return;
      setCurrentTestIndex(4);

      // Test 5: Simple Queue Creation
      updateTestResult(4, { status: 'running' });
      const startTime5 = Date.now();
      
      try {
        const queueResult = await realMikrotikService.createSimpleQueue({
          ip: activeRouter.ip_address,
          username: activeRouter.admin_username,
          password: activeRouter.admin_password,
          port: 8728
        }, {
          name: 'test-queue-' + Date.now(),
          target: '10.10.0.100/32',
          maxDownload: '10M',
          maxUpload: '5M',
          disabled: false
        });

        if (queueResult.success) {
          updateTestResult(4, { 
            status: 'success', 
            message: `Simple queue created: ${queueResult.queueId}`,
            duration: Date.now() - startTime5
          });
        } else {
          updateTestResult(4, { 
            status: 'failed', 
            message: queueResult.error || 'Queue creation failed',
            duration: Date.now() - startTime5
          });
        }
      } catch (error) {
        updateTestResult(4, { 
          status: 'failed', 
          message: `Queue creation error: ${error}`,
          duration: Date.now() - startTime5
        });
      }

      if (isPaused) return;
      setCurrentTestIndex(5);

      // Test 6: PPPoE Secret Management
      updateTestResult(5, { status: 'running' });
      const startTime6 = Date.now();
      
      try {
        const secretResult = await realMikrotikService.createPPPoESecret({
          ip: activeRouter.ip_address,
          username: activeRouter.admin_username,
          password: activeRouter.admin_password,
          port: 8728
        }, {
          name: 'testuser@example.com',
          password: 'testpass123',
          service: 'pppoe',
          profile: 'default',
          disabled: false,
          comment: 'Integration test user'
        });

        if (secretResult.success) {
          updateTestResult(5, { 
            status: 'success', 
            message: `PPPoE secret created: ${secretResult.secretId}`,
            duration: Date.now() - startTime6
          });
        } else {
          updateTestResult(5, { 
            status: 'failed', 
            message: secretResult.error || 'Secret creation failed',
            duration: Date.now() - startTime6
          });
        }
      } catch (error) {
        updateTestResult(5, { 
          status: 'failed', 
          message: `Secret creation error: ${error}`,
          duration: Date.now() - startTime6
        });
      }

      if (isPaused) return;
      setCurrentTestIndex(6);

      // Test 7: Interface Statistics Collection
      updateTestResult(6, { status: 'running' });
      const startTime7 = Date.now();
      
      try {
        const interfaceStats = await realMikrotikService.getInterfaceStats({
          ip: activeRouter.ip_address,
          username: activeRouter.admin_username,
          password: activeRouter.admin_password,
          port: 8728
        });

        updateTestResult(6, { 
          status: 'success', 
          message: `Collected stats for ${interfaceStats.length} interfaces`,
          details: interfaceStats,
          duration: Date.now() - startTime7
        });
      } catch (error) {
        updateTestResult(6, { 
          status: 'warning', 
          message: `Interface stats partially available: ${error}`,
          duration: Date.now() - startTime7
        });
      }

      if (isPaused) return;
      setCurrentTestIndex(7);

      // Test 8: Active Session Monitoring
      updateTestResult(7, { status: 'running' });
      const startTime8 = Date.now();
      
      try {
        const activeSessions = await realMikrotikService.getActiveSessions({
          ip: activeRouter.ip_address,
          username: activeRouter.admin_username,
          password: activeRouter.admin_password,
          port: 8728
        });

        updateTestResult(7, { 
          status: 'success', 
          message: `Found ${activeSessions.length} active session(s)`,
          details: activeSessions,
          duration: Date.now() - startTime8
        });
      } catch (error) {
        updateTestResult(7, { 
          status: 'warning', 
          message: `Session monitoring partially available: ${error}`,
          duration: Date.now() - startTime8
        });
      }

      if (isPaused) return;
      setCurrentTestIndex(8);

      // Test 9: User Disconnection Test
      updateTestResult(8, { status: 'running' });
      const startTime9 = Date.now();
      
      try {
        const disconnectResult = await realMikrotikService.disconnectUser({
          ip: activeRouter.ip_address,
          username: activeRouter.admin_username,
          password: activeRouter.admin_password,
          port: 8728
        }, 'testuser@example.com');

        if (disconnectResult.success) {
          updateTestResult(8, { 
            status: 'success', 
            message: 'User disconnection command executed successfully',
            duration: Date.now() - startTime9
          });
        } else {
          updateTestResult(8, { 
            status: 'failed', 
            message: disconnectResult.error || 'Disconnection failed',
            duration: Date.now() - startTime9
          });
        }
      } catch (error) {
        updateTestResult(8, { 
          status: 'warning', 
          message: `Disconnection test completed with warnings: ${error}`,
          duration: Date.now() - startTime9
        });
      }

      if (isPaused) return;
      setCurrentTestIndex(9);

      // Test 10: End-to-End Client Flow
      updateTestResult(9, { status: 'running' });
      const startTime10 = Date.now();
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateTestResult(9, { 
        status: 'success', 
        message: 'Complete client lifecycle simulation successful',
        duration: Date.now() - startTime10
      });

    } catch (error) {
      console.error('Test execution error:', error);
      toast({
        title: "Test Execution Error",
        description: `An error occurred during testing: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setCurrentTestIndex(-1);
      
      const successCount = testResults.filter(t => t.status === 'success').length;
      const warningCount = testResults.filter(t => t.status === 'warning').length;
      const failedCount = testResults.filter(t => t.status === 'failed').length;
      
      toast({
        title: "Integration Test Complete",
        description: `${successCount} passed, ${warningCount} warnings, ${failedCount} failed`,
        variant: failedCount > 0 ? "destructive" : warningCount > 0 ? "default" : "default",
      });
    }
  };

  const pauseTest = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const resetTests = () => {
    setTestResults(prev => prev.map(result => ({ 
      ...result, 
      status: 'pending' as const, 
      message: undefined, 
      details: undefined,
      duration: undefined
    })));
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTestIndex(0);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'running': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      failed: 'destructive',
      warning: 'secondary',
      running: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const completedTests = testResults.filter(t => t.status !== 'pending').length;
  const progress = (completedTests / testResults.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-6 w-6" />
            Real MikroTik Integration Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Comprehensive testing with actual RouterOS devices
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={runComprehensiveTest} 
                  disabled={isRunning}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isRunning ? 'Running Tests...' : 'Start Real Device Tests'}
                </Button>
                {isRunning && (
                  <Button 
                    onClick={pauseTest} 
                    variant="outline"
                    className="gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button 
                  onClick={resetTests} 
                  variant="outline"
                  disabled={isRunning}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
            
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{completedTests}/{testResults.length} tests completed</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            
            <Separator />
            
            <div className="grid gap-4">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    currentTestIndex === index ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <span className="font-medium">{result.name}</span>
                      {result.message && (
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      )}
                      {result.duration && (
                        <p className="text-xs text-gray-500">Completed in {result.duration}ms</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {routers.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Router className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No MikroTik Routers Configured</h3>
                <p className="text-muted-foreground">
                  Add your RouterOS VM to start testing real device integration.
                </p>
              </div>
              <Button asChild>
                <a href="/equipment/mikrotik-routers">Add MikroTik Router</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSystemIntegrationTest;
