
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

const ClientActivationFlow: React.FC = () => {
  const { toast } = useToast();
  const { activateClientWithFullAutomation } = useFullAutomation();
  const { users, isLoading } = useRadiusUsers();
  const { profile } = useAuth();
  
  const [clientData, setClientData] = useState({
    name: 'Test Client',
    email: 'test@example.com',
    phone: '+254700000000',
    id_number: '12345678',
    county: 'Nairobi',
    sub_county: 'Westlands',
    address: '123 Test Street',
    monthly_rate: 2000
  });
  
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

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

      setCreatedClientId(data.id);
      toast({
        title: "Client Created",
        description: `Test client created with ID: ${data.id}`,
      });
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create test client",
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
      const { error } = await supabase
        .from('clients')
        .update({
          status: 'approved',
          approved_by: profile.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', createdClientId);

      if (error) throw error;

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
      const result = await activateClientWithFullAutomation({
        clientId: createdClientId,
        servicePackageId: '', // Optional for this test
        companyId: profile.isp_company_id
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Client activated with RADIUS user created!",
        });
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

  const getRadiusUserForClient = () => {
    return users.find(user => user.client_id === createdClientId);
  };

  const radiusUser = getRadiusUserForClient();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Activation Flow - Integration Test</CardTitle>
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
              <Label htmlFor="monthly_rate">Monthly Rate (KES)</Label>
              <Input
                id="monthly_rate"
                type="number"
                value={clientData.monthly_rate}
                onChange={(e) => setClientData({...clientData, monthly_rate: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={createTestClient} disabled={isCreating}>
              {isCreating ? 'Creating...' : '1. Create Test Client'}
            </Button>
            
            <Button 
              onClick={approveClient} 
              disabled={!createdClientId || isActivating}
              variant="outline"
            >
              {isActivating ? 'Approving...' : '2. Approve Client'}
            </Button>
            
            <Button 
              onClick={activateClientSubscription} 
              disabled={!createdClientId || isActivating}
              variant="default"
            >
              {isActivating ? 'Activating...' : '3. Activate & Create RADIUS User'}
            </Button>
          </div>

          {createdClientId && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Created Client Info:</h3>
              <p><strong>Client ID:</strong> {createdClientId}</p>
              <p><strong>Email:</strong> {clientData.email}</p>
              <p><strong>Phone:</strong> {clientData.phone}</p>
            </div>
          )}

          {radiusUser && (
            <div className="mt-4 p-4 border rounded-lg bg-green-50">
              <h3 className="font-semibold mb-2 text-green-800">RADIUS User Created!</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Username:</strong> {radiusUser.username}</p>
                <p><strong>Status:</strong> <Badge variant={radiusUser.isActive ? 'default' : 'secondary'}>{radiusUser.status}</Badge></p>
                <p><strong>Profile:</strong> {radiusUser.profile}</p>
                <p><strong>Client ID:</strong> {radiusUser.client_id}</p>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">PPPoE Testing Instructions:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Open Windows Network Settings</li>
                  <li>2. Create new PPPoE connection</li>
                  <li>3. Use username: <code className="bg-white px-1 rounded">{radiusUser.username}</code></li>
                  <li>4. Password will be generated (check database or logs)</li>
                  <li>5. Server: Your RADIUS server IP</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All RADIUS Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading RADIUS users...</p>
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
                  </div>
                  <div className="text-sm text-gray-600">
                    Profile: {user.profile}
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
