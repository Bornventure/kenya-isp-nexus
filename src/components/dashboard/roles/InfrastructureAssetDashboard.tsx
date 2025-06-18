
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Laptop, 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Building2
} from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import { useInventory } from '@/hooks/useInventory';

const InfrastructureAssetDashboard = () => {
  const { data: equipment } = useEquipment();
  const { data: inventory } = useInventory();

  const totalAssets = (equipment?.length || 0) + (inventory?.length || 0);
  const deployedEquipment = equipment?.filter(e => e.status === 'active').length || 0;
  const maintenanceItems = equipment?.filter(e => e.status === 'maintenance').length || 0;
  const lowStockItems = inventory?.filter(i => i.quantity <= 5).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-teal-600" />
        <h1 className="text-3xl font-bold">Infrastructure & Asset Management Dashboard</h1>
      </div>

      {/* Asset Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-teal-600">{totalAssets}</p>
              </div>
              <Package className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deployed Equipment</p>
                <p className="text-2xl font-bold text-green-600">{deployedEquipment}</p>
              </div>
              <Laptop className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceItems}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-teal-600" />
            Equipment Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {equipment?.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-100">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'active' ? 'bg-green-500' :
                    item.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{item.model}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.type} • Serial: {item.serial_number}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={item.status === 'active' ? 'default' : 'secondary'}
                  className={item.status === 'active' ? 'bg-teal-100 text-teal-800 border-teal-200' : ''}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-teal-600" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventory?.filter(i => i.quantity <= 5).slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.category} • {item.manufacturer}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{item.quantity} left</p>
                  <Badge variant="destructive" className="bg-teal-100 text-red-800 border-red-200">
                    Low Stock
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              Upcoming Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">Router Firmware Update</p>
                  <p className="text-sm text-muted-foreground">Scheduled: Tomorrow</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                <Wrench className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Access Point Inspection</p>
                  <p className="text-sm text-muted-foreground">Scheduled: Next Week</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              Asset Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Operational Assets</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Asset Utilization</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InfrastructureAssetDashboard;
