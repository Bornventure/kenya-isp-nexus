
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Twitter, 
  Globe,
  Users,
  Settings,
  Eye,
  Shield
} from 'lucide-react';

interface SocialAuthProps {
  selectedHotspot: string | null;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ selectedHotspot }) => {
  const [socialSettings, setSocialSettings] = useState({
    facebook: {
      enabled: true,
      appId: '',
      appSecret: '',
      permissions: ['email', 'public_profile']
    },
    google: {
      enabled: true,
      clientId: '',
      clientSecret: '',
      permissions: ['email', 'profile']
    },
    twitter: {
      enabled: false,
      apiKey: '',
      apiSecret: '',
      permissions: ['read']
    },
    captivePortal: {
      enabled: true,
      customBranding: true,
      termsRequired: true,
      dataCollection: true
    }
  });

  const mockSocialLogins = [
    { id: 1, provider: 'Facebook', user: 'John Doe', email: 'john@example.com', time: '2 mins ago' },
    { id: 2, provider: 'Google', user: 'Jane Smith', email: 'jane@example.com', time: '5 mins ago' },
    { id: 3, provider: 'Facebook', user: 'Mike Wilson', email: 'mike@example.com', time: '12 mins ago' }
  ];

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'google': return <Globe className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'facebook': return 'bg-blue-100 text-blue-800';
      case 'google': return 'bg-red-100 text-red-800';
      case 'twitter': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Social Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Configure social login options for guest access
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      {!selectedHotspot && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-orange-800">
              Please select a hotspot from the Hotspots tab to configure social authentication.
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
                <p className="text-sm font-medium text-muted-foreground">Social Logins</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Facebook</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Facebook className="h-8 w-8 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Google</p>
                <p className="text-2xl font-bold">78</p>
              </div>
              <Globe className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">82%</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Provider Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facebook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Facebook Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Facebook Login</Label>
              <Switch
                checked={socialSettings.facebook.enabled}
                onCheckedChange={(checked) => setSocialSettings({
                  ...socialSettings,
                  facebook: { ...socialSettings.facebook, enabled: checked }
                })}
              />
            </div>
            
            {socialSettings.facebook.enabled && (
              <>
                <div className="space-y-2">
                  <Label>App ID</Label>
                  <Input
                    placeholder="Enter Facebook App ID"
                    value={socialSettings.facebook.appId}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      facebook: { ...socialSettings.facebook, appId: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>App Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter Facebook App Secret"
                    value={socialSettings.facebook.appSecret}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      facebook: { ...socialSettings.facebook, appSecret: e.target.value }
                    })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Google */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-red-600" />
              Google Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Google Login</Label>
              <Switch
                checked={socialSettings.google.enabled}
                onCheckedChange={(checked) => setSocialSettings({
                  ...socialSettings,
                  google: { ...socialSettings.google, enabled: checked }
                })}
              />
            </div>
            
            {socialSettings.google.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    placeholder="Enter Google Client ID"
                    value={socialSettings.google.clientId}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      google: { ...socialSettings.google, clientId: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter Google Client Secret"
                    value={socialSettings.google.clientSecret}
                    onChange={(e) => setSocialSettings({
                      ...socialSettings,
                      google: { ...socialSettings.google, clientSecret: e.target.value }
                    })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Captive Portal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Captive Portal Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Captive Portal</Label>
                <p className="text-sm text-muted-foreground">
                  Show login page before internet access
                </p>
              </div>
              <Switch
                checked={socialSettings.captivePortal.enabled}
                onCheckedChange={(checked) => setSocialSettings({
                  ...socialSettings,
                  captivePortal: { ...socialSettings.captivePortal, enabled: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Custom Branding</Label>
                <p className="text-sm text-muted-foreground">
                  Use custom logo and colors
                </p>
              </div>
              <Switch
                checked={socialSettings.captivePortal.customBranding}
                onCheckedChange={(checked) => setSocialSettings({
                  ...socialSettings,
                  captivePortal: { ...socialSettings.captivePortal, customBranding: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Terms & Conditions</Label>
                <p className="text-sm text-muted-foreground">
                  Require users to accept terms
                </p>
              </div>
              <Switch
                checked={socialSettings.captivePortal.termsRequired}
                onCheckedChange={(checked) => setSocialSettings({
                  ...socialSettings,
                  captivePortal: { ...socialSettings.captivePortal, termsRequired: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Data Collection</Label>
                <p className="text-sm text-muted-foreground">
                  Collect user information for analytics
                </p>
              </div>
              <Switch
                checked={socialSettings.captivePortal.dataCollection}
                onCheckedChange={(checked) => setSocialSettings({
                  ...socialSettings,
                  captivePortal: { ...socialSettings.captivePortal, dataCollection: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Social Logins */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Social Logins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Provider</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Login Time</th>
                </tr>
              </thead>
              <tbody>
                {mockSocialLogins.map((login) => (
                  <tr key={login.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Badge className={`${getProviderColor(login.provider)} flex items-center gap-1 w-fit`}>
                        {getProviderIcon(login.provider)}
                        {login.provider}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{login.user}</td>
                    <td className="p-2">{login.email}</td>
                    <td className="p-2 text-muted-foreground">{login.time}</td>
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

export default SocialAuth;
