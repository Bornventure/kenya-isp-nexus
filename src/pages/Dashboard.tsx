
import React from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ClientGrowthChart from '@/components/dashboard/ClientGrowthChart';
import NetworkStatusChart from '@/components/dashboard/NetworkStatusChart';
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
          value="1,247"
          change="+12% from last month"
          changeType="increase"
          icon={Users}
          description="Active internet subscribers"
        />
        <MetricCard
          title="Active Connections"
          value="1,198"
          change="96% uptime"
          changeType="increase"
          icon={Wifi}
          description="Currently connected clients"
        />
        <MetricCard
          title="Monthly Revenue"
          value="KES 2,847,500"
          change="+8.2% from last month"
          changeType="increase"
          icon={DollarSign}
          description="Current month earnings"
        />
        <MetricCard
          title="Outstanding Issues"
          value="23"
          change="-15% from yesterday"
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
            value="89"
            change="+23% vs previous month"
            changeType="increase"
            icon={UserCheck}
          />
          <MetricCard
            title="Network Performance"
            value="99.7%"
            change="Excellent uptime"
            changeType="increase"
            icon={Network}
          />
          <MetricCard
            title="Pending Payments"
            value="KES 456,200"
            change="47 invoices overdue"
            changeType="neutral"
            icon={CreditCard}
          />
          <MetricCard
            title="Growth Rate"
            value="15.3%"
            change="Year over year"
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
              All base stations operational. Average signal strength: 92%
            </p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
              View Details →
            </button>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">Recent Payments</h3>
            <p className="text-sm text-green-700 mb-3">
              KES 184,500 received today via M-Pesa and bank transfers
            </p>
            <button className="text-green-600 text-sm font-medium hover:text-green-800">
              View Payments →
            </button>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-medium text-amber-900 mb-2">Pending Tasks</h3>
            <p className="text-sm text-amber-700 mb-3">
              5 installations scheduled, 3 maintenance visits pending
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
