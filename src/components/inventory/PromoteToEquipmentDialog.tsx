
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePromoteToNetworkEquipment } from '@/hooks/useInventory';
import { useEquipmentTypes } from '@/hooks/useEquipmentTypes';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { InventoryItem } from '@/hooks/useInventory';

interface PromoteToEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItem: InventoryItem | null;
}

const PromoteToEquipmentDialog: React.FC<PromoteToEquipmentDialogProps> = ({
  open,
  onOpenChange,
  inventoryItem,
}) => {
  const [equipmentData, setEquipmentData] = useState({
    equipment_type_id: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: 2,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: equipmentTypes, isLoading: loadingTypes } = useEquipmentTypes();
  const { mutate: promoteEquipment, isPending } = usePromoteToNetworkEquipment();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setEquipmentData({
        equipment_type_id: '',
        ip_address: '',
        snmp_community: 'public',
        snmp_version: 2,
        notes: '',
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!equipmentData.equipment_type_id) {
      newErrors.equipment_type_id = 'Equipment type is required';
    }

    if (!equipmentData.ip_address) {
      newErrors.ip_address = 'IP address is required';
    } else {
      // Basic IP validation
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(equipmentData.ip_address)) {
        newErrors.ip_address = 'Please enter a valid IP address';
      }
    }

    if (!equipmentData.snmp_community.trim()) {
      newErrors.snmp_community = 'SNMP community is required';
    }

    if (equipmentData.snmp_version < 1 || equipmentData.snmp_version > 3) {
      newErrors.snmp_version = 'SNMP version must be 1, 2, or 3';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inventoryItem) {
      toast({
        title: "Error",
        description: "No inventory item selected.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    promoteEquipment(
      {
        inventoryItemId: inventoryItem.id,
        equipmentData: equipmentData,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEquipmentData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Promote to Network Equipment</DialogTitle>
          {inventoryItem && (
            <p className="text-sm text-muted-foreground">
              Promoting: {inventoryItem.name || inventoryItem.type}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="equipment_type_id">Equipment Type *</Label>
            <Select
              value={equipmentData.equipment_type_id}
              onValueChange={(value) => handleInputChange('equipment_type_id', value)}
            >
              <SelectTrigger className={errors.equipment_type_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                {loadingTypes ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  equipmentTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.brand} {type.model})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.equipment_type_id && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.equipment_type_id}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="ip_address">IP Address *</Label>
            <Input
              type="text"
              id="ip_address"
              placeholder="192.168.1.1"
              value={equipmentData.ip_address}
              onChange={(e) => handleInputChange('ip_address', e.target.value)}
              className={errors.ip_address ? 'border-red-500' : ''}
            />
            {errors.ip_address && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.ip_address}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="snmp_community">SNMP Community *</Label>
            <Input
              type="text"
              id="snmp_community"
              value={equipmentData.snmp_community}
              onChange={(e) => handleInputChange('snmp_community', e.target.value)}
              className={errors.snmp_community ? 'border-red-500' : ''}
            />
            {errors.snmp_community && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.snmp_community}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="snmp_version">SNMP Version</Label>
            <Select
              value={equipmentData.snmp_version.toString()}
              onValueChange={(value) => handleInputChange('snmp_version', parseInt(value, 10))}
            >
              <SelectTrigger className={errors.snmp_version ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">SNMP v1</SelectItem>
                <SelectItem value="2">SNMP v2c</SelectItem>
                <SelectItem value="3">SNMP v3</SelectItem>
              </SelectContent>
            </Select>
            {errors.snmp_version && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.snmp_version}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this equipment..."
              value={equipmentData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || loadingTypes}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Promoting...
                </>
              ) : (
                'Promote to Equipment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteToEquipmentDialog;
