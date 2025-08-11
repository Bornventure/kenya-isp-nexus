
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, TrendingDown, ShoppingCart } from 'lucide-react';
import { useLowStockItems } from '@/hooks/useInventoryCategories';

interface InventoryLowStockOverviewProps {
  onViewLowStock: () => void;
}

const InventoryLowStockOverview: React.FC<InventoryLowStockOverviewProps> = ({ onViewLowStock }) => {
  const { data: lowStockItems = [], isLoading } = useLowStockItems();

  console.log('Low stock items in overview:', lowStockItems);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Stock Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockItems.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">Low Stock Alert</p>
                <p className="text-sm text-orange-700">
                  {lowStockItems.length} item(s) below minimum stock level
                </p>
              </div>
              <Badge variant="destructive">{lowStockItems.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name || item.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.manufacturer && `${item.manufacturer} - `}
                      Stock: {item.quantity_in_stock} / Min: {item.reorder_level}
                    </p>
                    <p className="text-xs text-red-600">
                      Need: {item.reorder_level - item.quantity_in_stock} more
                    </p>
                  </div>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
              ))}
              
              {lowStockItems.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{lowStockItems.length - 3} more items need restocking
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={onViewLowStock} className="flex-1" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View All Low Stock Items
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Package className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="font-medium text-green-600">All Stock Levels Good</p>
            <p className="text-sm text-muted-foreground">No items below minimum stock</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryLowStockOverview;
