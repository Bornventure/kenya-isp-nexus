
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Router, Database, Wifi, Clipboard, Activity } from 'lucide-react';
import EnhancedSystemIntegrationTest from '@/components/testing/EnhancedSystemIntegrationTest';
import ProductionReadinessChecklist from '@/components/testing/ProductionReadinessChecklist';
import NetworkDiagnosticsPanel from '@/components/network/NetworkDiagnosticsPanel';
import ProductionNetworkPanel from '@/components/network/ProductionNetworkPanel';

const SystemTest = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TestTube className="h-8 w-8" />
          Production System Testing & Handover
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete end-to-end testing of client onboarding, network management, payment processing, RADIUS authentication, and production readiness validation
        </p>
      </div>

      <Tabs defaultValue="integration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="integration" className="gap-2">
            <TestTube className="h-4 w-4" />
            Integration Test
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <Clipboard className="h-4 w-4" />
            Readiness
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Router className="h-4 w-4" />
            Network Test
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="gap-2">
            <Activity className="h-4 w-4" />
            Diagnostics
          </TabsTrigger>
          <TabsTrigger value="radius" className="gap-2">
            <Database className="h-4 w-4" />
            RADIUS Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-4">
          <EnhancedSystemIntegrationTest />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <ProductionReadinessChecklist />
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <ProductionNetworkPanel />
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <NetworkDiagnosticsPanel />
        </TabsContent>

        <TabsContent value="radius" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  RADIUS Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">1. Install FreeRADIUS</h4>
                  <div className="text-sm text-blue-700 space-y-2 font-mono">
                    <div># Ubuntu/Debian</div>
                    <div>sudo apt update</div>
                    <div>sudo apt install freeradius freeradius-utils</div>
                    <div>sudo systemctl start freeradius</div>
                    <div>sudo systemctl enable freeradius</div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">2. Configure Database Integration</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>• Edit /etc/freeradius/3.0/mods-available/sql</div>
                    <div>• Configure PostgreSQL connection to your Supabase database</div>
                    <div>• Enable SQL module: sudo ln -s ../mods-available/sql ../mods-enabled/</div>
                    <div>• Restart FreeRADIUS: sudo systemctl restart freeradius</div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">3. Test Authentication</h4>
                  <div className="text-sm text-purple-700 space-y-2 font-mono">
                    <div># Test with a configured user</div>
                    <div>radtest username password localhost:1812 0 testing123</div>
                    <div># Should return "Access-Accept" for valid users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Router className="h-5 w-5" />
                  PPPoE & MikroTik Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">1. MikroTik RADIUS Configuration</h4>
                  <div className="text-sm text-orange-700 space-y-1 font-mono">
                    <div>/radius add service=ppp address=YOUR_SERVER_IP secret=testing123</div>
                    <div>/ppp profile set default use-radius=yes</div>
                    <div>/interface pppoe-server server add service-name=isp interface=ether1</div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <h4 className="font-medium text-teal-800 mb-2">2. Client PPPoE Setup</h4>
                  <div className="text-sm text-teal-700 space-y-1">
                    <div>• Username: Client's email or phone number</div>
                    <div>• Password: Generated by the system</div>
                    <div>• Server: Your ISP's PPPoE server</div>
                    <div>• Speed limits applied automatically via RADIUS attributes</div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">3. Troubleshooting</h4>
                  <div className="text-sm text-red-700 space-y-1">
                    <div>• Check RADIUS logs: tail -f /var/log/freeradius/radius.log</div>
                    <div>• Verify database connectivity</div>
                    <div>• Test MikroTik RADIUS communication</div>
                    <div>• Use the Integration Tests above to verify setup</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>System Integration Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-semibold text-blue-600 mb-2">1. Client Registration</div>
                  <div className="text-sm text-muted-foreground">
                    System creates RADIUS user entry with speed limits
                  </div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-semibold text-green-600 mb-2">2. PPPoE Connection</div>
                  <div className="text-sm text-muted-foreground">
                    Client connects using PPPoE with RADIUS credentials
                  </div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-semibold text-purple-600 mb-2">3. Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    RADIUS server validates user and applies speed limits
                  </div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-semibold text-orange-600 mb-2">4. Session Tracking</div>
                  <div className="text-sm text-muted-foreground">
                    System tracks usage and manages client sessions
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

export default SystemTest;
