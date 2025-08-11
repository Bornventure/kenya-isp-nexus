
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Network,
  Server,
  Router,
  Wifi,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react';
import AddSNMPDeviceDialog from '@/components/network/AddSNMPDeviceDialog';

interface NetworkDevice {
  id: string;
  name: string;
  ipAddress: string;
  type: string;
  status: 'active' | 'pending' | 'inactive';
  lastSeen: string;
  uptime?: string;
  bandwidth?: string;
  location?: string;
}

interface InfrastructureStats {
  totalDevices: number;
  activeDevices: number;
  criticalAlerts: number;
  totalBandwidth: string;
  networkUptime: string;
}

const RealNetworkInfrastructureManager: React.FC = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [stats, setStats] = useState<InfrastructureStats>({
    totalDevices: 0,
    activeDevices: 0,
    criticalAlerts: 0,
    totalBandwidth: '0 Gbps',
    networkUptime: '99.9%'
  });
  
  const { toast } = useToast();

  // Simulate loading network infrastructure data
  useEffect(() => {
    const loadInfrastructureData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockDevices: NetworkDevice[] = [
        {
          id: '1',
          name: 'Core Router - Main',
          ipAddress: '192.168.1.1',
          type: 'Router',
          status: 'active' as const,
          lastSeen: '2 minutes ago',
          uptime: '45 days',
          bandwidth: '10 Gbps',
          location: 'Data Center A'
        },
        {
          id: '2',
          name: 'Distribution Switch 1',
          ipAddress: '192.168.1.10',
          type: 'Switch',
          status: 'active' as const,
          lastSeen: '1 minute ago',
          uptime: '30 days',
          bandwidth: '1 Gbps',
          location: 'Building 1'
        },
        {
          id: '3',
          name: 'Access Point - Floor 2',
          ipAddress: '192.168.2.50',
          type: 'Access Point',
          status: 'pending' as const,
          lastSeen: '15 minutes ago',
          uptime: '2 days',
          bandwidth: '300 Mbps',
          location: 'Floor 2, Building 1'
        },
        {
          id: '4',
          name: 'Firewall - Main',
          ipAddress: '192.168.1.2',
          type: 'Firewall',
          status: 'active' as const,
          lastSeen: '30 seconds ago',
          uptime: '60 days',
          bandwidth: '5 Gbps',
          location: 'Data Center A'
        },
        {
          id: '5',
          name: 'Core Switch - Backup',
          ipAddress: '192.168.1.11',
          type: 'Switch',
          status: 'inactive' as const,
          lastSeen: '2 hours ago',
          uptime: '0 days',
          bandwidth: '10 Gbps',
          location: 'Data Center B'
        }
      ];

      setDevices(mockDevices);
      
      // Calculate stats
      const activeCount = mockDevices.filter(d => d.status === 'active').length;
      const criticalCount = mockDevices.filter(d => d.status === 'inactive').length;
      
      setStats({
        totalDevices: mockDevices.length,
        activeDevices: activeCount,
        criticalAlerts: criticalCount,
        totalBandwidth: '26.3 Gbps',
        networkUptime: '99.9%'
      });
      
      setLoading(false);
    };

    loadInfrastructureData();
  }, []);

  // Filter devices based on search and filters
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.ipAddress.includes(searchTerm) ||
                         device.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    const matchesType = typeFilter === 'all' || device.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'router': return <Router className="h-5 w-5" />;
      case 'switch': return <Network className="h-5 w-5" />;
      case 'access point': return <Wifi className="h-5 w-5" />;
      case 'firewall': return <Shield className="h-5 w-5" />;
      case 'server': return <Server className="h-5 w-5" />;
      default: return <Network className="h-5 w-5" />;
    }
  };

  const handleDeviceAction = (deviceId: string, action: string) => {
    toast({
      title: "Action Performed",
      description: `${action} performed on device ${deviceId}`,
    });
  };

  const handleAddDevice = async (ipAddress: string, community: string, version: number) => {
    console.log('Adding SNMP device:', { ipAddress, community, version });
    
    // Simulate device addition
    const newDevice: NetworkDevice = {
      id: Date.now().toString(),
      name: `New Device - ${ipAddress}`,
      ipAddress,
      type: 'Unknown',
      status: 'pending' as const,
      lastSeen: 'Just now',
      uptime: '0 minutes'
    };

    setDevices(prev => [...prev, newDevice]);
    
    toast({
      title: "Device Added",
      description: `SNMP device ${ipAddress} has been added to monitoring.`,
    });
  };

  const handleTestConnection = async (ip: string, community?: string, version?: number) => {
    console.log('Testing connection to:', { ip, community, version });
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Connection Test",
      description: `Connection to ${ip} was successful.`,
    });
    
    return true;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Network Infrastructure</h2>
          <div className="animate-pulse">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Network Infrastructure Manager</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDevice(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Infrastructure Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{stats.totalDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Bandwidth</p>
                <p className="text-2xl font-bold">{stats.totalBandwidth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{stats.networkUptime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices by name, IP, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Router">Router</SelectItem>
                <SelectItem value="Switch">Switch</SelectItem>
                <SelectItem value="Access Point">Access Point</SelectItem>
                <SelectItem value="Firewall">Firewall</SelectItem>
                <SelectItem value="Server">Server</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <Card key={device.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(device.type)}
                  <div>
                    <h3 className="font-semibold text-sm">{device.name}</h3>
                    <p className="text-xs text-muted-foreground">{device.ipAddress}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${getStatusColor(device.status)}`}>
                  {device.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{device.type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Seen:</span>
                  <span>{device.lastSeen}</span>
                </div>
                
                {device.uptime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span>{device.uptime}</span>
                  </div>
                )}
                
                {device.bandwidth && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bandwidth:</span>
                    <span>{device.bandwidth}</span>
                  </div>
                )}
                
                {device.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-right text-xs">{device.location}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDeviceAction(device.id, 'Configure')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDeviceAction(device.id, 'Monitor')}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Devices Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No devices match your current filters.'
                : 'No network devices are currently configured.'}
            </p>
            <Button onClick={() => setShowAddDevice(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Device
            </Button>
          </CardContent>
        </Card>
      )}

      <AddSNMPDeviceDialog
        open={showAddDevice}
        onOpenChange={setShowAddDevice}
        onAddDevice={handleAddDevice}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
};

export default RealNetworkInfrastructureManager;
