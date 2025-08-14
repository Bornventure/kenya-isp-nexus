
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SystemInfrastructurePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Infrastructure</h1>
        <p className="text-muted-foreground">
          Manage system infrastructure and resources.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>System infrastructure management will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemInfrastructurePage;
