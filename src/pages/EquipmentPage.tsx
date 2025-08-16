
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const EquipmentPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
        <p className="text-muted-foreground">
          Manage network equipment and inventory
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Equipment Management
          </CardTitle>
          <CardDescription>
            Track and manage network equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Equipment management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentPage;
