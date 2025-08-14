
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useInventoryStats } from '@/hooks/useInventory';

interface InventoryDashboardProps {
  onFilterByStatus: (status: string) => void;
  onViewItem: (itemId: string) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  onFilterByStatus,
  onViewItem
}) => {
  const { data: stats, isLoading } = useInventoryStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      status: ''
    },
    {
      title: 'In Stock',
      value: stats?.inStock || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      status: 'In Stock'
    },
    {
      title: 'Deployed',
      value: stats?.deployed || 0,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      status: 'Deployed'
    },
    {
      title: 'Maintenance',
      value: stats?.maintenance || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      status: 'Maintenance'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onFilterByStatus(stat.status)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quick Actions</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onFilterByStatus('low-stock')}
            >
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <span>Low Stock Items</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onFilterByStatus('')}
            >
              <Package className="h-6 w-6 text-blue-500" />
              <span>All Inventory</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onFilterByStatus('Maintenance')}
            >
              <Activity className="h-6 w-6 text-red-500" />
              <span>Maintenance Items</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">NEW</Badge>
                <span className="text-sm">Router RT-001 added to inventory</span>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <Badge variant="destructive">DEPLOYED</Badge>
                <span className="text-sm">Switch SW-005 deployed to client</span>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline">MAINTENANCE</Badge>
                <span className="text-sm">ONT ONT-123 scheduled for maintenance</span>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
