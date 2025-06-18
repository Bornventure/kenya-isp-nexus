
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Wifi,
  ArrowRightLeft,
  Clock,
  User,
  Smartphone,
  Navigation
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface RoamingSession {
  id: string;
  clientId: string;
  clientName: string;
  deviceMac: string;
  currentHotspot: {
    id: string;
    name: string;
    location: string;
  };
  previousHotspots: Array<{
    id: string;
    name: string;
    location: string;
    connectedAt: string;
    disconnectedAt: string;
  }>;
  totalRoamingEvents: number;
  sessionStartTime: string;
  lastRoamingTime: string;
  isActive: boolean;
}

interface RoamingManagerProps {
  selectedHotspot: string | null;
}

const RoamingManager: React.FC<RoamingManagerProps> = ({ selectedHotspot }) => {
  const [roamingEnabled, setRoamingEnabled] = useState(true);
  const [autoHandoff, setAutoHandoff] = useState(true);
  const [handoffThreshold, setHandoffThreshold] = useState(-70);

  const { data: roamingSessions, isLoading } = useQuery({
    queryKey: ['roaming-sessions', selectedHotspot],
    queryFn: async () => {
      // Mock data - in real implementation, fetch from backend
      const mockSessions: RoamingSession[] = [
        {
          id: '1',
          clientId: 'client-1',
          clientName: 'John Doe',
          deviceMac: '00:11:22:33:44:55',
          currentHotspot: {
            id: '1',
            name: 'Main Plaza Hotspot',
            location: 'City Center'
          },
          previousHotspots: [
            {
              id: '2',
              name: 'Coffee Shop WiFi',
              location: 'Downtown',
              connectedAt: '2024-01-20T10:00:00Z',
              disconnectedAt: '2024-01-20T10:30:00Z'
            },
            {
              id: '3',
              name: 'Library Access Point',
              location: 'Public Library',
              connectedAt: '2024-01-20T09:00:00Z',
              disconnectedAt: '2024-01-20T09:45:00Z'
            }
          ],
          totalRoamingEvents: 5,
          sessionStartTime: '2024-01-20T09:00:00Z',
          lastRoamingTime: '2024-01-20T10:30:00Z',
          isActive: true
        },
        {
          id: '2',
          clientId: 'client-2',
          clientName: 'Jane Smith',
          deviceMac: '66:77:88:99:AA:BB',
          currentHotspot: {
            id: '2',
            name: 'Coffee Shop WiFi',
            location: 'Downtown'
          },
          previousHotspots: [
            {
              id: '1',
              name: 'Main Plaza Hotspot',
              location: 'City Center',
              connectedAt: '2024-01-20T11:00:00Z',
              disconnectedAt: '2024-01-20T11:20:00Z'
            }
          ],
          totalRoamingEvents: 2,
          sessionStartTime: '2024-01-20T11:00:00Z',
          lastRoamingTime: '2024-01-20T11:20:00Z',
          isActive: true
        }
      ];

      return selectedHotspot 
        ? mockSessions.filter(s => s.currentHotspot.id === selectedHotspot)
        : mockSessions;
    },
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const calculateSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Roaming Management</h3>
          <p className="text-sm text-muted-foreground">
            Seamless connectivity across multiple hotspot locations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Auto Handoff</span>
            <Switch
              checked={autoHandoff}
              onCheckedChange={setAutoHandoff}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Roaming</span>
            <Switch
              checked={roamingEnabled}
              onCheckedChange={setRoamingEnabled}
            />
          </div>
        </div>
      </div>

      {/* Roaming Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Roaming Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Handoff Threshold (dBm)</label>
              <Input
                type="number"
                value={handoffThreshold}
                onChange={(e) => setHandoffThreshold(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Signal strength threshold for automatic handoff
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Handoff Delay (seconds)</label>
              <Input
                type="number"
                defaultValue={5}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Delay before initiating handoff
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Max Roaming Distance (meters)</label>
              <Input
                type="number"
                defaultValue={500}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum distance for roaming eligibility
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Roaming Sessions */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Active Roaming Sessions</h4>
        {roamingSessions?.map((session) => (
          <Card key={session.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{session.clientName}</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{calculateSessionDuration(session.sessionStartTime)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Location */}
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Currently at: {session.currentHotspot.name}</p>
                    <p className="text-sm text-green-600">{session.currentHotspot.location}</p>
                  </div>
                </div>

                {/* Device Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    <span>MAC: {session.deviceMac}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>{session.totalRoamingEvents} roaming events</span>
                  </div>
                </div>

                {/* Roaming History */}
                {session.previousHotspots.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recent Roaming History</p>
                    <div className="space-y-2">
                      {session.previousHotspots.slice(0, 3).map((hotspot, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{hotspot.name}</p>
                              <p className="text-xs text-muted-foreground">{hotspot.location}</p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(hotspot.connectedAt)} - {formatTime(hotspot.disconnectedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roaming Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Roaming Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{roamingSessions?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">94.2%</p>
              <p className="text-sm text-muted-foreground">Handoff Success</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">1.8s</p>
              <p className="text-sm text-muted-foreground">Avg Handoff Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">127</p>
              <p className="text-sm text-muted-foreground">Total Roamings Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(!roamingSessions || roamingSessions.length === 0) && (
        <div className="text-center py-12">
          <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active roaming sessions</h3>
          <p className="text-gray-500">
            Users will appear here when they roam between hotspot locations.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoamingManager;
