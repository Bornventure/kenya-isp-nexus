
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Users, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useRadiusUsers } from '@/hooks/useRadiusUsers';
import { useRadiusSessions } from '@/hooks/useRadiusSessions';

interface ClientNetworkControlProps {
  clientId: string;
  clientName: string;
  isActive: boolean;
}

const ClientNetworkControl: React.FC<ClientNetworkControlProps> = ({
  clientId,
  clientName,
  isActive
}) => {
  const { 
    radiusUsers, 
    createRadiusUser, 
    disconnectUser, 
    isCreating, 
    isDisconnecting 
  } = useRadiusUsers();
  
  const { sessions, disconnectSession } = useRadiusSessions();
  
  // Find RADIUS user for this client
  const radiusUser = radiusUsers.find(user => user.client_id === clientId);
  
  // Find active sessions for this client
  const clientSessions = sessions.filter(session => session.client_id === clientId);
  
  const handleCreateRadiusUser = () => {
    createRadiusUser(clientId);
  };
  
  const handleDisconnectUser = () => {
    if (radiusUser) {
      disconnectUser(radiusUser.username);
    }
  };
  
  const handleDisconnectSession = (username: string) => {
    disconnectSession(username);
  };

  return (
    <div className="space-y-4">
      {/* RADIUS User Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            RADIUS Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          {radiusUser ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Username: {radiusUser.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Group: {radiusUser.group_name} | 
                    Download: {radiusUser.max_download} | 
                    Upload: {radiusUser.max_upload}
                  </p>
                </div>
                <Badge variant={radiusUser.is_active ? 'default' : 'destructive'}>
                  {radiusUser.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnectUser}
                  disabled={isDisconnecting}
                >
                  <WifiOff className="h-4 w-4 mr-2" />
                  Disconnect from Network
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <p className="text-orange-900">No RADIUS user configured for this client</p>
              </div>
              
              <Button
                onClick={handleCreateRadiusUser}
                disabled={isCreating || !isActive}
              >
                <Users className="h-4 w-4 mr-2" />
                Create RADIUS User
              </Button>
              
              {!isActive && (
                <p className="text-sm text-muted-foreground">
                  Client must be active to create RADIUS user
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Network Sessions ({clientSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientSessions.length > 0 ? (
            <div className="space-y-3">
              {clientSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Session ID: {session.session_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(session.start_time).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Data: {Math.round(session.bytes_in / 1024 / 1024)}MB in / 
                      {Math.round(session.bytes_out / 1024 / 1024)}MB out
                    </p>
                    {session.nas_ip_address && (
                      <p className="text-sm text-muted-foreground">
                        NAS: {session.nas_ip_address}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      <Wifi className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnectSession(session.username)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <WifiOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">No active network sessions</p>
              <p className="text-sm text-muted-foreground">
                {radiusUser ? 'Client is not currently connected' : 'Create RADIUS user to enable connections'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Network Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">RADIUS User</p>
              <p className="font-medium">
                {radiusUser ? 'Configured' : 'Not Configured'}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="font-medium">{clientSessions.length}</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>RADIUS Integration:</strong> Speed limits and access control are now managed 
              automatically through RADIUS groups based on the client's service package.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNetworkControl;
