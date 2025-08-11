
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { 
  Router, 
  Search, 
  TestTube, 
  Settings, 
  Plus, 
  Wifi, 
  WifiOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const MikrotikRoutersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    routers, 
    isLoading, 
    testConnection, 
    isTesting 
  } = useMikrotikRouters();

  const filteredRouters = routers.filter(router =>
    router.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    router.ip_address.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'testing': return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading MikroTik routers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Router className="h-6 w-6" />
          <h1 className="text-3xl font-bold">MikroTik Routers</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Router
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search routers by name or IP address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Router className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{routers.length}</div>
                <div className="text-sm text-gray-600">Total Routers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {routers.filter(r => r.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {routers.filter(r => r.connection_status === 'online').length}
                </div>
                <div className="text-sm text-gray-600">Online</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <WifiOff className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {routers.filter(r => r.connection_status === 'offline').length}
                </div>
                <div className="text-sm text-gray-600">Offline</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRouters.map((router) => (
          <Card key={router.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{router.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {getConnectionIcon(router.connection_status)}
                  <Badge 
                    variant="secondary"
                    className={`${getStatusColor(router.status)} text-white`}
                  >
                    {router.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="font-mono">{router.ip_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection:</span>
                  <span className={`capitalize ${
                    router.connection_status === 'online' ? 'text-green-600' : 
                    router.connection_status === 'offline' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {router.connection_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PPPoE Interface:</span>
                  <span className="font-mono">{router.pppoe_interface}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client Network:</span>
                  <span className="font-mono">{router.client_network}</span>
                </div>
              </div>

              {router.last_test_results && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Last Test Results:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(router.last_test_results).map(([test, result]) => (
                      <Badge 
                        key={test}
                        variant={result ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {test}: {result ? 'OK' : 'Failed'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection(router.id)}
                  disabled={isTesting}
                  className="flex-1"
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRouters.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No routers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No routers match your search criteria.' : 'No MikroTik routers have been added yet.'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add First Router
          </Button>
        </div>
      )}
    </div>
  );
};

export default MikrotikRoutersPage;
