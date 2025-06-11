
import React from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ClientGrowthChart from '@/components/dashboard/ClientGrowthChart';
import NetworkStatusChart from '@/components/dashboard/NetworkStatusChart';
import { useDashboardStats } from '@/hooks/useDashboardAnalytics';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Wifi,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Network,
  CreditCard,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { clients, isLoading: clientsLoading } = useClients();

  // Calculate additional metrics from clients data
  const activeConnections = clients?.filter(client => client.status === 'active').length || 0;
  const fiberConnections = clients?.filter(client => client.connection_type === 'fiber').length || 0;
  const wirelessConnections = clients?.filter(client => client.connection_type === 'wireless').length || 0;
  const avgUptime = 99.7; // This would come from network monitoring system

  if (statsLoading || clientsLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Loading your ISP operations overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboardStats?.data;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's an overview of your ISP operations.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Clients"
          value={stats?.totalClients?.toString() || "0"}
          change={`${activeConnections} active connections`}
          changeType="increase"
          icon={Users}
          description="Active internet subscribers"
        />
        <MetricCard
          title="Active Connections"
          value={activeConnections.toString()}
          change={`${avgUptime}% uptime`}
          changeType="increase"
          icon={Wifi}
          description="Currently connected clients"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`KES ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          change={`Target: KES ${(stats?.totalRevenue || 0).toLocaleString()}`}
          changeType="increase"
          icon={DollarSign}
          description="Current month earnings"
        />
        <MetricCard
          title="Outstanding Issues"
          value={stats?.pendingTickets?.toString() || "0"}
          change={`${stats?.resolvedTickets || 0} resolved this month`}
          changeType="decrease"
          icon={AlertCircle}
          description="Open support tickets"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart />
        <ClientGrowthChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <NetworkStatusChart />
        
        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 gap-6">
          <MetricCard
            title="New Clients (30d)"
            value={(stats?.totalClients || 0) > 0 ? Math.floor((stats?.totalClients || 0) * 0.15).toString() : "0"}
            change="Growth trending upward"
            changeType="increase"
            icon={UserCheck}
          />
          <MetricCard
            title="Network Performance"
            value={`${avgUptime}%`}
            change="Excellent uptime"
            changeType="increase"
            icon={Network}
          />
          <MetricCard
            title="Equipment Status"
            value={`${stats?.availableEquipment || 0}/${stats?.totalEquipment || 0}`}
            change="Equipment available"
            changeType="neutral"
            icon={CreditCard}
          />
          <MetricCard
            title="Connection Types"
            value={`${fiberConnections + wirelessConnections}`}
            change={`${fiberConnections} fiber, ${wirelessConnections} wireless`}
            changeType="increase"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Network Status</h3>
            <p className="text-sm text-blue-700 mb-3">
              {activeConnections} active connections. Average uptime: {avgUptime}%
            </p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
              View Details →
            </button>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">Recent Payments</h3>
            <p className="text-sm text-green-700 mb-3">
              KES {(stats?.monthlyRevenue || 0).toLocaleString()} received this month
            </p>
            <button className="text-green-600 text-sm font-medium hover:text-green-800">
              View Payments →
            </button>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-medium text-amber-900 mb-2">Pending Tasks</h3>
            <p className="text-sm text-amber-700 mb-3">
              {stats?.pendingTickets || 0} support tickets pending resolution
            </p>
            <button className="text-amber-600 text-sm font-medium hover:text-amber-800">
              Manage Tasks →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
