
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useRevenueData, useClientGrowthData, useTicketAnalytics } from '@/hooks/useDashboardAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsCard from './StatsCard';
import RevenueChart from './RevenueChart';
import ClientGrowthChart from './ClientGrowthChart';
import SupportStats from '@/components/support/SupportStats';
import {
  Users,
  DollarSign,
  Wifi,
  AlertCircle,
  TrendingUp,
  Building,
  Shield,
  Activity
} from 'lucide-react';

const CompanySpecificDashboard = () => {
  const { profile } = useAuth();
  
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData();
  const { data: clientGrowthData, isLoading: growthLoading } = useClientGrowthData();
  const { data: ticketData, isLoading: ticketLoading } = useTicketAnalytics();

  if (!profile?.isp_company_id) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <span>No company information available.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = dashboardStats || {
    totalClients: 0,
    activeClients: 0,
    suspendedClients: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    activeHotspots: 0,
    pendingTickets: 0,
    activeEquipment: 0
  };

  const getStatusColor = () => {
    if (profile?.isp_companies?.is_active === false) return 'destructive';
    return 'default';
  };

  const getStatusText = () => {
    if (profile?.isp_companies?.is_active === false) {
      return `Deactivated: ${profile.isp_companies.deactivation_reason || 'Contact support'}`;
    }
    return 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Company Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-semibold">{profile.isp_companies?.name || 'ISP Company'}</h2>
            <p className="text-sm text-muted-foreground">
              License: {profile.isp_companies?.license_type || 'Unknown'}
            </p>
          </div>
        </div>
        <Badge variant={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Clients"
          value={stats.totalClients?.toString() || '0'}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`KES ${stats.monthlyRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Active Hotspots"
          value={stats.activeHotspots?.toString() || '0'}
          icon={Wifi}
          trend={{ value: 2, isPositive: true }}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Open Tickets"
          value={stats.pendingTickets?.toString() || '0'}
          icon={AlertCircle}
          trend={{ value: 5, isPositive: false }}
          isLoading={statsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart 
          data={Array.isArray(revenueData?.data) ? revenueData.data : []} 
          isLoading={revenueLoading} 
        />
        <ClientGrowthChart 
          data={Array.isArray(clientGrowthData?.data) ? clientGrowthData.data : []} 
          isLoading={growthLoading} 
        />
      </div>

      {/* Support and System Health */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Support Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SupportStats
              openTickets={ticketData?.data?.open || 0}
              inProgressTickets={ticketData?.data?.inProgress || 0}
              resolvedTickets={ticketData?.data?.resolved || 0}
              closedTickets={ticketData?.data?.closed || 0}
              isLoading={ticketLoading}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Equipment</span>
                <Badge variant="secondary">{stats.activeEquipment || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Network Uptime</span>
                <Badge variant="default">99.9%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">System Status</span>
                <Badge variant="default">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySpecificDashboard;
