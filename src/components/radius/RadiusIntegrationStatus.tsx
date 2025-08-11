
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Server, 
  CheckCircle, 
  AlertTriangle,
  Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRadiusServers, useRadiusGroups, useNASClients } from '@/hooks/useRadius';

const RadiusIntegrationStatus = () => {
  const navigate = useNavigate();
  const { data: servers = [] } = useRadiusServers();
  const { data: groups = [] } = useRadiusGroups();
  const { data: nasClients = [] } = useNASClients();

  const activeServers = servers.filter(s => s.is_enabled);
  const activeGroups = groups.filter(g => g.is_active);
  const activeNASClients = nasClients.filter(n => n.is_active);

  const isConfigured = activeServers.length > 0 && activeNASClients.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">RADIUS Integration</h2>
        <p className="text-muted-foreground">
          Configure FreeRADIUS integration with MikroTik routers for PPPoE authentication
        </p>
      </div>

      {/* Configuration Status */}
      {!isConfigured ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="font-medium text-orange-900">RADIUS Configuration Required</h3>
          </div>
          <p className="text-sm text-orange-800 mb-4">
            To enable automatic PPPoE user provisioning and speed limit management:
          </p>
          <ul className="text-sm text-orange-800 space-y-1 mb-4">
            <li>• Configure FreeRADIUS server integration</li>
            <li>• Set up MikroTik NAS client configuration</li>
            <li>• Enable automatic user provisioning</li>
            <li>• Configure speed limit attributes</li>
          </ul>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-900">RADIUS Integration Active</h3>
          </div>
          <p className="text-sm text-green-800">
            Your RADIUS integration is properly configured and ready for PPPoE authentication.
          </p>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              RADIUS Server Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">FreeRADIUS Service</span>
                <Badge variant={activeServers.length > 0 ? 'default' : 'destructive'}>
                  {activeServers.length > 0 ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Servers</span>
                <Badge variant={activeServers.length > 0 ? 'default' : 'secondary'}>
                  {activeServers.length} Server{activeServers.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">NAS Clients</span>
                <Badge variant={activeNASClients.length > 0 ? 'default' : 'secondary'}>
                  {activeNASClients.length} Configured
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Auto Provisioning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">User Creation</span>
                <Badge variant={isConfigured ? 'default' : 'destructive'}>
                  {isConfigured ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Speed Limits</span>
                <Badge variant={activeGroups.length > 0 ? 'default' : 'secondary'}>
                  {activeGroups.length > 0 ? 'Configured' : 'Manual'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Groups</span>
                <Badge variant={activeGroups.length > 0 ? 'default' : 'secondary'}>
                  {activeGroups.length} Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => navigate('/radius-management')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          {isConfigured ? 'Manage RADIUS Configuration' : 'Configure RADIUS Integration'}
        </Button>
      </div>

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> {isConfigured 
              ? 'Your RADIUS integration is active. User authentication and speed limits are managed through the configured RADIUS servers and user groups.'
              : 'Configure RADIUS servers and NAS clients to enable automatic PPPoE user provisioning and centralized speed limit management.'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadiusIntegrationStatus;
