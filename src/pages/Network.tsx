
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NetworkPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network</h1>
        <p className="text-muted-foreground">
          Monitor and configure network settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Network management features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkPage;
