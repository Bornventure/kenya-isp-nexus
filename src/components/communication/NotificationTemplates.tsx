
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Activity, Mail, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NotificationTemplatesList from './NotificationTemplatesList';
import NotificationTemplateEditor from './NotificationTemplateEditor';
import AutoNotificationSystem from './AutoNotificationSystem';
import BulkCommunication from './BulkCommunication';

const NotificationTemplates = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsEditing(true);
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSave = (template: any) => {
    // In real app, this would save to database
    toast({
      title: "Template Saved",
      description: "Notification template has been saved successfully",
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="container mx-auto p-6">
        <NotificationTemplateEditor
          template={selectedTemplate}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communication Templates</h1>
            <p className="text-muted-foreground">
              Manage automated email and SMS templates for client notifications
            </p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates" className="gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Activity className="h-4 w-4" />
              Auto-System
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="gap-2">
              <Send className="h-4 w-4" />
              Broadcast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <NotificationTemplatesList onEdit={handleEdit} />
          </TabsContent>

          <TabsContent value="automation">
            <AutoNotificationSystem />
          </TabsContent>

          <TabsContent value="broadcast">
            <BulkCommunication />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationTemplates;
