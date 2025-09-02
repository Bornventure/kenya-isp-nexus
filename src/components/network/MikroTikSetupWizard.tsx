
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useAuth } from '@/contexts/AuthContext';
import { Router, CheckCircle, AlertCircle } from 'lucide-react';

const MikroTikSetupWizard = () => {
  const { createRouter, isCreating } = useMikrotikRouters();
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    admin_username: 'admin',
    admin_password: '',
    snmp_community: 'public',
    snmp_version: 2,
    pppoe_interface: 'ether1',
    dns_servers: '8.8.8.8,8.8.4.4',
    client_network: '192.168.1.0/24',
    gateway: '192.168.1.1',
    status: 'offline' as const,
    connection_status: 'disconnected' as const,
    last_test_results: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    // Simulate connection test
    setTestResult(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3; // 70% success rate for demo
    setTestResult({
      success,
      message: success ? 'Connection successful!' : 'Connection failed. Please check your settings.'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.isp_company_id) {
      console.error('No ISP company ID found');
      return;
    }
    
    createRouter({
      ...formData,
      snmp_version: Number(formData.snmp_version),
      isp_company_id: profile.isp_company_id,
    });
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Router className="h-5 w-5" />
          MikroTik Router Setup Wizard - Step {currentStep} of 3
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Router Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Main Office Router"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="ip_address">IP Address *</Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={(e) => handleInputChange('ip_address', e.target.value)}
                    placeholder="192.168.1.1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="admin_username">Admin Username *</Label>
                  <Input
                    id="admin_username"
                    value={formData.admin_username}
                    onChange={(e) => handleInputChange('admin_username', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="admin_password">Admin Password *</Label>
                  <Input
                    id="admin_password"
                    type="password"
                    value={formData.admin_password}
                    onChange={(e) => handleInputChange('admin_password', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Network Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="snmp_community">SNMP Community</Label>
                  <Input
                    id="snmp_community"
                    value={formData.snmp_community}
                    onChange={(e) => handleInputChange('snmp_community', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>SNMP Version</Label>
                  <Select value={formData.snmp_version.toString()} onValueChange={(value) => handleInputChange('snmp_version', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">v1</SelectItem>
                      <SelectItem value="2">v2c</SelectItem>
                      <SelectItem value="3">v3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
                  <Input
                    id="pppoe_interface"
                    value={formData.pppoe_interface}
                    onChange={(e) => handleInputChange('pppoe_interface', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dns_servers">DNS Servers</Label>
                  <Input
                    id="dns_servers"
                    value={formData.dns_servers}
                    onChange={(e) => handleInputChange('dns_servers', e.target.value)}
                    placeholder="8.8.8.8,8.8.4.4"
                  />
                </div>

                <div>
                  <Label htmlFor="client_network">Client Network</Label>
                  <Input
                    id="client_network"
                    value={formData.client_network}
                    onChange={(e) => handleInputChange('client_network', e.target.value)}
                    placeholder="192.168.1.0/24"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gateway">Gateway</Label>
                  <Input
                    id="gateway"
                    value={formData.gateway}
                    onChange={(e) => handleInputChange('gateway', e.target.value)}
                    placeholder="192.168.1.1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.last_test_results}
                  onChange={(e) => handleInputChange('last_test_results', e.target.value)}
                  rows={3}
                  placeholder="Additional configuration notes..."
                />
              </div>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Test Connection & Finalize</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Configuration Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>IP Address:</strong> {formData.ip_address}</p>
                  <p><strong>Admin Username:</strong> {formData.admin_username}</p>
                  <p><strong>Client Network:</strong> {formData.client_network}</p>
                  <p><strong>DNS Servers:</strong> {formData.dns_servers}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="button" 
                  onClick={testConnection}
                  className="w-full"
                >
                  Test Connection
                </Button>
                
                {testResult && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Router'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default MikroTikSetupWizard;
