
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRadiusServers } from '@/hooks/useRadiusServers';
import { Download, Database, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RadiusDataExport = () => {
  const { radiusServers, isLoading } = useRadiusServers();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const generateRadiusConfig = () => {
    const enabledServers = radiusServers.filter(server => server.is_enabled);
    
    return enabledServers.map(server => ({
      id: server.id,
      router_id: server.router_id,
      shared_secret: server.shared_secret,
      auth_port: server.auth_port,
      accounting_port: server.accounting_port,
      is_enabled: server.is_enabled,
      is_primary: server.is_primary,
      name: server.name,
      ip_address: server.server_address
    }));
  };

  const handleExportJson = () => {
    setIsExporting(true);
    try {
      const config = generateRadiusConfig();
      const dataStr = JSON.stringify(config, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `radius-config-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export Complete",
        description: "RADIUS configuration exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export RADIUS configuration.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = () => {
    try {
      const config = generateRadiusConfig();
      const dataStr = JSON.stringify(config, null, 2);
      navigator.clipboard.writeText(dataStr);
      
      toast({
        title: "Copied!",
        description: "RADIUS configuration copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy configuration to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading RADIUS data...</div>
        </CardContent>
      </Card>
    );
  }

  const enabledServers = radiusServers.filter(server => server.is_enabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          RADIUS Configuration Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Export RADIUS server configuration for EC2 sync script
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {enabledServers.length} enabled servers
              </Badge>
              <Badge variant="secondary">
                {radiusServers.length} total servers
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
            <Button onClick={handleExportJson} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </Button>
          </div>
        </div>

        {enabledServers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Preview (first 3 entries):</h4>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-40">
              {JSON.stringify(generateRadiusConfig().slice(0, 3), null, 2)}
            </pre>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">EC2 Sync Instructions</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1. Download or copy the JSON configuration above</p>
            <p>2. Your EC2 sync script should fetch this data and generate:</p>
            <code className="text-xs bg-muted px-2 py-1 rounded">/etc/freeradius/3.0/clients.conf</code>
            <p>3. Each entry will create a client block like:</p>
            <pre className="text-xs bg-muted p-2 rounded mt-2">
{`client router_name {
    ipaddr = 192.168.1.1
    secret = RadiusPassword123!
    shortname = RouterName
}`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
