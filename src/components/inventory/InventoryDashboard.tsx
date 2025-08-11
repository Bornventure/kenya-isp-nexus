
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Eye,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { useInventoryStats } from '@/hooks/useInventory';
import InventoryLowStockOverview from './InventoryLowStockOverview';

interface InventoryDashboardProps {
  onFilterByStatus: (status: string) => void;
  onViewItem: (itemId: string) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ 
  onFilterByStatus, 
  onViewItem 
}) => {
  const { data: stats, isLoading } = useInventoryStats();

  const handleViewLowStock = () => {
    onFilterByStatus('low-stock');
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statusCards = [
    {
      title: 'Total Items',
      value: stats?.total || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => onFilterByStatus('')
    },
    {
      title: 'In Stock',
      value: stats?.in_stock || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => onFilterByStatus('In Stock')
    },
    {
      title: 'Deployed',
      value: stats?.deployed || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => onFilterByStatus('Deployed')
    },
    {
      title: 'Maintenance',
      value: stats?.maintenance || 0,
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => onFilterByStatus('Maintenance')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={card.action}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Breakdown and Low Stock */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Inventory by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.by_category && Object.entries(stats.by_category).length > 0 ? (
                Object.entries(stats.by_category).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{category}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">CPE</span>
                    <Badge variant="secondary">1</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Default categories shown - add inventory items to see actual data
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Overview */}
        <InventoryLowStockOverview onViewLowStock={handleViewLowStock} />
      </div>
    </div>
  );
};

export default InventoryDashboard;
