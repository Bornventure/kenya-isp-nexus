
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Wifi, Shield } from 'lucide-react';

interface RoamingManagerProps {
  selectedHotspot: string | null;
}

const RoamingManager: React.FC<RoamingManagerProps> = ({ selectedHotspot }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Roaming Configuration
            {selectedHotspot && (
              <Badge variant="outline">
                Hotspot: {selectedHotspot}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-4 w-4" />
                <span className="font-medium">Seamless Roaming</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Users can move between access points without disconnection
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Cross-Hotspot Authentication</span>
                <Badge variant="secondary">Configured</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Authenticated users can access partner hotspot networks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roaming Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Partner network management and roaming agreements will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoamingManager;
