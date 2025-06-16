
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Laptop,
  Router,
  AlertTriangle,
  Plus,
  Eye,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { useInventoryStats, useInventoryItems, useLowStockItems } from '@/hooks/useInventory';
import AddInventoryItemDialog from './AddInventoryItemDialog';
import { useState } from 'react';

interface InventoryDashboardProps {
  onFilterByStatus: (status: string) => void;
  onViewItem: (itemId: string) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  onFilterByStatus,
  onViewItem,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: recentItems } = useInventoryItems();
  const { data: lowStockItems } = useLowStockItems();

  const metricCards = [
    {
      title: 'Total Assets',
      value: stats?.total || 0,
      icon: Package,
      onClick: () => onFilterByStatus(''),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Items In Stock',
      value: stats?.inStock || 0,
      icon: Package,
      onClick: () => onFilterByStatus('In Stock'),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Deployed Equipment',
      value: stats?.deployed || 0,
      icon: Router,
      onClick: () => onFilterByStatus('Deployed'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'In Maintenance',
      value: stats?.maintenance || 0,
      icon: Wrench,
      onClick: () => onFilterByStatus('Maintenance'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
        <Button variant="outline" onClick={() => onFilterByStatus('')}>
          <Eye className="h-4 w-4 mr-2" />
          View Full Inventory
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card 
            key={metric.title} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={metric.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <span className="font-medium">{item.name || item.model}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Stock: {item.quantity_in_stock} / Reorder Level: {item.reorder_level}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewItem(item.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  And {lowStockItems.length - 3} more items...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentItems?.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.name || item.model}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.item_id} • {item.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.status}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewItem(item.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  No items found. Add your first inventory item to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.byCategory && Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  No categories available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddInventoryItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default InventoryDashboard;
