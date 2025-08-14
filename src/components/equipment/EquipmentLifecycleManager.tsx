import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateInventoryItem } from '@/hooks/useInventory';
import { usePromoteToNetworkEquipment } from '@/hooks/useInventory';

interface EquipmentLifecycleManagerProps {
  equipment: any;
}

const EquipmentLifecycleManager: React.FC<EquipmentLifecycleManagerProps> = ({ equipment }) => {
  const { updateEquipment, isUpdating } = useUpdateInventoryItem();
  const { promoteToNetworkEquipment, isPending: isPromoting } = usePromoteToNetworkEquipment();

  const handleStatusUpdate = (newStatus: string) => {
    updateEquipment({
      id: equipment.id,
      updates: { status: newStatus as any }
    });
  };

  const handlePromoteToNetwork = () => {
    promoteToNetworkEquipment({
      equipmentId: equipment.id,
      name: equipment.name || equipment.type,
      manufacturer: equipment.brand || 'Unknown'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Lifecycle Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Status</div>
          <Select value={equipment.status} onValueChange={handleStatusUpdate} disabled={isUpdating}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="secondary" onClick={handlePromoteToNetwork} disabled={isPromoting}>
          {isPromoting ? 'Promoting...' : 'Promote to Network Equipment'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EquipmentLifecycleManager;
