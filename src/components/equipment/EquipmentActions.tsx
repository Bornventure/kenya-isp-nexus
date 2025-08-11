
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Router, Package, Wifi, HardDrive, Plus, TestTube, Settings } from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import { useInventoryItems } from '@/hooks/useInventory';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';

interface UnifiedEquipment {
  id: string;
  name?: string;
  model?: string;
  type: string;
  status: string;
  ip_address?: string;
  notes?: string;
  equipment_type: string;
  brand?: string;
  connection_status?: string;
}

const EquipmentActions = () => {
  const { equipment, isLoading: equipmentLoading } = useEquipment();
  const { data: inventoryItems = [], isLoading: inventoryLoading } = useInventoryItems({
    category: 'Network Hardware'
  });
  const { routers, isLoading: routersLoading, testConnection } = useMikrotikRouters();

  const getEquipmentIcon = (type: string) => {
    if (type?.toLowerCase().includes('router') || type?.toLowerCase().includes('mikrotik')) {
      return <Router className="h-6 w-6 text-blue-600" />;
    }
    if (type?.toLowerCase().includes('switch')) {
      return <Package className="h-6 w-6 text-green-600" />;
    }
    if (type?.toLowerCase().includes('access point') || type?.toLowerCase().includes('wifi')) {
      return <Wifi className="h-6 w-6 text-purple-600" />;
    }
    return <HardDrive className="h-6 w-6 text-gray-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (equipmentLoading || inventoryLoading || routersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading equipment...</div>
        </CardContent>
      </Card>
    );
  }

  // Unify all equipment types
  const allEquipment: UnifiedEquipment[] = [
    ...equipment.map(item => ({
      id: item.id,
      name: item.model || item.type,
      model: item.model,
      type: item.type,
      status: item.status,
      ip_address: item.ip_address?.toString(),
      notes: item.notes,
      equipment_type: 'Equipment',
      brand: item.brand
    })),
    ...routers.map(router => ({
      id: router.id,
      name: router.name,
      model: router.name,
      type: 'MikroTik Router',
      status: router.connection_status,
      ip_address: router.ip_address,
      notes: `Interface: ${router.pppoe_interface}`,
      equipment_type: 'Router',
      connection_status: router.connection_status
    })),
    ...inventoryItems.filter(item => item.is_network_equipment).map(item => ({
      id: item.id,
      name: item.name || item.model,
      model: item.model,
      type: item.type,
      status: item.status,
      notes: `Inventory: ${item.item_id}`,
      equipment_type: 'Network Hardware',
      brand: item.manufacturer
    }))
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{allEquipment.length}</div>
                    <div className="text-sm text-muted-foreground">Total Equipment</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Router className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{routers.length}</div>
                    <div className="text-sm text-muted-foreground">MikroTik Routers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Wifi className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {allEquipment.filter(item => item.status === 'online' || item.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Online</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Equipment List</h3>
            {allEquipment.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Equipment Found</h3>
                <p className="text-gray-500 mb-4">
                  Add equipment through the MikroTik Routers tab or promote inventory items.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {allEquipment.map((item) => (
                  <Card key={`${item.equipment_type}-${item.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getEquipmentIcon(item.type)}
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              {item.type} • {item.equipment_type}
                            </div>
                            {item.ip_address && (
                              <div className="text-xs text-muted-foreground">
                                IP: {item.ip_address}
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          {item.equipment_type === 'Router' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testConnection(item.id)}
                            >
                              <TestTube className="h-4 w-4 mr-1" />
                              Test
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentActions;
