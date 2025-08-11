
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Package, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useLowStockItems } from '@/hooks/useInventoryCategories';

interface LowStockManagementProps {
  onViewItem: (itemId: string) => void;
  onBackToDashboard?: () => void;
}

const LowStockManagement: React.FC<LowStockManagementProps> = ({ 
  onViewItem, 
  onBackToDashboard 
}) => {
  const { data: lowStockItems = [], isLoading, error } = useLowStockItems();

  console.log('Low stock items in management:', lowStockItems);

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
            Please try again later
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {onBackToDashboard && (
        <Button variant="outline" onClick={onBackToDashboard} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Low Stock Items ({lowStockItems.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Items below minimum stock levels requiring immediate attention
          </p>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
                  <div className="flex-1">
                    <div className="font-medium">{item.name || item.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.category} {item.manufacturer && `- ${item.manufacturer}`} {item.model && `(${item.model})`}
                    </div>
                    <div className="text-sm mt-1 space-y-1">
                      <div>
                        <span className="text-gray-600">Current Stock: </span>
                        <span className="font-medium text-red-600">{item.quantity_in_stock}</span>
                        <span className="text-gray-600 ml-2">Required: </span>
                        <span className="font-medium">{item.reorder_level}</span>
                      </div>
                      <div className="text-sm text-red-600 font-medium">
                        ⚠️ Shortage: {item.reorder_level - item.quantity_in_stock} units needed
                      </div>
                    </div>
                    <Badge variant="destructive" className="mt-2">
                      Critical Low Stock
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewItem(item.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        // Navigate to inventory management
                        if (onBackToDashboard) {
                          onBackToDashboard();
                        }
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
                  These items require immediate restocking to avoid service disruptions. 
                  Priority should be given to network equipment (routers, ONTs) and customer-facing devices.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={onBackToDashboard}
                >
                  Go to Inventory Management
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium text-green-600">Excellent Stock Levels!</p>
              <p className="text-sm">All items are above minimum stock levels</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LowStockManagement;
