
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNetworkEquipment } from '@/hooks/useNetworkEquipment';
import { Loader2, Network, Wifi } from 'lucide-react';

const NetworkEquipmentList = () => {
  const { equipment, isLoading, error } = useNetworkEquipment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        Error loading network equipment: {error.message}
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Network Equipment</h3>
          <p className="text-muted-foreground">
            Promote inventory items to create network equipment entries.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Wifi className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Network Equipment</h2>
        <Badge variant="secondary">{equipment.length}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {item.name}
                <Badge 
                  variant={item.status === 'active' ? 'default' : 'secondary'}
                >
                  {item.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.equipment_types && (
                <div className="text-sm">
                  <span className="font-medium">Type:</span> {item.equipment_types.brand} {item.equipment_types.model}
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium">IP:</span> {item.ip_address}
              </div>
              <div className="text-sm">
                <span className="font-medium">SNMP:</span> v{item.snmp_version} ({item.snmp_community})
              </div>
              {item.notes && (
                <div className="text-xs text-muted-foreground mt-2">
                  {item.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NetworkEquipmentList;
