
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorManagement from '@/components/infrastructure/ErrorManagement';
import FileManagement from '@/components/infrastructure/FileManagement';

const SystemInfrastructure = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Infrastructure</h1>
          <p className="text-muted-foreground">
            Monitor system health, manage files, and track performance.
          </p>
        </div>

        <Tabs defaultValue="errors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="errors">Error Management</TabsTrigger>
            <TabsTrigger value="files">File Management</TabsTrigger>
            <TabsTrigger value="performance">Performance Monitor</TabsTrigger>
            <TabsTrigger value="caching">Caching</TabsTrigger>
          </TabsList>

          <TabsContent value="errors" className="space-y-4">
            <ErrorManagement />
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <FileManagement />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Performance monitoring dashboard coming soon...
            </div>
          </TabsContent>

          <TabsContent value="caching" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Caching configuration coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemInfrastructure;
