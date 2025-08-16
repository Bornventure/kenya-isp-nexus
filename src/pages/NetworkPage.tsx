
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';

const NetworkPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network</h1>
        <p className="text-muted-foreground">
          Monitor network infrastructure and performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5" />
            Network Monitoring
          </CardTitle>
          <CardDescription>
            Track network performance and connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Network monitoring functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkPage;
