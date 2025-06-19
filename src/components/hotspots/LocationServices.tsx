
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Globe, 
  Users,
  Settings,
  Radar,
  Target
} from 'lucide-react';

interface LocationServicesProps {
  selectedHotspot: string | null;
}

const LocationServices: React.FC<LocationServicesProps> = ({ selectedHotspot }) => {
  const [locationSettings, setLocationSettings] = useState({
    geoLocation: true,
    proximityAlerts: true,
    locationBasedContent: false,
    heatmapTracking: true,
    geofencing: false,
    accuracyRadius: 50,
    trackingInterval: 30
  });

  const mockLocationData = [
    { id: 1, user: 'User_001', device: 'iPhone', location: 'Main Entrance', distance: '5m', time: '2 mins ago' },
    { id: 2, user: 'User_002', device: 'Android', location: 'Food Court', distance: '15m', time: '5 mins ago' },
    { id: 3, user: 'User_003', device: 'Laptop', location: 'Seating Area', distance: '8m', time: '8 mins ago' }
  ];

  const mockHeatmapZones = [
    { zone: 'Main Entrance', users: 45, density: 'High', avgDuration: '12m' },
    { zone: 'Food Court', users: 32, density: 'Medium', avgDuration: '25m' },
    { zone: 'Seating Area', users: 28, density: 'Medium', avgDuration: '18m' },
    { zone: 'Parking Area', users: 15, density: 'Low', avgDuration: '8m' }
  ];

  const getDensityColor = (density: string) => {
    switch (density.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Location Services</h3>
          <p className="text-sm text-muted-foreground">
            Track and analyze user location data and movement patterns
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Update Privacy Settings
        </Button>
      </div>

      {!selectedHotspot && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-orange-800">
              Please select a hotspot from the Hotspots tab to configure location services.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracked Users</p>
                <p className="text-2xl font-bold">124</p>
              </div>
              <Navigation className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Zones</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Session Time</p>
                <p className="text-2xl font-bold">16m</p>
              </div>
              <Radar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coverage Area</p>
                <p className="text-2xl font-bold">2.5km²</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Location Tracking Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Geo-Location</Label>
                <p className="text-sm text-muted-foreground">
                  Track user device locations within coverage area
                </p>
              </div>
              <Switch
                checked={locationSettings.geoLocation}
                onCheckedChange={(checked) => setLocationSettings({...locationSettings, geoLocation: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Proximity Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications based on user proximity
                </p>
              </div>
              <Switch
                checked={locationSettings.proximityAlerts}
                onCheckedChange={(checked) => setLocationSettings({...locationSettings, proximityAlerts: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Location-based Content</Label>
                <p className="text-sm text-muted-foreground">
                  Show content based on user location
                </p>
              </div>
              <Switch
                checked={locationSettings.locationBasedContent}
                onCheckedChange={(checked) => setLocationSettings({...locationSettings, locationBasedContent: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Heatmap Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Generate usage heatmaps and analytics
                </p>
              </div>
              <Switch
                checked={locationSettings.heatmapTracking}
                onCheckedChange={(checked) => setLocationSettings({...locationSettings, heatmapTracking: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Geofencing</Label>
                <p className="text-sm text-muted-foreground">
                  Create virtual boundaries for zones
                </p>
              </div>
              <Switch
                checked={locationSettings.geofencing}
                onCheckedChange={(checked) => setLocationSettings({...locationSettings, geofencing: checked})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Accuracy Radius (meters)</Label>
              <Input
                type="number"
                value={locationSettings.accuracyRadius}
                onChange={(e) => setLocationSettings({...locationSettings, accuracyRadius: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="space-y-2">
              <Label>Tracking Interval (seconds)</Label>
              <Input
                type="number"
                value={locationSettings.trackingInterval}
                onChange={(e) => setLocationSettings({...locationSettings, trackingInterval: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Location Data */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time User Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User ID</th>
                  <th className="text-left p-2">Device</th>
                  <th className="text-left p-2">Zone</th>
                  <th className="text-left p-2">Distance</th>
                  <th className="text-left p-2">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {mockLocationData.map((location) => (
                  <tr key={location.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-xs">{location.user}</td>
                    <td className="p-2">{location.device}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        {location.location}
                      </div>
                    </td>
                    <td className="p-2">{location.distance}</td>
                    <td className="p-2 text-muted-foreground">{location.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Heatmap by Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockHeatmapZones.map((zone, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{zone.zone}</h4>
                  <Badge className={getDensityColor(zone.density)}>
                    {zone.density}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Active Users</p>
                    <p className="font-medium">{zone.users}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg. Duration</p>
                    <p className="font-medium">{zone.avgDuration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationServices;
