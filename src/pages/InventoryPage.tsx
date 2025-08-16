
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

const InventoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Track equipment and component inventory
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Inventory Management
          </CardTitle>
          <CardDescription>
            Monitor stock levels and equipment availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Inventory management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPage;
