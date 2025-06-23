
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationTemplates from '@/components/communication/NotificationTemplates';
import BulkCommunication from '@/components/communication/BulkCommunication';
import NotificationPreferences from '@/components/support/NotificationPreferences';
import ApiSettings from '@/components/settings/ApiSettings';

const CommunicationCenter = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication Center</h1>
          <p className="text-muted-foreground">
            Manage notifications, templates, and communication settings.
          </p>
        </div>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Communication</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="api">API Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <NotificationTemplates />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <BulkCommunication />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <ApiSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunicationCenter;
