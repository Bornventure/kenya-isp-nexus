
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRadiusAutomation, RadiusClientStatus } from '@/hooks/useRadiusAutomation';
import { RefreshCw, Zap, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const RadiusAutomationDashboard = () => {
  const {
    radiusStatus,
    statusLoading,
    generateCredentials,
    sendWebhook,
    runBillingAutomation,
    refetchStatus,
    isGeneratingCredentials,
    isSendingWebhook,
    isRunningBillingAutomation,
  } = useRadiusAutomation();

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-6 w-6 mr-2" />
        <span>Loading RADIUS status...</span>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getSyncStatusBadgeVariant = (syncStatus: string) => {
    switch (syncStatus) {
      case 'synced': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RADIUS Automation Dashboard</h1>
          <p className="text-muted-foreground">Monitor and control your RADIUS integration</p>
        </div>
        <Button
          onClick={() => refetchStatus()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{radiusStatus?.total_clients || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{radiusStatus?.active_clients || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{radiusStatus?.suspended_clients || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{radiusStatus?.pending_sync || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Controls</CardTitle>
          <CardDescription>
            Manage RADIUS automation and billing processes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => generateCredentials({ bulk_generate: true })}
              disabled={isGeneratingCredentials}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isGeneratingCredentials ? 'Generating...' : 'Generate All Credentials'}
            </Button>

            <Button
              onClick={() => runBillingAutomation()}
              disabled={isRunningBillingAutomation}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRunningBillingAutomation ? 'animate-spin' : ''}`} />
              {isRunningBillingAutomation ? 'Processing...' : 'Run Billing Check'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client RADIUS Status</CardTitle>
          <CardDescription>
            Real-time status of all RADIUS-enabled clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {radiusStatus?.clients?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Client</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Sync Status</th>
                    <th className="text-left p-2">Credentials</th>
                    <th className="text-left p-2">Bandwidth</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {radiusStatus.clients.map((client: RadiusClientStatus) => (
                    <tr key={client.client_id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.phone}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(client.status)}>
                          {client.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={getSyncStatusBadgeVariant(client.sync_status)}>
                          {client.sync_status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div>User: {client.username}</div>
                          <div>Profile: {client.bandwidth_profile}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div>↓ {Math.floor(client.download_speed_kbps / 1024)} Mbps</div>
                          <div>↑ {Math.floor(client.upload_speed_kbps / 1024)} Mbps</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div>KES {client.wallet_balance.toFixed(2)}</div>
                          <div className="text-muted-foreground">Need: {client.monthly_rate.toFixed(2)}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {client.needs_sync && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendWebhook({
                                client_id: client.client_id,
                                status: client.status,
                                action: client.action
                              })}
                              disabled={isSendingWebhook}
                            >
                              Sync
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateCredentials({ client_id: client.client_id })}
                            disabled={isGeneratingCredentials}
                          >
                            Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No RADIUS clients found. Generate credentials for your active clients to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>EC2 Integration Endpoints</CardTitle>
          <CardDescription>
            Use these endpoints in your Python script for seamless integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-sm">
            <div>
              <strong>Poll for client status:</strong>
              <div className="bg-muted p-2 rounded mt-1">
                POST https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-client-status
              </div>
            </div>
            
            <div>
              <strong>Report sync results:</strong>
              <div className="bg-muted p-2 rounded mt-1">
                POST https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-sync-callback
              </div>
            </div>
            
            <div>
              <strong>Webhook endpoint (instant notifications):</strong>
              <div className="bg-muted p-2 rounded mt-1">
                POST https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-status-webhook
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
