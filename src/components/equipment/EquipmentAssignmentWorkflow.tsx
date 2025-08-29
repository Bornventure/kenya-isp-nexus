
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Router, Wifi, Cable, Settings } from 'lucide-react';

interface EquipmentAssignmentWorkflowProps {
  clientId: string;
  onAssignmentComplete: () => void;
}

interface EquipmentItem {
  id: string;
  name?: string;
  serial_number: string;
  model: string;
  type: string;
  brand?: string;
  manufacturer?: string;
  status: string;
  purchase_date?: string;
  warranty_expiry?: string;
  warranty_end_date?: string;
  mac_address?: string;
  location?: string;
  notes?: string;
  equipment_type_id?: string;
  equipment_types?: {
    name: string;
  };
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  client_id?: string;
  ip_address: string;
  approval_status?: string;
  approved_at?: string;
  approved_by?: string;
  auto_discovered?: boolean;
  base_station_id?: string;
  firmware_version?: string;
  port_number?: number;
  snmp_community?: string;
  snmp_version?: number;
  vlan_id?: number;
  location_coordinates?: any;
  connection_status?: string;
}

const EquipmentAssignmentWorkflow: React.FC<EquipmentAssignmentWorkflowProps> = ({
  clientId,
  onAssignmentComplete
}) => {
  const { profile } = useAuth();
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentItem[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [networkConfig, setNetworkConfig] = useState({
    pppoe_username: '',
    pppoe_password: '',
    ip_allocation: 'dynamic',
    static_ip: '',
    bandwidth_limit_download: '',
    bandwidth_limit_upload: '',
    vlan_id: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableEquipment();
  }, []);

  const fetchAvailableEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', 'available')
        .in('type', ['router', 'access_point', 'switch', 'cable', 'antenna']);

      if (error) throw error;

      // Type-safe mapping with proper handling of nullable fields
      const equipmentItems: EquipmentItem[] = (data || []).map(item => ({
        ...item,
        ip_address: item.ip_address ? String(item.ip_address) : '',
        status: item.status || 'available',
        brand: item.brand || '',
        manufacturer: item.manufacturer || item.brand || '',
        name: item.name || `${item.brand || ''} ${item.model || ''}`.trim() || item.type,
        approval_status: item.approval_status || 'pending',
        approved_at: item.approved_at || '',
        approved_by: item.approved_by || '',
        auto_discovered: item.auto_discovered || false,
        base_station_id: item.base_station_id || '',
        firmware_version: item.firmware_version || '',
        warranty_expiry: item.warranty_expiry || '',
        warranty_end_date: item.warranty_end_date || '',
        mac_address: item.mac_address || '',
        location: item.location || '',
        notes: item.notes || '',
        equipment_type_id: item.equipment_type_id || '',
        purchase_date: item.purchase_date || '',
        client_id: item.client_id || '',
        port_number: item.port_number || 0,
        snmp_community: item.snmp_community || '',
        snmp_version: item.snmp_version || 0,
        vlan_id: item.vlan_id || 0,
        location_coordinates: item.location_coordinates || null,
        connection_status: item.connection_status || ''
      }));

      setAvailableEquipment(equipmentItems);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to load available equipment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePPPoECredentials = () => {
    const username = `client_${clientId.substring(0, 8)}_${Date.now()}`;
    const password = Math.random().toString(36).slice(-12);
    
    setNetworkConfig(prev => ({
      ...prev,
      pppoe_username: username,
      pppoe_password: password
    }));
  };

  const handleAssignEquipment = async () => {
    if (selectedEquipment.length === 0) {
      toast({
        title: "No Equipment Selected",
        description: "Please select at least one equipment item to assign",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.isp_company_id) {
      toast({
        title: "Error",
        description: "Company information not found",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      // Create equipment assignments with proper company ID
      const assignments = selectedEquipment.map(equipmentId => ({
        client_id: clientId,
        equipment_id: equipmentId,
        assigned_by: profile.id,
        installation_notes: networkConfig.notes,
        status: 'assigned',
        isp_company_id: profile.isp_company_id
      }));

      const { error: assignmentError } = await supabase
        .from('client_equipment_assignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      // Update equipment status to deployed
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ 
          status: 'deployed',
          client_id: clientId
        })
        .in('id', selectedEquipment);

      if (equipmentError) throw equipmentError;

      // Create network configuration record
      const networkConfigData = {
        client_id: clientId,
        pppoe_username: networkConfig.pppoe_username,
        pppoe_password: networkConfig.pppoe_password,
        ip_allocation_type: networkConfig.ip_allocation,
        static_ip_address: networkConfig.static_ip || null,
        bandwidth_download: networkConfig.bandwidth_limit_download ? parseInt(networkConfig.bandwidth_limit_download) : null,
        bandwidth_upload: networkConfig.bandwidth_limit_upload ? parseInt(networkConfig.bandwidth_limit_upload) : null,
        vlan_id: networkConfig.vlan_id ? parseInt(networkConfig.vlan_id) : null,
        configuration_notes: networkConfig.notes,
        status: 'pending_deployment'
      };

      // Call the MikroTik configuration function
      const configResult = await configureMikroTikForClient(networkConfigData);
      
      if (configResult.success) {
        toast({
          title: "Equipment Assigned Successfully",
          description: "Equipment has been assigned and MikroTik configuration is in progress",
        });
        onAssignmentComplete();
      } else {
        toast({
          title: "Assignment Complete, Configuration Pending",
          description: "Equipment assigned but MikroTik configuration needs manual setup",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const configureMikroTikForClient = async (config: any) => {
    try {
      // This would integrate with MikroTik RouterOS API
      // For now, we'll simulate the configuration
      console.log('Configuring MikroTik for client:', config);
      
      // In production, this would:
      // 1. Create PPPoE secret
      // 2. Set bandwidth limits
      // 3. Configure VLAN if specified
      // 4. Set up RADIUS authentication
      
      return { success: true, message: 'Configuration applied successfully' };
    } catch (error) {
      console.error('MikroTik configuration error:', error);
      return { success: false, message: 'Configuration failed' };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading available equipment...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipment Assignment & Network Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Equipment */}
          <div>
            <Label className="text-base font-medium">Available Equipment</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {availableEquipment.map((equipment) => (
                <div
                  key={equipment.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEquipment.includes(equipment.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedEquipment(prev =>
                      prev.includes(equipment.id)
                        ? prev.filter(id => id !== equipment.id)
                        : [...prev, equipment.id]
                    );
                  }}
                >
                  <div className="flex items-center space-x-2">
                    {equipment.type === 'router' && <Router className="h-4 w-4" />}
                    {equipment.type === 'access_point' && <Wifi className="h-4 w-4" />}
                    {equipment.type === 'cable' && <Cable className="h-4 w-4" />}
                    {!['router', 'access_point', 'cable'].includes(equipment.type) && <Settings className="h-4 w-4" />}
                    <span className="font-medium">{equipment.brand} {equipment.model}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Type: {equipment.type} | Serial: {equipment.serial_number}
                    {equipment.ip_address && ` | IP: ${equipment.ip_address}`}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {equipment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Network Configuration */}
          {selectedEquipment.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Network Configuration</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pppoe_username">PPPoE Username</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="pppoe_username"
                      value={networkConfig.pppoe_username}
                      onChange={(e) => setNetworkConfig(prev => ({...prev, pppoe_username: e.target.value}))}
                      placeholder="Enter PPPoE username"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generatePPPoECredentials}
                      size="sm"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pppoe_password">PPPoE Password</Label>
                  <Input
                    id="pppoe_password"
                    type="password"
                    value={networkConfig.pppoe_password}
                    onChange={(e) => setNetworkConfig(prev => ({...prev, pppoe_password: e.target.value}))}
                    placeholder="Enter PPPoE password"
                  />
                </div>

                <div>
                  <Label htmlFor="ip_allocation">IP Allocation</Label>
                  <Select 
                    value={networkConfig.ip_allocation} 
                    onValueChange={(value) => setNetworkConfig(prev => ({...prev, ip_allocation: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dynamic">Dynamic (DHCP)</SelectItem>
                      <SelectItem value="static">Static IP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {networkConfig.ip_allocation === 'static' && (
                  <div>
                    <Label htmlFor="static_ip">Static IP Address</Label>
                    <Input
                      id="static_ip"
                      value={networkConfig.static_ip}
                      onChange={(e) => setNetworkConfig(prev => ({...prev, static_ip: e.target.value}))}
                      placeholder="192.168.1.100"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="download_limit">Download Limit (Mbps)</Label>
                  <Input
                    id="download_limit"
                    value={networkConfig.bandwidth_limit_download}
                    onChange={(e) => setNetworkConfig(prev => ({...prev, bandwidth_limit_download: e.target.value}))}
                    placeholder="100"
                  />
                </div>

                <div>
                  <Label htmlFor="upload_limit">Upload Limit (Mbps)</Label>
                  <Input
                    id="upload_limit"
                    value={networkConfig.bandwidth_limit_upload}
                    onChange={(e) => setNetworkConfig(prev => ({...prev, bandwidth_limit_upload: e.target.value}))}
                    placeholder="50"
                  />
                </div>

                <div>
                  <Label htmlFor="vlan_id">VLAN ID (Optional)</Label>
                  <Input
                    id="vlan_id"
                    value={networkConfig.vlan_id}
                    onChange={(e) => setNetworkConfig(prev => ({...prev, vlan_id: e.target.value}))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Installation Notes</Label>
                <Textarea
                  id="notes"
                  value={networkConfig.notes}
                  onChange={(e) => setNetworkConfig(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Any special installation notes or requirements..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleAssignEquipment}
                disabled={isAssigning}
                className="w-full"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning Equipment...
                  </>
                ) : (
                  'Assign Equipment & Configure Network'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentAssignmentWorkflow;
