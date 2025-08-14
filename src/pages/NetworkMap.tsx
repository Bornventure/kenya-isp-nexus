
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NetworkMapPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Map</h1>
        <p className="text-muted-foreground">
          Visualize your network topology and connections.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Topology</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Network map visualization will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkMapPage;
