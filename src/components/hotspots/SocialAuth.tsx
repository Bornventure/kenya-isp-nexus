
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface SocialAuthProps {
  selectedHotspot: string | null;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ selectedHotspot }) => {
  const socialProviders = [
    { name: 'Facebook', icon: Facebook, enabled: true, color: 'text-blue-600' },
    { name: 'Twitter', icon: Twitter, enabled: false, color: 'text-blue-400' },
    { name: 'Instagram', icon: Instagram, enabled: true, color: 'text-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, enabled: false, color: 'text-blue-700' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            Social Authentication
            {selectedHotspot && (
              <Badge variant="outline">
                Hotspot: {selectedHotspot}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialProviders.map((provider) => (
              <div key={provider.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <provider.icon className={`h-5 w-5 ${provider.color}`} />
                  <div>
                    <Label className="font-medium">{provider.name}</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to login with {provider.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={provider.enabled} />
                  <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                    {provider.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Authentication Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <Label className="font-medium">Data Collection</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Configure what user data to collect during social login
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="font-medium">Privacy Settings</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Manage user privacy and data handling preferences
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialAuth;
