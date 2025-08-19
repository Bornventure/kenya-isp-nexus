
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Shield, Bell } from 'lucide-react';

interface LocationServicesProps {
  selectedHotspot: string | null;
}

const LocationServices: React.FC<LocationServicesProps> = ({ selectedHotspot }) => {
  const locationFeatures = [
    {
      name: 'Location Tracking',
      icon: MapPin,
      description: 'Track user location for analytics',
      enabled: true,
      privacy: 'Anonymous'
    },
    {
      name: 'Geofencing',
      icon: Navigation,
      description: 'Send notifications based on location',
      enabled: false,
      privacy: 'Opt-in'
    },
    {
      name: 'Location-based Content',
      icon: Bell,
      description: 'Show relevant local content and ads',
      enabled: true,
      privacy: 'Anonymous'
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Services
            {selectedHotspot && (
              <Badge variant="outline">
                Hotspot: {selectedHotspot}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locationFeatures.map((feature) => (
              <div key={feature.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <feature.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="font-medium">{feature.name}</Label>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <Switch checked={feature.enabled} />
                </div>
                <div className="flex items-center gap-2 ml-8">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    Privacy: {feature.privacy}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="text-2xl font-bold">2.4km</p>
                <p className="text-sm text-muted-foreground">Average Coverage Radius</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-muted-foreground">Location Accuracy</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label>Heat Map Generation</Label>
                <Button variant="outline" size="sm">Generate</Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Create user density heat maps for location optimization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationServices;
