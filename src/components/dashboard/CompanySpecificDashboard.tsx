
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats, useRevenueData, useClientGrowthData, useTicketAnalytics } from '@/hooks/useDashboardAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Users, DollarSign, Router, AlertTriangle, TrendingUp, Wifi, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const CompanySpecificDashboard = () => {
  const { profile } = useAuth();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData(6);
  const { data: clientGrowthData, isLoading: growthLoading } = useClientGrowthData(6);
  const { data: ticketAnalytics, isLoading: ticketsLoading } = useTicketAnalytics();

  if (!profile?.isp_company_id) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please ensure you're logged in with a valid ISP company account.</p>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, loading }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-2" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {change !== undefined && (
          <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  const NetworkStatusCard = ({ loading }: { loading: boolean }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Network Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Routers</span>
              <Badge variant="default">{dashboardStats?.network?.activeRouters || 0}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Network Uptime</span>
                <span className="text-sm font-medium">
                  {dashboardStats?.network?.uptime || '99.5%'}
                </span>
              </div>
              <Progress value={parseFloat(dashboardStats?.network?.uptime?.replace('%', '') || '99.5')} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Sessions</span>
              <Badge variant="outline">{dashboardStats?.network?.activeSessions || 0}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const RevenueChart = () => (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        {revenueLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`KES ${value?.toLocaleString()}`, 'Revenue']} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  const ClientGrowthChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Client Growth</CardTitle>
      </CardHeader>
      <CardContent>
        {growthLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={clientGrowthData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="newClients" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  const TicketStatusChart = () => {
    const ticketData = [
      { name: 'Open', value: ticketAnalytics?.open || 0, color: '#ef4444' },
      { name: 'In Progress', value: ticketAnalytics?.inProgress || 0, color: '#f59e0b' },
      { name: 'Resolved', value: ticketAnalytics?.resolved || 0, color: '#10b981' },
      { name: 'Closed', value: ticketAnalytics?.closed || 0, color: '#6b7280' }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ticketData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {ticketData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Company Info Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{profile.company_name || 'ISP Dashboard'}</h2>
          <p className="text-muted-foreground">Real-time metrics for your ISP operations</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Company ID: {profile.isp_company_id.substring(0, 8)}...
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={dashboardStats?.totalClients || 0}
          icon={Users}
          change={dashboardStats?.clientGrowth}
          loading={statsLoading}
        />
        <StatCard
          title="Monthly Revenue"
          value={`KES ${dashboardStats?.monthlyRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          change={dashboardStats?.revenueGrowth}
          loading={statsLoading}
        />
        <StatCard
          title="Active Connections"
          value={dashboardStats?.activeConnections || 0}
          icon={Wifi}
          change={dashboardStats?.connectionGrowth}
          loading={statsLoading}
        />
        <StatCard
          title="Network Devices"
          value={dashboardStats?.totalRouters || 0}
          icon={Router}
          loading={statsLoading}
        />
      </div>

      {/* Network Status and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NetworkStatusCard loading={statsLoading} />
        <RevenueChart />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientGrowthChart />
        <TicketStatusChart />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardStats?.recentActivity?.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{activity.description}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySpecificDashboard;
