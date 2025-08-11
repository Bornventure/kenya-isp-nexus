
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import { useInventoryStats, useInventoryItems, useLowStockItems } from '@/hooks/useInventory';

interface InventoryDashboardProps {
  onFilterByStatus: (status: string) => void;
  onViewItem: (itemId: string) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  onFilterByStatus,
  onViewItem,
}) => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useInventoryStats();
  const { data: recentItems = [], isLoading: itemsLoading, error: itemsError } = useInventoryItems({});
  const { data: lowStockItems = [], isLoading: lowStockLoading, error: lowStockError } = useLowStockItems();

  const isLoading = statsLoading || itemsLoading || lowStockLoading;
  const hasError = statsError || itemsError || lowStockError;

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {statsError?.message || itemsError?.message || lowStockError?.message}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Refresh Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-16 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalItems = stats?.total || 0;
  const inStockItems = stats?.in_stock || 0;
  const deployedItems = stats?.deployed || 0;
  const maintenanceItems = stats?.maintenance || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onFilterByStatus('')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">All inventory items</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onFilterByStatus('In Stock')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inStockItems}</div>
            <p className="text-xs text-muted-foreground">Available items</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onFilterByStatus('Deployed')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deployedItems}</div>
            <p className="text-xs text-muted-foreground">Items in use</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onFilterByStatus('Maintenance')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{maintenanceItems}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Items</CardTitle>
          </CardHeader>
          <CardContent>
            {recentItems.length > 0 ? (
              <div className="space-y-4">
                {recentItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.name || item.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.manufacturer} {item.model}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'In Stock' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => onViewItem(item.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No inventory items found</p>
                <p className="text-sm">Add items to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
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
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg border-orange-200 bg-orange-50">
                    <div className="flex-1">
                      <div className="font-medium">{item.name || item.type}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {item.quantity_in_stock} / Reorder at: {item.reorder_level}
                      </div>
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

      {/* Category Breakdown */}
      {stats?.by_category && Object.keys(stats.by_category).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.by_category).map(([category, count]) => (
                <div key={category} className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onFilterByStatus('')}>
                  <div className="text-2xl font-bold">{String(count)}</div>
                  <div className="text-sm text-muted-foreground">{category}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryDashboard;
