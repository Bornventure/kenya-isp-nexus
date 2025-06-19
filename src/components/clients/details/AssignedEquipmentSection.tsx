import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Unplug, Eye, Package, Network } from 'lucide-react';
import { useInventoryItems, useUnassignEquipmentFromClient } from '@/hooks/useInventory';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UnifiedEquipmentAssignmentDialog from '@/components/inventory/UnifiedEquipmentAssignmentDialog';
import { format } from 'date-fns';

interface AssignedEquipmentSectionProps {
  clientId: string;
  clientName: string;
  onViewEquipment?: (itemId: string) => void;
}

const AssignedEquipmentSection: React.FC<AssignedEquipmentSectionProps> = ({
  clientId,
  clientName,
  onViewEquipment,
}) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { mutate: unassignEquipment, isPending: isUnassigning } = useUnassignEquipmentFromClient();
  
  // Get equipment assigned to this client from both systems
  const { data: inventoryEquipment = [] } = useInventoryItems({});
  const clientInventoryEquipment = inventoryEquipment.filter(
    item => item.assigned_customer_id === clientId
  );

  // Get network equipment assigned to client
  const { data: networkEquipment = [] } = useQuery({
    queryKey: ['client-network-equipment', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('client_id', clientId);

      if (error) throw error;
      return data || [];
    },
  });

  // Get client equipment mappings for additional context
  const { data: equipmentMappings = [] } = useQuery({
    queryKey: ['client-equipment-mappings', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_equipment')
        .select(`
          *,
          inventory_items (*)
        `)
        .eq('client_id', clientId);

      if (error) throw error;
      return data || [];
    },
  });

  const handleUnassignInventory = (itemId: string) => {
    if (confirm('Are you sure you want to unassign this equipment? It will be marked as returned.')) {
      unassignEquipment(itemId);
    }
  };

  const handleUnassignNetwork = async (equipmentId: string) => {
    if (confirm('Are you sure you want to unassign this network equipment?')) {
      const { error } = await supabase
        .from('equipment')
        .update({ client_id: null, status: 'active' })
        .eq('id', equipmentId);

      if (error) {
        console.error('Error unassigning network equipment:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Deployed':
        return 'default';
      case 'deployed':
        return 'default';
      case 'Provisioning':
        return 'secondary';
      case 'Faulty':
        return 'destructive';
      case 'In Repair':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const totalEquipment = clientInventoryEquipment.length + networkEquipment.length;

  const handleAssignEquipment = (data: { itemId: string; clientId: string }) => {
    // This will be handled by the dialog's onAssign prop
    console.log('Assigning equipment:', data);
    setShowAssignDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assigned Equipment ({totalEquipment})</CardTitle>
          <Button onClick={() => setShowAssignDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Equipment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {totalEquipment > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item/Equipment</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Inventory Items (CPE) */}
              {clientInventoryEquipment.map((item) => (
                <TableRow key={`inv-${item.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">CPE</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.type}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {item.item_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {item.manufacturer && (
                        <div className="text-sm text-muted-foreground">
                          {item.manufacturer}
                        </div>
                      )}
                      <div className="font-medium">{item.model || item.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.serial_number || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.assignment_date 
                      ? format(new Date(item.assignment_date), 'PPP')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {onViewEquipment && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewEquipment(item.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnassignInventory(item.id)}
                        disabled={isUnassigning}
                      >
                        <Unplug className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {/* Network Equipment */}
              {networkEquipment.map((item) => (
                <TableRow key={`net-${item.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Network</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.type}</div>
                      {item.ip_address && (
                        <div className="text-sm text-muted-foreground font-mono">
                          {String(item.ip_address)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {item.brand && (
                        <div className="text-sm text-muted-foreground">
                          {item.brand}
                        </div>
                      )}
                      <div className="font-medium">{item.model}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.serial_number}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnassignNetwork(item.id)}
                      >
                        <Unplug className="h-4 w-4 mr-1" />
                        Unassign
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No equipment assigned to this client</p>
            <p className="text-sm">Click "Assign Equipment" to get started</p>
          </div>
        )}
      </CardContent>

      <UnifiedEquipmentAssignmentDialog
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        onAssign={handleAssignEquipment}
        itemId=""
        itemName="Equipment"
      />
    </Card>
  );
};

export default AssignedEquipmentSection;
