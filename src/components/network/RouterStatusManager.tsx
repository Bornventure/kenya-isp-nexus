import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useRadiusAutomation } from '@/hooks/useRadiusAutomation';
import { AlertTriangle, CheckCircle, Router, RefreshCw, Settings, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RouterStatusManager = () => {
  const { routers, isLoading, testConnection } = useMikrotikRouters();
  const { sendWebhook, generateCredentials } = useRadiusAutomation();
  const { toast } = useToast();
  const [processingRouter, setProcessingRouter] = useState<string | null>(null);

  const failedRouters = routers.filter(r => r.connection_status === 'configuration_failed');
  const connectedRouters = routers.filter(r => r.connection_status === 'connected');

  const handleFixRouterConfiguration = async (router: any) => {
    setProcessingRouter(router.id);
    
    try {
      // First, test the connection
      await testConnection({
        id: router.id,
        ip_address: router.ip_address,
        admin_username: router.admin_username,
        admin_password: router.admin_password
      });

      // Generate RADIUS credentials for all clients
      await generateCredentials({ bulk_generate: true });

      // Send webhook to EC2 to sync configuration
      await sendWebhook({
        client_id: 'bulk_sync',
        status: 'configuration_retry',
        action: 'sync_router_config',
        ec2_endpoint: `http://${router.ip_address}:8080/api/configure`
      });

      toast({
        title: "Router Configuration Fixed",
        description: `${router.name} configuration has been resolved`,
      });
    } catch (error) {
      toast({
        title: "Configuration Fix Failed",
        description: `Failed to fix ${router.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setProcessingRouter(null);
    }
  };

  const handleBulkRadiusSync = async () => {
    try {
      // Generate credentials for all clients
      await generateCredentials({ bulk_generate: true });
      
      // Sync all connected routers
      for (const router of connectedRouters) {
        await sendWebhook({
          client_id: 'bulk_sync',
          status: 'bulk_sync',
          action: 'sync_all_clients',
          ec2_endpoint: `http://${router.ip_address}:8080/api/sync`
        });
      }

      toast({
        title: "Bulk RADIUS Sync Complete",
        description: "All RADIUS users have been synced to MikroTik routers",
      });
    } catch (error) {
      toast({
        title: "Bulk Sync Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading router status...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {failedRouters.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {failedRouters.length} router(s) have configuration issues that need attention.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Router className="h-5 w-5" />
              Router Status & Configuration
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleBulkRadiusSync}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Sync All RADIUS Users
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routers.map((router) => (
              <div key={router.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{router.name}</h3>
                      <Badge variant={
                        router.connection_status === 'connected' ? 'default' :
                        router.connection_status === 'configuration_failed' ? 'destructive' : 'secondary'
                      }>
                        {router.connection_status || 'unknown'}
                      </Badge>
                      {router.connection_status === 'connected' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {router.connection_status === 'configuration_failed' && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <p>IP: {router.ip_address}</p>
                      <p>Network: {router.client_network}</p>
                      <p>Gateway: {router.gateway}</p>
                      <p>DNS: {router.dns_servers}</p>
                    </div>

                    {router.last_test_results && (
                      <div className="mt-2">
                        <details>
                          <summary className="text-sm cursor-pointer text-blue-600 hover:text-blue-800">
                            View Configuration Details
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <pre>{typeof router.last_test_results === 'string' 
                              ? router.last_test_results 
                              : JSON.stringify(router.last_test_results, null, 2)}</pre>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {router.connection_status === 'configuration_failed' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleFixRouterConfiguration(router)}
                        disabled={processingRouter === router.id}
                        className="flex items-center gap-1"
                      >
                        <Settings className="h-3 w-3" />
                        {processingRouter === router.id ? 'Fixing...' : 'Fix Config'}
                      </Button>
                    )}
                    
                    {router.connection_status === 'connected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendWebhook({
                          client_id: 'manual_sync',
                          status: 'manual_sync',
                          action: 'sync_router',
                          ec2_endpoint: `http://${router.ip_address}:8080/api/sync`
                        })}
                        className="flex items-center gap-1"
                      >
                        <Zap className="h-3 w-3" />
                        Sync Users
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {routers.length === 0 && (
              <div className="text-center py-8">
                <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Routers Found</h3>
                <p className="text-gray-500">
                  Add routers in the Router Management tab to get started.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouterStatusManager;