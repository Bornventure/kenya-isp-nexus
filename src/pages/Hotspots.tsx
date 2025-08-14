
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HotspotsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hotspots</h1>
        <p className="text-muted-foreground">
          Manage WiFi hotspots and access points.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotspot Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Hotspot management features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotspotsPage;
