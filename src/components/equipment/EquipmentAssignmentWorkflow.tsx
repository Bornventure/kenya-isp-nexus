
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Wifi,
  Settings
} from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

interface Equipment {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  serial_number: string;
  mac_address?: string;
  status: 'available' | 'deployed' | 'maintenance' | 'retired' | 'assigned';
  client_id?: string;
  ip_address?: string;
  location?: string;
  notes?: string;
  created_at: string;
  isp_company_id: string;
}

const EquipmentAssignmentWorkflow = () => {
  const { equipment, isLoading: equipmentLoading, updateEquipment } = useEquipment();
  const { clients, isLoading: clientsLoading } = useClients();
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');

  const handleAssignEquipment = async () => {
    if (!selectedEquipment || !selectedClient) {
      toast({
        title: "Assignment Error",
        description: "Please select both equipment and client",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateEquipment({
        id: selectedEquipment.id,
        updates: {
          client_id: selectedClient,
          status: 'assigned'
        }
      });

      toast({
        title: "Equipment Assigned",
        description: `${selectedEquipment.brand || 'Equipment'} ${selectedEquipment.model || selectedEquipment.type} has been assigned successfully.`,
      });

      setSelectedEquipment(null);
      setSelectedClient('');
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'assigned':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'deployed':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'assigned':
      case 'deployed':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (equipmentLoading || clientsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableEquipment = equipment?.filter(eq => eq.status === 'available') || [];
  const assignedEquipment = equipment?.filter(eq => eq.status === 'assigned' || eq.status === 'deployed') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Assignment</h2>
          <p className="text-muted-foreground">Assign equipment to clients and manage allocations</p>
        </div>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Assign Equipment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Select Equipment</label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {availableEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedEquipment?.id === eq.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedEquipment(eq)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{eq.brand || 'Unknown Brand'} {eq.model || eq.type}</p>
                        <p className="text-sm text-muted-foreground">S/N: {eq.serial_number}</p>
                      </div>
                      <Badge variant={getStatusColor(eq.status)}>
                        {eq.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Select Client</label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {clients?.map((client) => (
                  <div
                    key={client.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedClient === client.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedClient(client.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <Badge variant="outline">
                        {client.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleAssignEquipment}
            disabled={!selectedEquipment || !selectedClient}
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Assign Equipment
          </Button>
        </CardContent>
      </Card>

      {/* Assigned Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Assigned Equipment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedEquipment.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No equipment currently assigned</p>
          ) : (
            <div className="space-y-4">
              {assignedEquipment.map((eq) => {
                const assignedClient = clients?.find(c => c.id === eq.client_id);
                return (
                  <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(eq.status)}
                      <div>
                        <p className="font-medium">{eq.brand || 'Unknown Brand'} {eq.model || eq.type}</p>
                        <p className="text-sm text-muted-foreground">
                          S/N: {eq.serial_number} | Assigned to: {assignedClient?.name || 'Unknown Client'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(eq.status)}>
                        {eq.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateEquipment({
                            id: eq.id,
                            updates: { client_id: null, status: 'available' }
                          });
                        }}
                      >
                        Unassign
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentAssignmentWorkflow;
