
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
import { Plus, Unplug, Eye } from 'lucide-react';
import { useInventoryItems, useUnassignEquipmentFromClient } from '@/hooks/useInventory';
import AssignEquipmentDialog from '@/components/inventory/AssignEquipmentDialog';
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
  
  // Get equipment assigned to this client
  const { data: assignedEquipment, isLoading } = useInventoryItems({
    // Filter by assigned customer in the hook query
  });

  // Filter for equipment assigned to this specific client
  const clientEquipment = assignedEquipment?.filter(
    item => item.assigned_customer_id === clientId
  ) || [];

  const handleUnassign = (itemId: string) => {
    if (confirm('Are you sure you want to unassign this equipment? It will be marked as returned.')) {
      unassignEquipment(itemId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Deployed':
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assigned Equipment ({clientEquipment.length})</CardTitle>
          <Button onClick={() => setShowAssignDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign New Equipment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ) : clientEquipment.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientEquipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.item_id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.type}</div>
                      <div className="text-sm text-muted-foreground">{item.category}</div>
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
                        onClick={() => handleUnassign(item.id)}
                        disabled={isUnassigning}
                      >
                        <Unplug className="h-4 w-4 mr-1" />
                        Return
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
            <p className="text-sm">Click "Assign New Equipment" to get started</p>
          </div>
        )}
      </CardContent>

      <AssignEquipmentDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        clientId={clientId}
        clientName={clientName}
      />
    </Card>
  );
};

export default AssignedEquipmentSection;
