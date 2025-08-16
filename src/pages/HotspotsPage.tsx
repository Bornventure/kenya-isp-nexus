
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const HotspotsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hotspots</h1>
        <p className="text-muted-foreground">
          Manage wireless hotspot locations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Hotspot Management
          </CardTitle>
          <CardDescription>
            Configure and monitor hotspot locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Hotspot management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotspotsPage;
