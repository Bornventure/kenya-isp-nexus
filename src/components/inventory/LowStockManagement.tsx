
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Package } from 'lucide-react';
import { useLowStockItems } from '@/hooks/useInventory';

interface LowStockManagementProps {
  onViewItem: (itemId: string) => void;
}

const LowStockManagement: React.FC<LowStockManagementProps> = ({ onViewItem }) => {
  const { data: lowStockItems = [], isLoading, error } = useLowStockItems();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
          <h3 className="text-lg font-medium mb-2">Error Loading Low Stock Items</h3>
          <p className="text-sm text-muted-foreground">
            {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Category: {item.category}
                    </div>
                    <Badge variant="destructive" className="mt-1">
                      Low Stock
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onViewItem(item.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No low stock items</p>
              <p className="text-sm">All items are well stocked</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LowStockManagement;
