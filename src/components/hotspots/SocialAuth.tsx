
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Settings,
  Users,
  TrendingUp,
  Eye
} from 'lucide-react';

interface SocialProvider {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  isEnabled: boolean;
  appId?: string;
  appSecret?: string;
  permissions: string[];
  userCount: number;
  conversionRate: number;
}

interface SocialAuthProps {
  selectedHotspot: string | null;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ selectedHotspot }) => {
  const [socialProviders, setSocialProviders] = useState<SocialProvider[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      isEnabled: true,
      appId: 'your-facebook-app-id',
      permissions: ['email', 'public_profile'],
      userCount: 1247,
      conversionRate: 67.3
    },
    {
      id: 'google',
      name: 'Google',
      icon: () => <div className="w-5 h-5 bg-red-500 rounded">G</div>,
      isEnabled: true,
      appId: 'your-google-client-id',
      permissions: ['email', 'profile'],
      userCount: 892,
      conversionRate: 74.8
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      isEnabled: false,
      permissions: ['email'],
      userCount: 234,
      conversionRate: 45.2
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      isEnabled: false,
      permissions: ['email', 'basic'],
      userCount: 567,
      conversionRate: 52.1
    }
  ]);

  const [termsUrl, setTermsUrl] = useState('https://yoursite.com/terms');
  const [privacyUrl, setPrivacyUrl] = useState('https://yoursite.com/privacy');

  const toggleProvider = (providerId: string) => {
    setSocialProviders(prev => 
      prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, isEnabled: !provider.isEnabled }
          : provider
      )
    );
  };

  const updateProviderConfig = (providerId: string, field: string, value: string) => {
    setSocialProviders(prev => 
      prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, [field]: value }
          : provider
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Social Media Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Allow guests to connect using their social media accounts
          </p>
        </div>
      </div>

      {/* Provider Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {socialProviders.map((provider) => {
          const IconComponent = provider.icon;
          return (
            <Card key={provider.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6" />
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={provider.isEnabled ? "default" : "secondary"}>
                      {provider.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={provider.isEnabled}
                      onCheckedChange={() => toggleProvider(provider.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Configuration */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">App ID / Client ID</label>
                      <Input
                        value={provider.appId || ''}
                        onChange={(e) => updateProviderConfig(provider.id, 'appId', e.target.value)}
                        placeholder={`Enter ${provider.name} App ID`}
                        disabled={!provider.isEnabled}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">App Secret / Client Secret</label>
                      <Input
                        type="password"
                        value={provider.appSecret || ''}
                        onChange={(e) => updateProviderConfig(provider.id, 'appSecret', e.target.value)}
                        placeholder={`Enter ${provider.name} App Secret`}
                        disabled={!provider.isEnabled}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="text-sm font-medium">Permissions</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-lg font-bold text-blue-600">{provider.userCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">{provider.conversionRate}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Conversion Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Terms of Service URL</label>
                <Input
                  value={termsUrl}
                  onChange={(e) => setTermsUrl(e.target.value)}
                  placeholder="https://yoursite.com/terms"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Privacy Policy URL</label>
                <Input
                  value={privacyUrl}
                  onChange={(e) => setPrivacyUrl(e.target.value)}
                  placeholder="https://yoursite.com/privacy"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Require Email Verification</p>
                  <p className="text-xs text-muted-foreground">Send verification email after social login</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-create Accounts</p>
                  <p className="text-xs text-muted-foreground">Automatically create user accounts for social logins</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Collect Marketing Data</p>
                  <p className="text-xs text-muted-foreground">Use social data for marketing insights</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Login Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Login Page Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto p-6 border rounded-lg bg-gray-50">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">Welcome to WiFi</h3>
              <p className="text-sm text-muted-foreground">Connect with your social account</p>
            </div>
            
            <div className="space-y-3">
              {socialProviders.filter(p => p.isEnabled).map((provider) => {
                const IconComponent = provider.icon;
                return (
                  <Button key={provider.id} variant="outline" className="w-full">
                    <IconComponent className="h-4 w-4 mr-2" />
                    Continue with {provider.name}
                  </Button>
                );
              })}
            </div>

            <div className="text-center mt-4">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href={termsUrl} className="text-blue-600 hover:underline">Terms</a>
                {' '}and{' '}
                <a href={privacyUrl} className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Social Authentication Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {socialProviders.reduce((sum, p) => sum + p.userCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Social Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {(socialProviders.reduce((sum, p) => sum + p.conversionRate, 0) / socialProviders.length).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Conversion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {socialProviders.filter(p => p.isEnabled).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Providers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">342</p>
              <p className="text-sm text-muted-foreground">Today's Logins</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialAuth;
