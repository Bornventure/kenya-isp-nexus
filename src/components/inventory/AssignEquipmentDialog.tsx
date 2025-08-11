
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventoryItems, useAssignEquipmentToClient } from '@/hooks/useInventory';
import { Package, Router, Network } from 'lucide-react';

interface AssignEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

const AssignEquipmentDialog: React.FC<AssignEquipmentDialogProps> = ({
  open,
  onOpenChange,
  clientId,
  clientName,
}) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: availableEquipment = [] } = useInventoryItems({
    status: 'In Stock'
  });

  const { mutate: assignEquipment, isPending } = useAssignEquipmentToClient();

  // Filter equipment based on search and availability
  const filteredEquipment = availableEquipment.filter(item => 
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.model?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    !item.assigned_customer_id // Only show unassigned equipment
  );

  // Separate CPE and Network equipment
  const cpeEquipment = filteredEquipment.filter(item => item.category === 'CPE');
  const networkEquipment = filteredEquipment.filter(item => 
    item.category === 'Network Hardware' || item.is_network_equipment
  );

  const handleAssign = () => {
    if (!selectedEquipmentId) return;

    assignEquipment(
      { 
        itemId: selectedEquipmentId, 
        clientId, 
        clientName 
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedEquipmentId('');
          setSearchTerm('');
        },
      }
    );
  };

  const getEquipmentIcon = (category: string, isNetworkEquipment?: boolean) => {
    if (category === 'CPE') return <Package className="h-4 w-4" />;
    if (category === 'Network Hardware' || isNetworkEquipment) return <Network className="h-4 w-4" />;
    return <Router className="h-4 w-4" />;
  };

  const getEquipmentBadge = (category: string, isNetworkEquipment?: boolean) => {
    if (category === 'CPE') return <Badge variant="outline">CPE</Badge>;
    if (category === 'Network Hardware' || isNetworkEquipment) return <Badge variant="default">Network</Badge>;
    return <Badge variant="secondary">Other</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Equipment to {clientName}</DialogTitle>
          <DialogDescription>
            Select equipment to assign to this client. Network equipment will be fully integrated with RADIUS and monitoring systems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search Equipment</Label>
            <Input
              id="search"
              placeholder="Search by name, type, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <Label>Available Equipment</Label>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-2 space-y-2">
              {/* CPE Equipment Section */}
              {cpeEquipment.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Customer Premises Equipment (CPE)
                  </div>
                  {cpeEquipment.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedEquipmentId === item.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedEquipmentId(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getEquipmentIcon(item.category, item.is_network_equipment)}
                          <div>
                            <div className="font-medium">
                              {item.name || item.type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.manufacturer} {item.model}
                            </div>
                            {item.serial_number && (
                              <div className="text-xs text-muted-foreground font-mono">
                                SN: {item.serial_number}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getEquipmentBadge(item.category, item.is_network_equipment)}
                          <Badge variant="outline" className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Network Equipment Section */}
              {networkEquipment.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Network Equipment (Full Integration)
                  </div>
                  {networkEquipment.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedEquipmentId === item.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedEquipmentId(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getEquipmentIcon(item.category, item.is_network_equipment)}
                          <div>
                            <div className="font-medium">
                              {item.name || item.type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.manufacturer} {item.model}
                            </div>
                            {item.ip_address && (
                              <div className="text-xs text-muted-foreground font-mono">
                                IP: {item.ip_address}
                              </div>
                            )}
                            {item.serial_number && (
                              <div className="text-xs text-muted-foreground font-mono">
                                SN: {item.serial_number}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getEquipmentBadge(item.category, item.is_network_equipment)}
                          <Badge variant="outline" className="text-xs">
                            {item.status}
                          </Badge>
                          {item.is_network_equipment && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-Deploy
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredEquipment.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p>No available equipment found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedEquipmentId || isPending}
          >
            {isPending ? 'Assigning...' : 'Assign Equipment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEquipmentDialog;
