
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Download, 
  Upload,
  Globe,
  Smartphone,
  CreditCard,
  Calendar,
  MapPin
} from 'lucide-react';
import { useEnhancedClientAuth } from '@/contexts/EnhancedClientAuthContext';
import { formatDistanceToNow, format } from 'date-fns';

interface EnhancedClientDashboardProps {
  onTabChange: (tab: string) => void;
}

const EnhancedClientDashboard: React.FC<EnhancedClientDashboardProps> = ({ onTabChange }) => {
  const { client, connectionStatus, refreshConnectionStatus, refreshClientData } = useEnhancedClientAuth();
  const [dataUsage, setDataUsage] = useState({ used: 0, total: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      refreshConnectionStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshConnectionStatus]);

  useEffect(() => {
    if (client) {
      // Calculate data usage percentage (simulated for now)
      const usagePercentage = Math.min((dataUsage.used / dataUsage.total) * 100, 100);
      setDataUsage({
        used: Math.floor(Math.random() * 5000), // MB used this month
        total: 50000 // 50GB monthly allowance
      });
    }
  }, [client]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshClientData();
    await refreshConnectionStatus();
    setIsRefreshing(false);
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Loading Dashboard...</h3>
          <p className="text-muted-foreground">Please wait while we fetch your account information.</p>
        </div>
      </div>
    );
  }

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500 text-white"><Wifi className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary"><WifiOff className="h-3 w-3 mr-1" />Disconnected</Badge>;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'suspended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const dataUsagePercentage = (dataUsage.used / dataUsage.total) * 100;
  const daysUntilExpiry = client.subscription_end_date 
    ? Math.ceil((new Date(client.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {client.name}!</h1>
            <p className="opacity-90">
              Account Status: {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </p>
          </div>
          <div className="text-right">
            {getConnectionStatusBadge()}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                  connectionStatus === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <span className={`font-semibold ${getStatusColor()}`}>
                  {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </span>
              </div>
              {client.current_session && (
                <p className="text-sm text-muted-foreground">
                  Connected for {client.current_session.session_duration_minutes} minutes
                </p>
              )}
            </div>
            
            {client.current_session && (
              <>
                <div>
                  <p className="text-sm font-medium">IP Address</p>
                  <p className="text-sm text-muted-foreground">{client.current_session.ip_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Session Start</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(client.current_session.session_start), 'MMM dd, HH:mm')}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Wallet Balance</p>
                <p className="text-2xl font-bold">KES {client.wallet_balance?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Monthly Rate</p>
                <p className="text-2xl font-bold">KES {client.monthly_rate?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Days Remaining</p>
                <p className="text-2xl font-bold">{daysUntilExpiry > 0 ? daysUntilExpiry : 'Expired'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Service Package</p>
                <p className="text-lg font-bold">{client.service_package?.name || 'Standard'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {(dataUsage.used / 1000).toFixed(1)} GB / {(dataUsage.total / 1000).toFixed(0)} GB
              </span>
              <span className="text-sm text-muted-foreground">
                {dataUsagePercentage.toFixed(1)}% used
              </span>
            </div>
            <Progress value={dataUsagePercentage} className="h-2" />
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Download: {(dataUsage.used * 0.7 / 1000).toFixed(1)} GB</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-500" />
                <span className="text-sm">Upload: {(dataUsage.used * 0.3 / 1000).toFixed(1)} GB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Installation Date</p>
                <p className="text-sm text-muted-foreground">
                  {client.installation_date 
                    ? format(new Date(client.installation_date), 'PPP')
                    : 'Pending installation'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Service Activated</p>
                <p className="text-sm text-muted-foreground">
                  {client.service_activated_at
                    ? formatDistanceToNow(new Date(client.service_activated_at), { addSuffix: true })
                    : 'Not activated'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Subscription Type</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {client.subscription_type}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Service Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {client.location.address}<br/>
                    {client.location.sub_county}, {client.location.county}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Contact Information</p>
                <p className="text-sm text-muted-foreground">
                  Phone: {client.phone}<br/>
                  Email: {client.email}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => onTabChange('wallet')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <CreditCard className="h-5 w-5" />
              Top Up Wallet
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onTabChange('invoices')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Clock className="h-5 w-5" />
              View Invoices
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onTabChange('support')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Smartphone className="h-5 w-5" />
              Get Support
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onTabChange('profile')}
              className="flex flex-col items-center gap-2 h-20"
            >
              <Activity className="h-5 w-5" />
              Manage Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(daysUntilExpiry <= 3 && daysUntilExpiry > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">Service Expiry Warning</p>
                <p className="text-sm text-amber-700">
                  Your service will expire in {daysUntilExpiry} days. Please renew to avoid service interruption.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => onTabChange('wallet')}
                className="ml-auto"
              >
                Renew Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedClientDashboard;
