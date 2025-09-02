
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Server, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useRadiusServers } from '@/hooks/useRadiusServers';
import { useToast } from '@/hooks/use-toast';

const RadiusDataExport = () => {
  const { routers } = useMikrotikRouters();
  const { radiusServers } = useRadiusServers();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const enabledRouters = routers.filter(r => r.status === 'active');
  const enabledRadiusServers = radiusServers.filter(s => s.is_enabled);

  const generateRadiusConfig = () => {
    const config = {
      clients: enabledRadiusServers.map(server => ({
        client_name: server.name,
        ipaddr: server.server_address,
        secret: server.shared_secret,
        shortname: server.name.toLowerCase().replace(/\s+/g, '_'),
        auth_port: server.auth_port,
        acct_port: server.accounting_port,
        timeout: server.timeout_seconds,
      })),
      routers: enabledRouters.map(router => ({
        name: router.name,
        ip_address: router.ip_address,
        admin_username: router.admin_username,
        snmp_community: router.snmp_community,
        snmp_version: router.snmp_version,
        pppoe_interface: router.pppoe_interface,
        dns_servers: router.dns_servers,
        client_network: router.client_network,
        gateway: router.gateway,
      })),
      generated_at: new Date().toISOString(),
      total_clients: enabledRadiusServers.length,
      total_routers: enabledRouters.length,
    };

    return config;
  };

  const downloadConfig = () => {
    try {
      setIsExporting(true);
      const config = generateRadiusConfig();
      
      const dataStr = JSON.stringify(config, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `radius-config-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Export Successful",
        description: "RADIUS configuration has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate configuration file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadRadiusClientsConf = () => {
    try {
      setIsExporting(true);
      
      let clientsConf = "# RADIUS clients configuration\n";
      clientsConf += "# Generated on " + new Date().toISOString() + "\n\n";
      
      enabledRadiusServers.forEach(server => {
        clientsConf += `client ${server.name.toLowerCase().replace(/\s+/g, '_')} {\n`;
        clientsConf += `    ipaddr = ${server.server_address}\n`;
        clientsConf += `    secret = ${server.shared_secret}\n`;
        clientsConf += `    shortname = ${server.name.toLowerCase().replace(/\s+/g, '_')}\n`;
        clientsConf += `    nas_type = mikrotik\n`;
        clientsConf += `}\n\n`;
      });
      
      const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(clientsConf);
      const exportFileDefaultName = `clients.conf`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Export Successful",
        description: "clients.conf file has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate clients.conf file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export RADIUS Configuration for EC2 Deployment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Server className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Ready for Cloud Deployment</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Export your router and RADIUS configurations for deployment to your EC2 FreeRADIUS server. 
                  This will generate the necessary configuration files for automatic setup.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Routers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{enabledRouters.length}</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  MikroTik routers configured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">RADIUS Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{enabledRadiusServers.length}</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Configured for authentication
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Export Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {enabledRouters.length > 0 && enabledRadiusServers.length > 0 ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                      <Badge variant="secondary">Not Ready</Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Configuration status
                </p>
              </CardContent>
            </Card>
          </div>

          {enabledRouters.length === 0 || enabledRadiusServers.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Configuration Required</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {enabledRouters.length === 0 && "Add and activate at least one MikroTik router. "}
                    {enabledRadiusServers.length === 0 && "Enable at least one router for RADIUS authentication."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={downloadConfig}
                  disabled={isExporting}
                  className="h-12 justify-start gap-3"
                >
                  <FileText className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Download JSON Config</div>
                    <div className="text-sm opacity-75">Complete configuration data</div>
                  </div>
                </Button>

                <Button
                  onClick={downloadRadiusClientsConf}
                  disabled={isExporting}
                  variant="outline"
                  className="h-12 justify-start gap-3"
                >
                  <Server className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Download clients.conf</div>
                    <div className="text-sm opacity-75">FreeRADIUS client config</div>
                  </div>
                </Button>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium mb-2">Deployment Instructions</h4>
                <ol className="text-sm space-y-1 ml-4 list-decimal">
                  <li>Download the configuration files above</li>
                  <li>Upload JSON config to your EC2 instance</li>
                  <li>Place clients.conf in /etc/freeradius/3.0/ directory</li>
                  <li>Restart FreeRADIUS service</li>
                  <li>Configure MikroTik routers to use your RADIUS server</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { RadiusDataExport };
export default RadiusDataExport;
