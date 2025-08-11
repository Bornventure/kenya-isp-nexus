
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Router, 
  Network, 
  Settings, 
  Terminal, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MikroTikSetupGuide = () => {
  const { toast } = useToast();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, commandName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(commandName);
    setTimeout(() => setCopiedCommand(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: `${commandName} command copied successfully.`,
    });
  };

  const vmwareCommands = [
    {
      name: "Enable API",
      command: "/ip service enable api",
      description: "Enable RouterOS API service"
    },
    {
      name: "Set API Port",
      command: "/ip service set api port=8728",
      description: "Set API port to default 8728"
    },
    {
      name: "Enable SSH",
      command: "/ip service enable ssh",
      description: "Enable SSH access"
    },
    {
      name: "Create Admin User",
      command: "/user add name=apiuser password=strongpassword group=full",
      description: "Create dedicated API user"
    },
    {
      name: "Enable SNMP",
      command: "/snmp set enabled=yes",
      description: "Enable SNMP for monitoring"
    },
    {
      name: "Configure PPPoE Server",
      command: "/interface pppoe-server server add service-name=isp-service interface=ether2 disabled=no",
      description: "Setup PPPoE server on interface"
    },
    {
      name: "Create IP Pool",
      command: "/ip pool add name=client-pool ranges=10.10.0.1-10.10.0.254",
      description: "Create IP pool for clients"
    },
    {
      name: "Create PPP Profile",
      command: "/ppp profile add name=client-profile local-address=10.10.0.1 remote-address=client-pool dns-server=8.8.8.8,8.8.4.4",
      description: "Create PPP profile for clients"
    }
  ];

  const networkSetup = [
    {
      step: "1",
      title: "VMware Network Configuration",
      items: [
        "Set Network Adapter 1 to 'Bridged' mode",
        "Set Network Adapter 2 to 'NAT' or 'Host-only' for client connections",
        "Ensure VM has at least 256MB RAM",
        "Boot RouterOS VM and complete initial setup"
      ]
    },
    {
      step: "2",
      title: "RouterOS Initial Setup",
      items: [
        "Login with admin user (default: no password)",
        "Set admin password: /user set admin password=yourpassword",
        "Configure IP address: /ip address add address=192.168.1.100/24 interface=ether1",
        "Set default gateway: /ip route add gateway=192.168.1.1"
      ]
    },
    {
      step: "3",
      title: "Enable Required Services",
      items: [
        "Enable API service for remote management",
        "Enable SSH for secure access",
        "Enable SNMP for monitoring",
        "Configure firewall rules if needed"
      ]
    },
    {
      step: "4",
      title: "PPPoE Server Configuration",
      items: [
        "Create PPPoE server on client-facing interface",
        "Setup IP pools for client assignments",
        "Create PPP profiles with appropriate settings",
        "Configure DNS servers for clients"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-6 w-6" />
            MikroTik RouterOS VM Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This guide will help you set up your RouterOS VM in VMware Workstation Pro 17 
              for integration with the ISP management system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network">Network Setup</TabsTrigger>
          <TabsTrigger value="commands">RouterOS Commands</TabsTrigger>
          <TabsTrigger value="integration">System Integration</TabsTrigger>
          <TabsTrigger value="testing">Testing & Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <div className="grid gap-4">
            {networkSetup.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">{section.step}</Badge>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertDescription>
              Execute these commands in RouterOS terminal (via Winbox, SSH, or console).
              Click the copy button to copy each command.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {vmwareCommands.map((cmd, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{cmd.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(cmd.command, cmd.name)}
                      className="gap-2"
                    >
                      {copiedCommand === cmd.name ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedCommand === cmd.name ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm mb-2">
                    {cmd.command}
                  </div>
                  <p className="text-sm text-muted-foreground">{cmd.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">1. Network Connectivity</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ensure your RouterOS VM is accessible from your ISP management system:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• VM IP address is reachable from your application</li>
                    <li>• RouterOS API port (8728) is accessible</li>
                    <li>• SSH port (22) is open for secure access</li>
                    <li>• SNMP (161/UDP) is enabled for monitoring</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">2. Add Router to System</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    In the ISP management system:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Go to Equipment → MikroTik Routers</li>
                    <li>• Click "Add Router"</li>
                    <li>• Enter VM IP address and credentials</li>
                    <li>• Configure SNMP settings</li>
                    <li>• Test connection to verify setup</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">3. Configure Services</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Set up the required services:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• PPPoE server for client connections</li>
                    <li>• RADIUS client configuration</li>
                    <li>• Simple queues for bandwidth management</li>
                    <li>• Firewall rules for security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testing Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Use the System Test page to run comprehensive tests with your RouterOS VM.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Connection Tests</h4>
                  <ul className="text-sm space-y-1">
                    <li>✓ Ping connectivity to RouterOS VM</li>
                    <li>✓ SSH access verification</li>
                    <li>✓ RouterOS API communication</li>
                    <li>✓ SNMP monitoring setup</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Service Tests</h4>
                  <ul className="text-sm space-y-1">
                    <li>✓ PPPoE server functionality</li>
                    <li>✓ User authentication via RADIUS</li>
                    <li>✓ Bandwidth limit enforcement</li>
                    <li>✓ Session management</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Integration Tests</h4>
                  <ul className="text-sm space-y-1">
                    <li>✓ Client registration and activation</li>
                    <li>✓ Service package assignment</li>
                    <li>✓ Payment processing integration</li>
                    <li>✓ Network access control</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild>
                  <a href="/system-test" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Run System Tests
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/equipment/mikrotik-routers" className="gap-2">
                    <Router className="h-4 w-4" />
                    Manage Routers
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MikroTikSetupGuide;
