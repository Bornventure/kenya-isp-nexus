
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePromoteToNetworkEquipment } from '@/hooks/useInventory';
import { usePromoteToMikrotikRouter } from '@/hooks/usePromoteToMikrotikRouter';
import { useEquipmentTypes } from '@/hooks/useEquipmentTypes';
import { Loader2, Router, Network } from 'lucide-react';
import PromoteToMikrotikDialog from './PromoteToMikrotikDialog';

interface InventoryItem {
  id: string;
  item_id: string;
  name?: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  mac_address?: string;
}

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
  const [promotionType, setPromotionType] = useState<'equipment' | 'mikrotik' | null>(null);
  const [showMikrotikDialog, setShowMikrotikDialog] = useState(false);
  const [formData, setFormData] = useState({
    equipment_type_id: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: 2,
    notes: '',
  });

  const { mutate: promoteToEquipment, isPending: isPromotingEquipment } = usePromoteToNetworkEquipment();
  const { data: equipmentTypes = [], isLoading: typesLoading, error: typesError } = useEquipmentTypes();

  const handlePromotionTypeSelect = (type: 'equipment' | 'mikrotik') => {
    if (type === 'mikrotik') {
      setShowMikrotikDialog(true);
      onOpenChange(false);
    } else {
      setPromotionType(type);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventoryItem) return;

    console.log('Promoting item with data:', formData);
    promoteToEquipment(
      {
        inventoryItemId: inventoryItem.id,
        equipmentData: {
          ...formData,
          notes: formData.notes || `Promoted from inventory item ${inventoryItem.item_id}`,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setPromotionType(null);
          setFormData({
            equipment_type_id: '',
            ip_address: '',
            snmp_community: 'public',
            snmp_version: 2,
            notes: '',
          });
        },
      }
    );
  };

  const isMikrotikRouter = inventoryItem && 
    (inventoryItem.type?.toLowerCase().includes('router') || 
     inventoryItem.manufacturer?.toLowerCase().includes('mikrotik') ||
     inventoryItem.model?.toLowerCase().includes('mikrotik'));

  if (!inventoryItem) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promote to Network Equipment</DialogTitle>
          </DialogHeader>

          {!promotionType ? (
            <div className="space-y-6">
              {/* Current Item Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Current Inventory Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Item ID:</span> {inventoryItem.item_id}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {inventoryItem.type}
                    </div>
                    <div>
                      <span className="font-medium">Manufacturer:</span> {inventoryItem.manufacturer || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Model:</span> {inventoryItem.model || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Serial:</span> {inventoryItem.serial_number || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">MAC:</span> {inventoryItem.mac_address || 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promotion Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Select Promotion Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2"
                      onClick={() => handlePromotionTypeSelect('equipment')}
                    >
                      <Network className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-medium">Standard Equipment</div>
                        <div className="text-xs text-muted-foreground">General network equipment</div>
                      </div>
                    </Button>

                    <Button
                      variant={isMikrotikRouter ? "default" : "outline"}
                      className="h-24 flex flex-col items-center justify-center space-y-2"
                      onClick={() => handlePromotionTypeSelect('mikrotik')}
                    >
                      <Router className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-medium">MikroTik Router</div>
                        <div className="text-xs text-muted-foreground">
                          {isMikrotikRouter ? 'Recommended for this item' : 'Network router with full config'}
                        </div>
                      </div>
                    </Button>
                  </div>

                  {isMikrotikRouter && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <strong>Recommended:</strong> This item appears to be a MikroTik router. 
                        Promoting as a MikroTik Router will enable full network automation features 
                        including PPPoE server configuration, client management, and bandwidth control.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Item Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Current Inventory Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Item ID:</span> {inventoryItem.item_id}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {inventoryItem.type}
                    </div>
                    <div>
                      <span className="font-medium">Manufacturer:</span> {inventoryItem.manufacturer || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Model:</span> {inventoryItem.model || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Serial:</span> {inventoryItem.serial_number || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">MAC:</span> {inventoryItem.mac_address || 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Network Equipment Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment_type_id">Equipment Type</Label>
                    {typesError ? (
                      <div className="text-sm text-destructive p-2 border border-destructive rounded">
                        Error loading equipment types: {typesError.message}
                      </div>
                    ) : (
                      <Select 
                        value={formData.equipment_type_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_type_id: value }))}
                        disabled={typesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            typesLoading ? "Loading equipment types..." : "Select equipment type"
                          } />
                          {typesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </SelectTrigger>
                        <SelectContent>
                          {typesLoading ? (
                            <SelectItem value="loading" disabled>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading...
                            </SelectItem>
                          ) : equipmentTypes.length === 0 ? (
                            <SelectItem value="no-types" disabled>
                              No equipment types available
                            </SelectItem>
                          ) : (
                            equipmentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name} ({type.brand} {type.model})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ip_address">IP Address</Label>
                      <Input
                        id="ip_address"
                        value={formData.ip_address}
                        onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                        placeholder="192.168.1.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="snmp_community">SNMP Community</Label>
                      <Input
                        id="snmp_community"
                        value={formData.snmp_community}
                        onChange={(e) => setFormData(prev => ({ ...prev, snmp_community: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="snmp_version">SNMP Version</Label>
                    <Select 
                      value={formData.snmp_version.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, snmp_version: parseInt(value) }))}
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes for network equipment..."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setPromotionType(null)}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPromotingEquipment || !formData.equipment_type_id || typesLoading}
                >
                  {isPromotingEquipment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Promoting...
                    </>
                  ) : (
                    'Promote to Network Equipment'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <PromoteToMikrotikDialog
        open={showMikrotikDialog}
        onOpenChange={(open) => {
          setShowMikrotikDialog(open);
          if (!open) {
            onOpenChange(true);
          }
        }}
        inventoryItem={inventoryItem}
      />
    </>
  );
};

export default PromoteToEquipmentDialog;
