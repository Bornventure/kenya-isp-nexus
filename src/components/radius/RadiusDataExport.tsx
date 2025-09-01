
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, RefreshCw, Database, ExternalLink } from 'lucide-react';
import { useRadiusServers } from '@/hooks/useRadiusServers';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const RadiusDataExport = () => {
  const { radiusServers, isLoading } = useRadiusServers();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const exportUrl = `https://ddljuawonxdnesrnclsx.supabase.co/rest/v1/radius_servers?select=*,router:mikrotik_routers(name,ip_address)&isp_company_id=eq.${profile?.isp_company_id}&is_enabled=eq.true`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(exportUrl);
    toast({
      title: "URL Copied",
      description: "RADIUS export URL has been copied to clipboard.",
    });
  };

  const handleTestExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('radius_servers')
        .select(`
          *,
          router:mikrotik_routers(name, ip_address)
        `)
        .eq('isp_company_id', profile?.isp_company_id)
        .eq('is_enabled', true);

      if (error) throw error;

      // Update last_synced_at for all exported servers
      if (data && data.length > 0) {
        const serverIds = data.map(server => server.id);
        await supabase
          .from('radius_servers')
          .update({ last_synced_at: new Date().toISOString() })
          .in('id', serverIds);
      }

      setLastSync(new Date());
      
      // Download the data as JSON for testing
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `radius-servers-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${data.length} RADIUS server configurations.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export RADIUS configurations.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateClientsConf = () => {
    return radiusServers
      .filter(server => server.is_enabled && server.router)
      .map(server => {
        const routerName = server.router?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'router';
        return `client ${routerName} {
    ipaddr = ${server.router?.ip_address}
    secret = ${server.shared_secret}
    shortname = ${routerName}
    require_message_authenticator = no
}`;
      })
      .join('\n\n');
  };

  const handleCopyClientsConf = () => {
    const config = generateClientsConf();
    navigator.clipboard.writeText(config);
    toast({
      title: "Configuration Copied",
      description: "FreeRADIUS clients.conf content has been copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading RADIUS configurations...</div>
        </CardContent>
      </Card>
    );
  }

  const enabledServers = radiusServers.filter(server => server.is_enabled);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            EC2 Python Script Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{enabledServers.length}</div>
              <div className="text-sm text-muted-foreground">Enabled RADIUS Servers</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {enabledServers.filter(s => s.last_synced_at).length}
              </div>
              <div className="text-sm text-muted-foreground">Synchronized</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {enabledServers.filter(s => !s.last_synced_at).length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Sync</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Supabase REST API Endpoint</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use this URL in your Python script to fetch RADIUS server configurations:
              </p>
              <div className="flex gap-2 items-center">
                <code className="flex-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                  {exportUrl}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Required Headers for Python Script</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div>apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg</div>
                <div>Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OXe.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleTestExport} disabled={isExporting}>
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Test Export & Download
              </Button>
              <Button variant="outline" onClick={handleCopyClientsConf}>
                <Copy className="h-4 w-4 mr-2" />
                Copy clients.conf
              </Button>
            </div>

            {lastSync && (
              <div className="text-sm text-muted-foreground">
                Last export: {lastSync.toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Current RADIUS Servers</h3>
            <div className="space-y-2">
              {enabledServers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No RADIUS servers configured.</p>
              ) : (
                enabledServers.map((server) => (
                  <div key={server.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{server.name}</span>
                        {server.is_primary && <Badge variant="outline">Primary</Badge>}
                        {server.last_synced_at && (
                          <Badge variant="secondary" className="text-xs">
                            Synced {new Date(server.last_synced_at).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {server.router?.ip_address} | Auth: {server.auth_port} | Accounting: {server.accounting_port}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Python Script Integration</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Your Python script should poll the REST API endpoint every 5-10 minutes</p>
              <p>• Compare timestamps to detect changes and update FreeRADIUS configuration</p>
              <p>• Use the shared_secret and router IP address to generate clients.conf entries</p>
              <p>• Restart FreeRADIUS service after configuration changes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
