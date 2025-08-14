
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Router, Wifi, Activity, Settings, TestTube, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useProductionNetworkManagement } from '@/hooks/useProductionNetworkManagement';
import AddRouterDialog from '@/components/network/AddRouterDialog';
import EditRouterDialog from '@/components/network/EditRouterDialog';
import NetworkDiagnosticsPanel from '@/components/network/NetworkDiagnosticsPanel';

const NetworkManagement = () => {
  const { 
    routers, 
    isLoading, 
    createRouter, 
    updateRouter, 
    deleteRouter, 
    testConnection,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting
  } = useMikrotikRouters();

  const { 
    agents, 
    deviceStatuses, 
    networkMetrics,
    agentsLoading,
    devicesLoading,
    metricsLoading
  } = useProductionNetworkManagement();

  const [showAddRouter, setShowAddRouter] = useState(false);
  const [showEditRouter, setShowEditRouter] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<any>(null);

  const handleTestConnection = (routerId: string) => {
    testConnection(routerId);
  };

  const handleEditRouter = (router: any) => {
    setSelectedRouter(router);
    setShowEditRouter(true);
  };

  const handleDeleteRouter = (routerId: string) => {
    if (window.confirm('Are you sure you want to delete this router?')) {
      deleteRouter(routerId);
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'offline': return 'destructive';
      case 'testing': return 'secondary';
      default: return 'outline';
    }
  };

  const getRouterStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'inactive': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Management</h1>
          <p className="text-muted-foreground">
            Manage your MikroTik routers, network devices, and monitoring
          </p>
        </div>
        <Button onClick={() => setShowAddRouter(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Router
        </Button>
      </div>

      <Tabs defaultValue="routers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routers">MikroTik Routers</TabsTrigger>
          <TabsTrigger value="monitoring">Network Monitoring</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="topology">Network Topology</TabsTrigger>
        </TabsList>

        <TabsContent value="routers" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Routers</CardTitle>
                <Router className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routers.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {routers.filter(r => r.connection_status === 'online').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline</CardTitle>
                <Wifi className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {routers.filter(r => r.connection_status === 'offline').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Settings className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {routers.filter(r => r.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Routers List */}
          <Card>
            <CardHeader>
              <CardTitle>MikroTik Routers</CardTitle>
            </CardHeader>
            <CardContent>
              {routers.length === 0 ? (
                <div className="text-center py-8">
                  <Router className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Routers Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first MikroTik router to start managing your network.
                  </p>
                  <Button onClick={() => setShowAddRouter(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Router
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {routers.map((router) => (
                    <div key={router.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Router className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">{router.name}</h3>
                          <p className="text-sm text-muted-foreground">{router.ip_address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getConnectionStatusColor(router.connection_status)}>
                              {router.connection_status}
                            </Badge>
                            <Badge variant={getRouterStatusColor(router.status)}>
                              {router.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(router.id)}
                          disabled={isTesting}
                        >
                          <TestTube className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRouter(router)}
                          disabled={isUpdating}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRouter(router.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Network Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {agentsLoading ? (
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                ) : (
                  <div className="text-2xl font-bold">{agents.length}</div>
                )}
                <p className="text-sm text-muted-foreground">Active monitoring agents</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Status</CardTitle>
              </CardHeader>
              <CardContent>
                {devicesLoading ? (
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                ) : (
                  <div className="text-2xl font-bold">{deviceStatuses.length}</div>
                )}
                <p className="text-sm text-muted-foreground">Monitored devices</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Good</div>
                <p className="text-sm text-muted-foreground">Overall status</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnostics">
          <NetworkDiagnosticsPanel />
        </TabsContent>

        <TabsContent value="topology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Network Topology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Network topology visualization coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This will show your network infrastructure layout
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddRouterDialog
        open={showAddRouter}
        onClose={() => setShowAddRouter(false)}
      />
      
      <EditRouterDialog
        router={selectedRouter}
        open={showEditRouter}
        onClose={() => {
          setShowEditRouter(false);
          setSelectedRouter(null);
        }}
      />
    </div>
  );
};

export default NetworkManagement;
