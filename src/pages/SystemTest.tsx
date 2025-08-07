
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Router, Database, Wifi, Clipboard, Activity } from 'lucide-react';
import SystemIntegrationTest from '@/components/testing/SystemIntegrationTest';
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
          Complete end-to-end testing of client onboarding, network management, payment processing, and production readiness validation
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
            RADIUS Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-4">
          <SystemIntegrationTest />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                FreeRADIUS Integration Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">RADIUS Server Configuration</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Authentication Server: localhost:1812</li>
                    <li>• Accounting Server: localhost:1813</li>
                    <li>• Database Integration: Active (Supabase)</li>
                    <li>• Client Database: radius_users table</li>
                    <li>• Session Tracking: radius_sessions table</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Test Commands</h4>
                  <div className="text-sm text-green-700 space-y-2 font-mono">
                    <div># Test authentication</div>
                    <div>radtest testuser testpass localhost:1812 0 testing123</div>
                    <div># Check accounting</div>
                    <div>radclient -x localhost:1813 acct accounting.txt</div>
                    <div># Monitor sessions</div>
                    <div>tail -f /var/log/freeradius/radius.log</div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">MikroTik RouterOS Integration</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <div>1. Configure RADIUS client in RouterOS:</div>
                    <div className="font-mono ml-4">/radius add service=ppp address=127.0.0.1 secret=testing123</div>
                    <div>2. Enable RADIUS in PPP profile:</div>
                    <div className="font-mono ml-4">/ppp profile set default use-radius=yes</div>
                    <div>3. Test PPPoE connection with client credentials</div>
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
