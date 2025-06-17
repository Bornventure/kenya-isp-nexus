
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, CheckCircle, Network, Package } from 'lucide-react';
import { useInventoryItems, useAssignInventoryToClient } from '@/hooks/useInventory';
import { useEquipment } from '@/hooks/useEquipment';

interface UnifiedEquipmentAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

const UnifiedEquipmentAssignmentDialog: React.FC<UnifiedEquipmentAssignmentDialogProps> = ({
  open,
  onOpenChange,
  clientId,
  clientName,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('cpe');
  const { mutate: assignEquipment, isPending } = useAssignInventoryToClient();
  
  // Get CPE items from inventory (customer equipment)
  const { data: cpeItems, isLoading: isLoadingCPE } = useInventoryItems({
    category: 'CPE',
    status: 'In Stock',
    search: search || undefined,
  });

  // Get approved network equipment
  const { equipment, isLoading: isLoadingEquipment } = useEquipment();
  const networkEquipment = equipment.filter(item => 
    item.approval_status === 'approved' && 
    item.status === 'active' &&
    !item.client_id &&
    (search === '' || 
     item.type.toLowerCase().includes(search.toLowerCase()) ||
     item.model?.toLowerCase().includes(search.toLowerCase()) ||
     item.serial_number.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAssign = (itemId: string, equipmentType: 'inventory' | 'equipment') => {
    assignEquipment(
      { itemId, clientId, equipmentType },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSearch('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[700px]">
        <DialogHeader>
          <DialogTitle>Assign Equipment to {clientName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Equipment Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cpe" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Customer Equipment (CPE)
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Network Equipment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cpe" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Customer premises equipment (routers, modems, etc.) from inventory
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {isLoadingCPE ? (
                  <div className="p-6 text-center">Loading CPE equipment...</div>
                ) : cpeItems && cpeItems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cpeItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.item_id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.type}</div>
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {item.manufacturer && (
                                <div className="text-xs text-muted-foreground">
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
                            <Badge variant="secondary">{item.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleAssign(item.id, 'inventory')}
                              disabled={isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>No available CPE equipment found</p>
                    <p className="text-sm">Add CPE equipment to inventory first</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Approved network infrastructure equipment with SNMP management
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {isLoadingEquipment ? (
                  <div className="p-6 text-center">Loading network equipment...</div>
                ) : networkEquipment.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Brand/Model</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {networkEquipment.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.type}</div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.brand} {item.model}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.serial_number}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.ip_address || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{item.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleAssign(item.id, 'equipment')}
                              disabled={isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>No available network equipment found</p>
                    <p className="text-sm">Promote inventory items to network equipment or add new equipment</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedEquipmentAssignmentDialog;
