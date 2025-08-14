
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NetworkStatusPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Status</h1>
        <p className="text-muted-foreground">
          Monitor real-time network status and health.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Network status monitoring will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStatusPage;
