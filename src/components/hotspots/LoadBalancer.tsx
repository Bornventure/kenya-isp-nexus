
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Network,
  Activity,
  Users,
  ArrowUpDown,
  Settings,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface LoadBalancerRule {
  id: string;
  name: string;
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'geographic';
  hotspots: Array<{
    id: string;
    name: string;
    weight: number;
    currentLoad: number;
    maxCapacity: number;
    isActive: boolean;
  }>;
  isEnabled: boolean;
  priority: number;
}

interface LoadBalancerProps {
  selectedHotspot: string | null;
}

const LoadBalancer: React.FC<LoadBalancerProps> = ({ selectedHotspot }) => {
  const [loadBalancingEnabled, setLoadBalancingEnabled] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<LoadBalancerRule['algorithm']>('round_robin');

  const { data: balancerRules, isLoading } = useQuery({
    queryKey: ['load-balancer-rules'],
    queryFn: async () => {
      // Mock data - in real implementation, fetch from backend
      const mockRules: LoadBalancerRule[] = [
        {
          id: '1',
          name: 'City Center Cluster',
          algorithm: 'least_connections',
          hotspots: [
            {
              id: '1',
              name: 'Main Plaza Hotspot',
              weight: 100,
              currentLoad: 75,
              maxCapacity: 100,
              isActive: true
            },
            {
              id: '2',
              name: 'Coffee Shop WiFi',
              weight: 80,
              currentLoad: 45,
              maxCapacity: 60,
              isActive: true
            },
            {
              id: '3',
              name: 'Library Access Point',
              weight: 60,
              currentLoad: 0,
              maxCapacity: 40,
              isActive: false
            }
          ],
          isEnabled: true,
          priority: 1
        }
      ];
      return mockRules;
    },
  });

  const getAlgorithmDescription = (algorithm: LoadBalancerRule['algorithm']) => {
    switch (algorithm) {
      case 'round_robin': return 'Distributes users evenly across all hotspots';
      case 'least_connections': return 'Routes to hotspot with fewest active connections';
      case 'weighted': return 'Routes based on hotspot capacity weights';
      case 'geographic': return 'Routes to nearest hotspot based on location';
      default: return '';
    }
  };

  const getLoadColor = (load: number, capacity: number) => {
    const percentage = (load / capacity) * 100;
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Load Balancing</h3>
          <p className="text-sm text-muted-foreground">
            Distribute user traffic across multiple hotspots for optimal performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Load Balancing</span>
          <Switch
            checked={loadBalancingEnabled}
            onCheckedChange={setLoadBalancingEnabled}
          />
        </div>
      </div>

      {/* Algorithm Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Balancing Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['round_robin', 'least_connections', 'weighted', 'geographic'] as const).map((algorithm) => (
              <div
                key={algorithm}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAlgorithm === algorithm
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAlgorithm(algorithm)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedAlgorithm === algorithm ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <h4 className="font-medium capitalize">{algorithm.replace('_', ' ')}</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getAlgorithmDescription(algorithm)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hotspot Clusters */}
      {balancerRules?.map((rule) => (
        <Card key={rule.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                {rule.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={rule.isEnabled ? "default" : "secondary"}>
                  {rule.isEnabled ? 'Active' : 'Inactive'}
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {rule.hotspots.map((hotspot) => (
                  <div key={hotspot.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        hotspot.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{hotspot.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Weight: {hotspot.weight}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className={`font-medium ${getLoadColor(hotspot.currentLoad, hotspot.maxCapacity)}`}>
                          {hotspot.currentLoad}/{hotspot.maxCapacity}
                        </span>
                      </div>
                      <Progress 
                        value={(hotspot.currentLoad / hotspot.maxCapacity) * 100} 
                        className="w-20 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Algorithm: {rule.algorithm.replace('_', ' ')} | Priority: {rule.priority}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Load Balancing Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">98.5%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">2.3s</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">847</p>
              <p className="text-sm text-muted-foreground">Requests/min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-sm text-muted-foreground">Failed Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadBalancer;
