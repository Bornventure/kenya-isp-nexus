
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSuperAdminLicenseData } from '@/hooks/useSuperAdminLicenseData';
import { formatKenyanCurrency } from '@/utils/currencyFormat';
import { 
  Building2, 
  Users, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface LicenseDistributionData {
  count: number;
  totalClients: number;
  revenue: number;
  avgUsage: number;
}

interface LicenseDistribution {
  [key: string]: LicenseDistributionData;
}

const SuperAdminLicenseOverview = () => {
  const { data: licenseData, isLoading } = useSuperAdminLicenseData();

  if (isLoading || !licenseData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    totalCompanies,
    activeCompanies,
    totalClients,
    licenseDistribution,
    companiesNearLimit,
    revenueMetrics
  } = licenseData;

  // Type assertion to properly type the license distribution
  const typedLicenseDistribution = licenseDistribution as LicenseDistribution;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Companies
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {totalCompanies}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">{activeCompanies} active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Clients
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {totalClients.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Near Limit
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {companiesNearLimit}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Companies at 80%+ capacity
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatKenyanCurrency(revenueMetrics.monthly)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 text-sm text-green-600">
              +{revenueMetrics.growth}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* License Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            License Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(typedLicenseDistribution).map(([type, data]) => (
              <div key={type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{type}</span>
                  <Badge variant={type === 'enterprise' ? 'default' : 'secondary'}>
                    {data.count} companies
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>Total Clients: {data.totalClients.toLocaleString()}</div>
                  <div>Avg Usage: {data.avgUsage}%</div>
                  <div>Annual Revenue: {formatKenyanCurrency(data.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminLicenseOverview;
