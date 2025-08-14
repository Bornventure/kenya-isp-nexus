
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DeveloperPortalPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
        <p className="text-muted-foreground">
          API documentation and developer tools.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Developer Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Developer portal features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperPortalPage;
