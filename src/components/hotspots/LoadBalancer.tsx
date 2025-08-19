
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Wifi, Users } from 'lucide-react';

interface LoadBalancerProps {
  selectedHotspot: string | null;
}

const LoadBalancer: React.FC<LoadBalancerProps> = ({ selectedHotspot }) => {
  // Sample load balancing data
  const loadBalancerStats = [
    { id: '1', name: 'Primary Access Point', load: 75, users: 45, status: 'active' },
    { id: '2', name: 'Secondary Access Point', load: 35, users: 23, status: 'active' },
    { id: '3', name: 'Backup Access Point', load: 10, users: 5, status: 'standby' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Load Balancer Status
            {selectedHotspot && (
              <Badge variant="outline">
                Hotspot: {selectedHotspot}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loadBalancerStats.map((ap) => (
              <div key={ap.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span className="font-medium">{ap.name}</span>
                  </div>
                  <Badge variant={ap.status === 'active' ? 'default' : 'secondary'}>
                    {ap.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ap.users} users</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Load: {ap.load}%
                  </div>
                </div>
                
                <Progress value={ap.load} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Load Balancing Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Load balancing configuration and management tools will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadBalancer;
