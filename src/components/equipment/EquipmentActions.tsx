
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useUpdateInventoryItem, usePromoteToNetworkEquipment } from '@/hooks/useInventory';

interface EquipmentActionsProps {
  equipment: any;
  onEdit: () => void;
}

const EquipmentActions: React.FC<EquipmentActionsProps> = ({ equipment, onEdit }) => {
  const { mutate: updateEquipment, isUpdating } = useUpdateInventoryItem();
  const { mutate: promoteToNetworkEquipment, isPending: isPromoting } = usePromoteToNetworkEquipment();

  const handleStatusChange = (newStatus: string) => {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('available')} disabled={isUpdating}>
          Mark as Available
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('deployed')} disabled={isUpdating}>
          Mark as Deployed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('maintenance')} disabled={isUpdating}>
          Mark as Maintenance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePromoteToNetwork} disabled={isPromoting}>
          Promote to Network Equipment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EquipmentActions;
