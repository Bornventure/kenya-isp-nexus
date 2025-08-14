
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Wifi, Router, Server, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const NetworkStatusPage = () => {
  const networkStatus = {
    overall: 'healthy',
    uptime: '99.8%',
    totalBandwidth: '1000 Mbps',
    usedBandwidth: '650 Mbps',
    activeConnections: 245
  };

  const services = [
    { name: 'Core Router', status: 'online', uptime: '99.9%', lastCheck: '2 minutes ago' },
    { name: 'RADIUS Server', status: 'online', uptime: '99.8%', lastCheck: '1 minute ago' },
    { name: 'DHCP Server', status: 'online', uptime: '100%', lastCheck: '30 seconds ago' },
    { name: 'DNS Server', status: 'warning', uptime: '98.5%', lastCheck: '5 minutes ago' },
    { name: 'Billing System', status: 'online', uptime: '99.7%', lastCheck: '1 minute ago' },
    { name: 'SMS Gateway', status: 'online', uptime: '99.9%', lastCheck: '30 seconds ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Status</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of network infrastructure and services
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStatus.uptime}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bandwidth</CardTitle>
            <Wifi className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStatus.totalBandwidth}</div>
            <p className="text-xs text-muted-foreground">Available capacity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Bandwidth</CardTitle>
            <Router className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStatus.usedBandwidth}</div>
            <p className="text-xs text-muted-foreground">65% utilization</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Server className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStatus.activeConnections}</div>
            <p className="text-xs text-muted-foreground">Client sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-600">
                      Last checked: {service.lastCheck}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{service.uptime}</div>
                    <div className="text-xs text-gray-500">Uptime</div>
                  </div>
                  
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Network Performance (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Performance charts will be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">
                Bandwidth usage, latency, and connection metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStatusPage;
