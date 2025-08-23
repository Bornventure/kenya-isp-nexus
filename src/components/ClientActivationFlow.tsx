import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFullAutomation } from '@/hooks/useFullAutomation';
import { useRadiusUsers } from '@/hooks/useRadiusUsers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { radiusDebugService } from '@/services/radiusDebugService';
import { AlertCircle, CheckCircle, Loader2, Wifi, Database, Router, Network } from 'lucide-react';

const ClientActivationFlow: React.FC = () => {
  const { toast } = useToast();
  const { activateClientWithFullAutomation } = useFullAutomation();
  const { users, isLoading } = useRadiusUsers();
  const { profile } = useAuth();
  
  // Generate unique test data to avoid duplicates
  const generateUniqueTestData = () => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    return {
      name: `Test Client ${timestamp}`,
      email: `test${timestamp}@example.com`,
      phone: `+25470000${randomSuffix.toString().padStart(4, '0')}`,
      id_number: `${timestamp}${randomSuffix}`.slice(-8), // Keep it 8 digits
      county: 'Nairobi',
      sub_county: 'Westlands',
      address: `${randomSuffix} Test Street`,
      monthly_rate: 2000
    };
  };

  const [clientData, setClientData] = useState(generateUniqueTestData());
  
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<string[] | null>(null);

  const resetTestData = () => {
    setClientData(generateUniqueTestData());
    setCreatedClientId(null);
    setDebugInfo(null);
    setDiagnosticReport(null);
  };

  const createTestClient = async () => {
    if (!profile?.isp_company_id) {
      toast({
        title: "Error",
        description: "No company ID found",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating test client with data:', clientData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          client_type: 'individual',
          connection_type: 'fiber',
          status: 'pending',
          isp_company_id: profile.isp_company_id
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Client created successfully:', data);
      setCreatedClientId(data.id);
      toast({
        title: "Client Created",
        description: `Test client created with ID: ${data.id}`,
      });
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test client",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const approveClient = async () => {
    if (!createdClientId || !profile?.id) return;

    setIsActivating(true);
    try {
      console.log('Approving client:', createdClientId);
      
      const { error } = await supabase
        .from('clients')
        .update({
          status: 'approved',
          approved_by: profile.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', createdClientId);

      if (error) throw error;

      console.log('Client approved successfully');
      toast({
        title: "Client Approved",
        description: "Client has been approved successfully",
      });
    } catch (error) {
      console.error('Error approving client:', error);
      toast({
        title: "Error",
        description: "Failed to approve client",
        variant: "destructive"
      });
    } finally {
      setIsActivating(false);
    }
  };

  const activateClientSubscription = async () => {
    if (!createdClientId || !profile?.isp_company_id) return;

    setIsActivating(true);
    try {
      console.log('Activating client subscription for:', createdClientId);
      
      const result = await activateClientWithFullAutomation({
        clientId: createdClientId,
        servicePackageId: '', // Optional for this test
        companyId: profile.isp_company_id
      });

      console.log('Activation result:', result);

      if (result.success) {
        toast({
          title: "Success",
          description: "Client activated with RADIUS user created!",
        });
        
        // Get detailed debug info
        await getDebugInfo();
      } else {
        toast({
          title: "Activation Issues",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error activating client:', error);
      toast({
        title: "Error",
        description: "Failed to activate client",
        variant: "destructive"
      });
    } finally {
      setIsActivating(false);
    }
  };

  const getDebugInfo = async () => {
    if (!createdClientId) return;

    try {
      console.log('Gathering debug information...');
      
      // Get client details
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', createdClientId)
        .single();

      // Get RADIUS user details
      const { data: radiusUsers, error: radiusError } = await supabase
        .from('radius_users' as any)
        .select('*')
        .eq('client_id', createdClientId);

      // Get company details
      const { data: company, error: companyError } = await supabase
        .from('isp_companies')
        .select('*')
        .eq('id', profile?.isp_company_id)
        .single();

      const debugData = {
        client: clientError ? { error: clientError } : client,
        radiusUsers: radiusError ? { error: radiusError } : radiusUsers,
        company: companyError ? { error: companyError } : company,
        timestamp: new Date().toISOString()
      };

      console.log('Debug information collected:', debugData);
      setDebugInfo(debugData);
      
    } catch (error) {
      console.error('Error collecting debug info:', error);
    }
  };

  const runFullDiagnostic = async () => {
    if (!profile?.isp_company_id) return;

    setIsTestingConnectivity(true);
    try {
      console.log('Running full RADIUS diagnostic...');
      
      const diagnostic = await radiusDebugService.performFullDiagnostic(createdClientId || undefined);
      const report = radiusDebugService.generateTroubleshootingReport(diagnostic, createdClientId || undefined);
      
      setDiagnosticReport(report);
      setDebugInfo(diagnostic);
      
      toast({
        title: "Diagnostic Complete",
        description: `Found ${diagnostic.radiusUsers.length} RADIUS users, ${diagnostic.recentSessions.length} sessions`,
      });

    } catch (error) {
      console.error('Diagnostic failed:', error);
      toast({
        title: "Diagnostic Failed",
        description: "Error running full diagnostic",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const testConnectivity = async () => {
    setIsTestingConnectivity(true);
    try {
      console.log('Testing connectivity to RADIUS server...');
      
      // Test database connectivity
      const { data: testQuery, error } = await supabase
        .from('radius_users' as any)
        .select('count')
        .limit(1);

      if (error) {
        console.error('Database connectivity test failed:', error);
        toast({
          title: "Database Test Failed",
          description: "Cannot connect to RADIUS database",
          variant: "destructive"
        });
        return;
      }

      console.log('Database connectivity: OK');
      
      // You can add more connectivity tests here
      toast({
        title: "Connectivity Test",
        description: "Database connection is working. Check RADIUS server logs for authentication attempts.",
      });

    } catch (error) {
      console.error('Connectivity test error:', error);
      toast({
        title: "Connectivity Test Failed",
        description: "Error testing connectivity",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const getRadiusUserForClient = () => {
    return users.find(user => user.client_id === createdClientId);
  };

  const radiusUser = getRadiusUserForClient();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Activation Flow - Integration Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Testing end-to-end client activation with RADIUS integration
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                value={clientData.name}
                onChange={(e) => setClientData({...clientData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({...clientData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={clientData.phone}
                onChange={(e) => setClientData({...clientData, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                value={clientData.id_number}
                onChange={(e) => setClientData({...clientData, id_number: e.target.value})}
              />
            </div>
          </div>

          <div className="flex space-x-2 flex-wrap gap-2">
            <Button onClick={resetTestData} variant="outline" size="sm">
              🔄 Reset Test Data
            </Button>
            
            <Button onClick={createTestClient} disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              1. Create Test Client
            </Button>
            
            <Button 
              onClick={approveClient} 
              disabled={!createdClientId || isActivating}
              variant="outline"
            >
              2. Approve Client
            </Button>
            
            <Button 
              onClick={activateClientSubscription} 
              disabled={!createdClientId || isActivating}
              variant="default"
            >
              {isActivating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              3. Activate & Create RADIUS User
            </Button>

            <Button 
              onClick={runFullDiagnostic} 
              disabled={isTestingConnectivity}
              variant="secondary"
            >
              {isTestingConnectivity ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              Run Full Diagnostic
            </Button>
          </div>

          {createdClientId && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Created Client Info:</h3>
              <p><strong>Client ID:</strong> {createdClientId}</p>
              <p><strong>Email:</strong> {clientData.email}</p>
              <p><strong>Phone:</strong> {clientData.phone}</p>
              
              <Button 
                onClick={getDebugInfo} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                <Database className="h-4 w-4 mr-2" />
                Get Debug Info
              </Button>
            </div>
          )}

          {radiusUser && (
            <div className="mt-4 p-4 border rounded-lg bg-green-50">
              <h3 className="font-semibold mb-2 text-green-800 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                RADIUS User Created!
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Username:</strong> {radiusUser.username}</p>
                <p><strong>Status:</strong> <Badge variant={radiusUser.isActive ? 'default' : 'secondary'}>{radiusUser.status}</Badge></p>
                <p><strong>Profile:</strong> {radiusUser.profile}</p>
                <p><strong>Client ID:</strong> {radiusUser.client_id}</p>
                <p><strong>Download Speed:</strong> {radiusUser.downloadSpeed} Kbps</p>
                <p><strong>Upload Speed:</strong> {radiusUser.uploadSpeed} Kbps</p>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  PPPoE Testing Instructions:
                </h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Open Windows Network Settings → Network and Internet → Dial-up</li>
                  <li>2. Click "Set up a new connection" → "Connect to the Internet" → "Broadband (PPPoE)"</li>
                  <li>3. Username: <code className="bg-white px-1 rounded font-mono">{radiusUser.username}</code></li>
                  <li>4. Password: <span className="text-red-600">Check database or logs for generated password</span></li>
                  <li>5. Connection name: "Test RADIUS Connection"</li>
                  <li>6. Server: Your RADIUS server at <code className="bg-white px-1 rounded font-mono">13.48.30.47</code></li>
                </ol>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Troubleshooting Checklist:
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Verify RADIUS server is running on EC2: <code>sudo systemctl status freeradius</code></li>
                  <li>• Check RADIUS logs: <code>sudo tail -f /var/log/freeradius/radius.log</code></li>
                  <li>• Test RADIUS authentication: <code>radtest {radiusUser.username} [password] localhost 1812 0 testing123</code></li>
                  <li>• Verify database connection from EC2 to Supabase</li>
                  <li>• Check MikroTik RADIUS configuration and connectivity to EC2</li>
                  <li>• Ensure port 1812/1813 are open on EC2 security group</li>
                </ul>
              </div>
            </div>
          )}

          {diagnosticReport && (
            <div className="mt-4 p-4 border rounded-lg bg-yellow-50">
              <h3 className="font-semibold mb-2 text-yellow-800 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                RADIUS Diagnostic Report:
              </h3>
              <div className="text-sm font-mono whitespace-pre-wrap text-yellow-700">
                {diagnosticReport.join('\n')}
              </div>
            </div>
          )}

          {debugInfo && (
            <div className="mt-4 p-4 border rounded-lg bg-slate-50">
              <h3 className="font-semibold mb-2 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Debug Information:
              </h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Router className="h-5 w-5 mr-2" />
            System Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="font-semibold text-blue-600 mb-2">1. Database</div>
              <div className="text-sm text-muted-foreground">
                Supabase → EC2 RADIUS DB
              </div>
              <Badge variant={users.length > 0 ? 'default' : 'secondary'} className="mt-2">
                {users.length > 0 ? 'Connected' : 'No Data'}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="font-semibold text-green-600 mb-2">2. RADIUS Server</div>
              <div className="text-sm text-muted-foreground">
                EC2 FreeRADIUS @ 13.48.30.47
              </div>
              <Badge variant="secondary" className="mt-2">
                Check Logs
              </Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="font-semibold text-purple-600 mb-2">3. MikroTik Router</div>
              <div className="text-sm text-muted-foreground">
                RouterOS @ 192.168.88.1
              </div>
              <Badge variant="secondary" className="mt-2">
                Manual Verify
              </Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="font-semibold text-orange-600 mb-2">4. Client Connection</div>
              <div className="text-sm text-muted-foreground">
                Windows PPPoE Client
              </div>
              <Badge variant="destructive" className="mt-2">
                Not Working
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All RADIUS Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading RADIUS users...
            </div>
          ) : users.length === 0 ? (
            <p>No RADIUS users found. Create and activate a client first.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{user.username}</span>
                    <Badge className="ml-2" variant={user.isActive ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                    {user.client_id && (
                      <Badge variant="outline" className="ml-2">
                        Client: {user.client_id.slice(0, 8)}...
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Profile: {user.profile} | Speed: {user.downloadSpeed}/{user.uploadSpeed} Kbps
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientActivationFlow;
