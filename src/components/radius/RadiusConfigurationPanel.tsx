
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Server, Users } from 'lucide-react';
import { useRadiusServers, useRadiusGroups } from '@/hooks/useRadius';

const RadiusConfigurationPanel = () => {
  const { data: servers = [], isLoading: serversLoading } = useRadiusServers();
  const { data: groups = [], isLoading: groupsLoading } = useRadiusGroups();
  const [showAddServer, setShowAddServer] = useState(false);

  return (
    <div className="space-y-6">
      {/* RADIUS Servers Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                RADIUS Server Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure RADIUS authentication and accounting servers
              </p>
            </div>
            <Button onClick={() => setShowAddServer(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {serversLoading ? (
            <div className="text-center py-4">Loading servers...</div>
          ) : servers.length === 0 ? (
            <div className="text-center py-8">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No RADIUS Servers Configured</h3>
              <p className="text-muted-foreground mb-4">
                Configure your first RADIUS server to enable authentication
              </p>
              <Button onClick={() => setShowAddServer(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add RADIUS Server
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {servers.map((server) => (
                <div key={server.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{server.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={server.is_enabled ? 'default' : 'secondary'}>
                        {server.is_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      {server.is_primary && (
                        <Badge variant="outline">Primary</Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <div className="font-medium">{server.server_address}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Auth Port:</span>
                      <div className="font-medium">{server.auth_port}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accounting Port:</span>
                      <div className="font-medium">{server.accounting_port}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timeout:</span>
                      <div className="font-medium">{server.timeout_seconds}s</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RADIUS Groups Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            RADIUS User Groups
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure user groups with speed limits and session timeouts
          </p>
        </CardHeader>
        <CardContent>
          {groupsLoading ? (
            <div className="text-center py-4">Loading groups...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No User Groups Configured</h3>
              <p className="text-muted-foreground">
                Default groups have been created for your service packages
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">{group.name}</h4>
                    <Badge variant={group.is_active ? 'default' : 'secondary'}>
                      {group.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Upload:</span>
                      <div className="font-medium">{group.upload_limit_mbps} Mbps</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Download:</span>
                      <div className="font-medium">{group.download_limit_mbps} Mbps</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Session Timeout:</span>
                      <div className="font-medium">
                        {group.session_timeout_seconds ? `${Math.floor(group.session_timeout_seconds / 3600)}h` : 'Unlimited'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Idle Timeout:</span>
                      <div className="font-medium">
                        {group.idle_timeout_seconds ? `${Math.floor(group.idle_timeout_seconds / 60)}m` : 'None'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Speed Control Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Speed Control Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">RADIUS Speed Control Active</h4>
              <p className="text-sm text-green-800 mb-3">
                Speed limits are now managed entirely through the RADIUS system. Client speeds are automatically 
                applied based on their assigned service package group.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Authentication:</span>
                  <div className="font-medium">RADIUS Server</div>
                </div>
                <div>
                  <span className="text-green-700">Speed Control:</span>
                  <div className="font-medium">User Groups</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Clients authenticate via RADIUS using their username/password</li>
                <li>• Speed limits are applied based on their assigned group</li>
                <li>• No manual speed control needed - fully automated</li>
                <li>• Changes to service packages automatically update RADIUS groups</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadiusConfigurationPanel;
