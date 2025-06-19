
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  Globe, 
  Users, 
  Shield,
  MapPin,
  Clock,
  Signal
} from 'lucide-react';

interface RoamingManagerProps {
  selectedHotspot: string | null;
}

const RoamingManager: React.FC<RoamingManagerProps> = ({ selectedHotspot }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    autoConnect: true,
    secureRoaming: true,
    maxRoamingTime: 120,
    allowedNetworks: ['WiFi_Network_1', 'WiFi_Network_2'],
    bandwidthLimit: 10
  });

  const mockRoamingUsers = [
    { id: 1, name: 'John Doe', device: 'iPhone 12', network: 'WiFi_Network_1', duration: '45m', status: 'active' },
    { id: 2, name: 'Jane Smith', device: 'Samsung Galaxy', network: 'WiFi_Network_2', duration: '23m', status: 'active' },
    { id: 3, name: 'Mike Wilson', device: 'MacBook Pro', network: 'WiFi_Network_1', duration: '78m', status: 'active' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Roaming Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure seamless network roaming for authorized users
          </p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Update Security Policy
        </Button>
      </div>

      {!selectedHotspot && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-orange-800">
              Please select a hotspot from the Hotspots tab to configure roaming.
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
                <p className="text-sm font-medium text-muted-foreground">Roaming Users</p>
                <p className="text-2xl font-bold">{mockRoamingUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Partner Networks</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Session Time</p>
                <p className="text-2xl font-bold">48m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <Signal className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roaming Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Roaming Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Roaming</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to seamlessly move between networks
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Connect</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically connect to available partner networks
                </p>
              </div>
              <Switch
                checked={settings.autoConnect}
                onCheckedChange={(checked) => setSettings({...settings, autoConnect: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Secure Roaming</Label>
                <p className="text-sm text-muted-foreground">
                  Use encrypted authentication for roaming
                </p>
              </div>
              <Switch
                checked={settings.secureRoaming}
                onCheckedChange={(checked) => setSettings({...settings, secureRoaming: checked})}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Roaming Time (minutes)</Label>
              <Input
                type="number"
                value={settings.maxRoamingTime}
                onChange={(e) => setSettings({...settings, maxRoamingTime: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="space-y-2">
              <Label>Bandwidth Limit (Mbps)</Label>
              <Input
                type="number"
                value={settings.bandwidthLimit}
                onChange={(e) => setSettings({...settings, bandwidthLimit: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Networks */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'WiFi_Network_1', location: 'Downtown Mall', status: 'active', users: 23 },
              { name: 'WiFi_Network_2', location: 'Business District', status: 'active', users: 15 },
              { name: 'WiFi_Network_3', location: 'Airport Terminal', status: 'maintenance', users: 0 },
              { name: 'WiFi_Network_4', location: 'University Campus', status: 'active', users: 45 },
              { name: 'WiFi_Network_5', location: 'Shopping Center', status: 'active', users: 31 }
            ].map((network, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Wifi className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{network.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {network.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{network.users} users</p>
                    <Badge variant={network.status === 'active' ? 'default' : 'secondary'}>
                      {network.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Roaming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Roaming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Device</th>
                  <th className="text-left p-2">Current Network</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockRoamingUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{user.name}</td>
                    <td className="p-2">{user.device}</td>
                    <td className="p-2">{user.network}</td>
                    <td className="p-2">{user.duration}</td>
                    <td className="p-2">
                      <Badge variant="default">
                        {user.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoamingManager;
