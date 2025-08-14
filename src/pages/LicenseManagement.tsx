
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LicenseManagementPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">License Management</h1>
        <p className="text-muted-foreground">
          Manage software licenses and subscriptions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>License Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>License management features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseManagementPage;
