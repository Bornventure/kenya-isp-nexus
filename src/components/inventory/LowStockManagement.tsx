
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Package, Plus, ShoppingCart } from 'lucide-react';
import { useLowStockItems } from '@/hooks/useInventoryCategories';

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
            Critical Stock Shortage Alert
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Essential ISP equipment categories below minimum stock levels
          </p>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.category_id} className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
                  <div className="flex-1">
                    <div className="font-medium">{item.category_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Current Stock: {item.current_stock} | Required: {item.minimum_stock_level}
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      Shortage: {item.stock_shortage} units
                    </div>
                    <Badge variant="destructive" className="mt-1">
                      Critical Low Stock
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewItem(item.category_id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        // Navigate to inventory with pre-filled category
                        window.location.href = `/inventory?category=${encodeURIComponent(item.category_name)}`;
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  <ShoppingCart className="h-4 w-4 inline mr-1" />
                  Recommended Action
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  These equipment categories are essential for ISP operations. Immediate restocking is recommended to avoid service disruptions.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = '/inventory'}
                >
                  Go to Inventory Management
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-green-600">Excellent Stock Levels!</p>
              <p className="text-sm">All essential ISP equipment categories are well stocked</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LowStockManagement;
