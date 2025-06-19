
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Package, 
  TrendingDown, 
  AlertTriangle,
  ShoppingCart,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';

const InfrastructureAssetDashboard = () => {
  const { equipment, isLoading } = useEquipment();

  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const deployedEquipment = equipment.filter(e => e.status === 'deployed').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;
  const totalValue = equipment.reduce((sum, e) => sum + (e.warranty_end_date ? 1000 : 0), 0); // Placeholder calculation

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wrench className="h-6 w-6 text-teal-600" />
        <h1 className="text-3xl font-bold">Infrastructure & Asset Management</h1>
      </div>

      {/* Asset Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Equipment</p>
                <p className="text-2xl font-bold text-teal-600">{availableEquipment}</p>
              </div>
              <Package className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deployed</p>
                <p className="text-2xl font-bold text-blue-600">{deployedEquipment}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceEquipment}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Asset Value</p>
                <p className="text-2xl font-bold text-green-600">KES {totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Equipment Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-teal-600" />
            Recent Equipment Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {equipment.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{item.brand} {item.model}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.type} • Serial: {item.serial_number}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={item.status === 'available' ? 'default' : 
                          item.status === 'deployed' ? 'secondary' : 'destructive'}
                  className={item.status === 'available' ? 'bg-teal-100 text-teal-800 border-teal-200' : ''}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Management Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-teal-600" />
            Asset Management Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Pending Deployments</p>
                <p className="text-sm text-muted-foreground">
                  {equipment.filter(e => e.approval_status === 'pending').length} items awaiting deployment
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">Maintenance Due</p>
                <p className="text-sm text-muted-foreground">
                  {maintenanceEquipment} items need attention
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Inventory Levels</p>
                <p className="text-sm text-muted-foreground">
                  {availableEquipment} items in stock
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfrastructureAssetDashboard;
