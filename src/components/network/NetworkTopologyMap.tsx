
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Router, 
  Server, 
  Wifi, 
  Monitor, 
  Zap,
  Network,
  Activity
} from 'lucide-react';

const NetworkTopologyMap = () => {
  const [selectedView, setSelectedView] = useState('physical');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Mock network topology data
  const networkNodes = [
    {
      id: 'core-router',
      name: 'Core Router',
      type: 'router',
      status: 'online',
      ip: '192.168.1.1',
      connections: ['dist-switch-1', 'dist-switch-2'],
      position: { x: 400, y: 100 }
    },
    {
      id: 'dist-switch-1',
      name: 'Distribution Switch A',
      type: 'switch',
      status: 'online',
      ip: '192.168.1.10',
      connections: ['access-switch-1', 'access-switch-2'],
      position: { x: 200, y: 250 }
    },
    {
      id: 'dist-switch-2',
      name: 'Distribution Switch B',
      type: 'switch',
      status: 'warning',
      ip: '192.168.1.11',
      connections: ['access-switch-3'],
      position: { x: 600, y: 250 }
    },
    {
      id: 'access-switch-1',
      name: 'Access Switch 1',
      type: 'switch',
      status: 'online',
      ip: '192.168.1.20',
      connections: ['ap-001', 'ap-002'],
      position: { x: 100, y: 400 }
    },
    {
      id: 'access-switch-2',
      name: 'Access Switch 2',
      type: 'switch',
      status: 'online',
      ip: '192.168.1.21',
      connections: ['ap-003'],
      position: { x: 300, y: 400 }
    },
    {
      id: 'access-switch-3',
      name: 'Access Switch 3',
      type: 'switch',
      status: 'offline',
      ip: '192.168.1.22',
      connections: [],
      position: { x: 600, y: 400 }
    },
    {
      id: 'ap-001',
      name: 'AP Zone A',
      type: 'access_point',
      status: 'online',
      ip: '192.168.1.50',
      connections: [],
      position: { x: 50, y: 550 }
    },
    {
      id: 'ap-002',
      name: 'AP Zone B',
      type: 'access_point',
      status: 'online',
      ip: '192.168.1.51',
      connections: [],
      position: { x: 150, y: 550 }
    },
    {
      id: 'ap-003',
      name: 'AP Zone C',
      type: 'access_point',
      status: 'warning',
      ip: '192.168.1.52',
      connections: [],
      position: { x: 300, y: 550 }
    }
  ];

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'router': return <Router className="h-6 w-6" />;
      case 'switch': return <Server className="h-6 w-6" />;
      case 'access_point': return <Wifi className="h-6 w-6" />;
      default: return <Monitor className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500 border-green-500';
      case 'warning': return 'text-yellow-500 border-yellow-500';
      case 'offline': return 'text-red-500 border-red-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const selectedNodeData = selectedNode ? networkNodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Network Topology</h2>
          <p className="text-muted-foreground">
            Visual representation of your network infrastructure and connections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">Physical View</SelectItem>
              <SelectItem value="logical">Logical View</SelectItem>
              <SelectItem value="traffic">Traffic View</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Diagram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: '600px' }}>
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Draw connections */}
                  {networkNodes.map(node => 
                    node.connections.map(connId => {
                      const connNode = networkNodes.find(n => n.id === connId);
                      if (!connNode) return null;
                      return (
                        <line
                          key={`${node.id}-${connId}`}
                          x1={node.position.x}
                          y1={node.position.y}
                          x2={connNode.position.x}
                          y2={connNode.position.y}
                          stroke="#94a3b8"
                          strokeWidth="2"
                          className={node.status === 'offline' || connNode.status === 'offline' ? 'opacity-30' : ''}
                        />
                      );
                    })
                  )}
                </svg>
                
                {/* Draw nodes */}
                {networkNodes.map(node => (
                  <div
                    key={node.id}
                    className={`absolute cursor-pointer transition-all ${getStatusColor(node.status)} ${
                      selectedNode === node.id ? 'scale-110 shadow-lg' : 'hover:scale-105'
                    }`}
                    style={{
                      left: node.position.x - 25,
                      top: node.position.y - 25,
                    }}
                    onClick={() => setSelectedNode(node.id)}
                  >
                    <div className="w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center shadow-md">
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="text-xs text-center mt-1 font-medium max-w-20 truncate">
                      {node.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Offline</span>
              </div>
            </CardContent>
          </Card>

          {/* Node Details */}
          {selectedNodeData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Node Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{selectedNodeData.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedNodeData.type.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge 
                      variant="outline" 
                      className={selectedNodeData.status === 'online' ? 'border-green-500 text-green-500' : 
                                selectedNodeData.status === 'warning' ? 'border-yellow-500 text-yellow-500' :
                                'border-red-500 text-red-500'}
                    >
                      {selectedNodeData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">IP Address:</span>
                    <span className="text-sm font-mono">{selectedNodeData.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Connections:</span>
                    <span className="text-sm">{selectedNodeData.connections.length}</span>
                  </div>
                </div>

                <Button size="sm" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Network Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Network Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Nodes:</span>
                <span className="text-sm font-medium">{networkNodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Online:</span>
                <span className="text-sm font-medium text-green-600">
                  {networkNodes.filter(n => n.status === 'online').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Warnings:</span>
                <span className="text-sm font-medium text-yellow-600">
                  {networkNodes.filter(n => n.status === 'warning').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Offline:</span>
                <span className="text-sm font-medium text-red-600">
                  {networkNodes.filter(n => n.status === 'offline').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopologyMap;
