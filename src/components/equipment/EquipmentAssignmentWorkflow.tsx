
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Router, 
  Cable, 
  Wifi, 
  Server,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EquipmentAssignmentWorkflowProps {
  clientId: string;
  clientName: string;
  clientAddress: string;
  onAssignmentComplete: () => void;
}

interface EquipmentItem {
  id: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  status: string;
  mac_address?: string;
  ip_address?: string;
}

const EquipmentAssignmentWorkflow: React.FC<EquipmentAssignmentWorkflowProps> = ({
  clientId,
  clientName,
  clientAddress,
  onAssignmentComplete
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<{ [key: string]: string }>({});
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentItem[]>([]);
  const [installationNotes, setInstallationNotes] = useState('');
  const [networkConfig, setNetworkConfig] = useState({
    pppoe_username: '',
    pppoe_password: '',
    static_ip: '',
    vlan_id: '',
    bandwidth_profile: ''
  });
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentStep, setAssignmentStep] = useState<'selection' | 'configuration' | 'completion'>('selection');
  const { toast } = useToast();

  React.useEffect(() => {
    fetchAvailableEquipment();
    generateNetworkConfig();
  }, []);

  const fetchAvailableEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', 'available')
        .order('type', { ascending: true });

      if (error) throw error;
      setAvailableEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available equipment",
        variant: "destructive",
      });
    }
  };

  const generateNetworkConfig = () => {
    // Generate default network configuration
    const clientIdShort = clientId.substring(0, 8);
    setNetworkConfig({
      pppoe_username: `client_${clientIdShort}`,
      pppoe_password: Math.random().toString(36).slice(-12),
      static_ip: '', // Will be assigned by DHCP pool
      vlan_id: '100', // Default VLAN for clients
      bandwidth_profile: 'default_10mbps'
    });
  };

  const getEquipmentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'router':
        return <Router className="h-5 w-5" />;
      case 'cable':
        return <Cable className="h-5 w-5" />;
      case 'access point':
        return <Wifi className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'available': 'default',
      'assigned': 'secondary',
      'maintenance': 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const handleEquipmentSelection = (equipmentType: string, equipmentId: string) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [equipmentType]: equipmentId
    }));
  };

  const proceedToConfiguration = () => {
    if (Object.keys(selectedEquipment).length === 0) {
      toast({
        title: "No Equipment Selected",
        description: "Please select at least one piece of equipment",
        variant: "destructive",
      });
      return;
    }
    setAssignmentStep('configuration');
  };

  const assignEquipmentToClient = async () => {
    setIsAssigning(true);
    try {
      // 1. Create equipment assignments
      const assignments = Object.values(selectedEquipment).map(equipmentId => ({
        client_id: clientId,
        equipment_id: equipmentId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
        installation_notes: installationNotes,
        isp_company_id: '', // Will be filled by the database
        status: 'assigned'
      }));

      const { error: assignmentError } = await supabase
        .from('client_equipment_assignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      // 2. Update equipment status
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ 
          status: 'assigned',
          client_id: clientId 
        })
        .in('id', Object.values(selectedEquipment));

      if (equipmentError) throw equipmentError;

      // 3. Create network configuration record
      const { error: configError } = await supabase
        .from('client_equipment')
        .insert({
          client_id: clientId,
          equipment_id: Object.values(selectedEquipment)[0], // Primary equipment
          network_config: networkConfig,
          is_primary: true
        });

      if (configError) throw configError;

      // 4. Update client status to indicate equipment assigned
      const { error: clientError } = await supabase
        .from('clients')
        .update({ 
          installation_status: 'equipment_assigned',
          notes: `Equipment assigned: ${Object.keys(selectedEquipment).join(', ')}. ${installationNotes}`
        })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // 5. Create MikroTik configuration (simulated for now)
      await createMikroTikConfiguration();

      setAssignmentStep('completion');
      
      toast({
        title: "Equipment Assigned Successfully",
        description: `Equipment has been assigned to ${clientName} and is ready for installation.`,
      });

      // Notify completion after a short delay to show success state
      setTimeout(() => {
        onAssignmentComplete();
      }, 3000);

    } catch (error) {
      console.error('Equipment assignment error:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const createMikroTikConfiguration = async () => {
    // This will be replaced with real MikroTik API calls in Phase 2
    console.log('Creating MikroTik configuration (simulated):', {
      client_id: clientId,
      pppoe_username: networkConfig.pppoe_username,
      pppoe_password: networkConfig.pppoe_password,
      vlan_id: networkConfig.vlan_id,
      bandwidth_profile: networkConfig.bandwidth_profile
    });

    // Simulate MikroTik configuration creation
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const equipmentTypes = ['Router', 'Cable', 'Access Point', 'Modem'];

  if (assignmentStep === 'completion') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle>Assignment Complete</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Equipment Successfully Assigned</h3>
              <p className="text-green-700">
                All selected equipment has been assigned to {clientName} and network configuration has been created.
                The client's service is now ready for physical installation.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Network Configuration Created:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">PPPoE Username:</span> {networkConfig.pppoe_username}
                </div>
                <div>
                  <span className="font-medium">VLAN ID:</span> {networkConfig.vlan_id}
                </div>
                <div>
                  <span className="font-medium">Bandwidth Profile:</span> {networkConfig.bandwidth_profile}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Installation Address: {clientAddress}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignmentStep === 'configuration') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Network Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pppoe_username">PPPoE Username</Label>
                <Input
                  id="pppoe_username"
                  value={networkConfig.pppoe_username}
                  onChange={(e) => setNetworkConfig(prev => ({ ...prev, pppoe_username: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="pppoe_password">PPPoE Password</Label>
                <Input
                  id="pppoe_password"
                  value={networkConfig.pppoe_password}
                  onChange={(e) => setNetworkConfig(prev => ({ ...prev, pppoe_password: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="vlan_id">VLAN ID</Label>
                <Input
                  id="vlan_id"
                  value={networkConfig.vlan_id}
                  onChange={(e) => setNetworkConfig(prev => ({ ...prev, vlan_id: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="bandwidth_profile">Bandwidth Profile</Label>
                <Select 
                  value={networkConfig.bandwidth_profile} 
                  onValueChange={(value) => setNetworkConfig(prev => ({ ...prev, bandwidth_profile: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default_5mbps">5 Mbps Package</SelectItem>
                    <SelectItem value="default_10mbps">10 Mbps Package</SelectItem>
                    <SelectItem value="default_20mbps">20 Mbps Package</SelectItem>
                    <SelectItem value="default_50mbps">50 Mbps Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="installation_notes">Installation Notes</Label>
              <Textarea
                id="installation_notes"
                placeholder="Add any special installation notes or requirements..."
                value={installationNotes}
                onChange={(e) => setInstallationNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setAssignmentStep('selection')}
              >
                Back to Selection
              </Button>
              <Button 
                onClick={assignEquipmentToClient}
                disabled={isAssigning}
              >
                {isAssigning ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Assigning Equipment...
                  </>
                ) : (
                  'Complete Assignment'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Assignment for {clientName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select equipment to assign to this client for service installation
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {equipmentTypes.map(type => {
            const typeEquipment = availableEquipment.filter(eq => 
              eq.type.toLowerCase() === type.toLowerCase()
            );

            if (typeEquipment.length === 0) return null;

            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2">
                  {getEquipmentIcon(type)}
                  <h3 className="font-semibold">{type} Equipment</h3>
                  <Badge variant="outline">{typeEquipment.length} available</Badge>
                </div>

                <Select
                  value={selectedEquipment[type] || ''}
                  onValueChange={(value) => handleEquipmentSelection(type, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${type}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {typeEquipment.map(equipment => (
                      <SelectItem key={equipment.id} value={equipment.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{equipment.brand} {equipment.model}</span>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs text-muted-foreground">
                              SN: {equipment.serial_number}
                            </span>
                            {getStatusBadge(equipment.status)}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}

          {availableEquipment.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Equipment Available</h3>
              <p className="text-muted-foreground">
                There is no available equipment to assign. Please add equipment to inventory first.
              </p>
            </div>
          )}

          {availableEquipment.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={proceedToConfiguration}>
                Configure Network Settings
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentAssignmentWorkflow;
