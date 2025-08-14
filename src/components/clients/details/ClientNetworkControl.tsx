
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Clock, Download, Upload } from 'lucide-react';
import { formatBytes, formatDuration } from '@/utils/formatters';

interface ClientNetworkControlProps {
  clientId: string;
  clientName: string;
}

const ClientNetworkControl: React.FC<ClientNetworkControlProps> = ({ clientId, clientName }) => {
  // Mock data for now - in production this would come from RADIUS/network monitoring
  const activeSessions = [
    {
      id: '1',
      status: 'active',
      ipAddress: '192.168.1.100',
      nasIpAddress: '192.168.1.1',
      duration: 3600, // 1 hour in seconds
      bytesIn: 1024 * 1024 * 50, // 50MB
      bytesOut: 1024 * 1024 * 20, // 20MB
      startTime: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const allSessions = [
    ...activeSessions,
    {
      id: '2',
      status: 'terminated',
      ipAddress: '192.168.1.100',
      nasIpAddress: '192.168.1.1',
      duration: 7200, // 2 hours
      bytesIn: 1024 * 1024 * 100, // 100MB
      bytesOut: 1024 * 1024 * 40, // 40MB
      startTime: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const isLoading = false;
  const isLoadingAll = false;
  const isTerminating = false;

  const handleTerminateSession = async (sessionId: string) => {
    console.log(`Terminating session ${sessionId} for client ${clientId}`);
    // In production, this would call the RADIUS server to terminate the session
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Active Sessions for {clientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                      <span className="font-medium">{session.ipAddress}</span>
                      <span className="text-sm text-gray-600">
                        NAS: {session.nasIpAddress}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(session.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {formatBytes(session.bytesIn)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Upload className="h-4 w-4" />
                        {formatBytes(session.bytesOut)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                    disabled={isTerminating}
                  >
                    <WifiOff className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAll ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : allSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No session history</p>
          ) : (
            <div className="space-y-2">
              {allSessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-4">
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    <span className="text-sm">{session.ipAddress}</span>
                    <span className="text-sm text-gray-600">
                      {formatDuration(session.duration)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(session.startTime).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNetworkControl;
