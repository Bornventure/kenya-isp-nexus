
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, DollarSign, TrendingUp } from 'lucide-react';
import { ServicePackage } from '@/hooks/useServicePackages';

interface PackageStatsProps {
  packages: ServicePackage[];
}

const PackageStats: React.FC<PackageStatsProps> = ({ packages }) => {
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.is_active).length;
  const avgPrice = packages.length > 0 
    ? packages.reduce((sum, p) => sum + p.monthly_rate, 0) / packages.length 
    : 0;
  const priceRange = packages.length > 0 
    ? {
        min: Math.min(...packages.map(p => p.monthly_rate)),
        max: Math.max(...packages.map(p => p.monthly_rate))
      }
    : { min: 0, max: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPackages}</div>
          <p className="text-xs text-muted-foreground">
            {activePackages} active packages
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">KES {avgPrice.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            Monthly subscription
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Price Range</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            KES {priceRange.min} - {priceRange.max}
          </div>
          <p className="text-xs text-muted-foreground">
            Min to max pricing
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connection Types</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Fiber:</span>
              <span className="font-medium">
                {packages.filter(p => p.connection_types.includes('fiber')).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Wireless:</span>
              <span className="font-medium">
                {packages.filter(p => p.connection_types.includes('wireless')).length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageStats;
