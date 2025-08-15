
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Edit,
  Send,
  Users,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { useSMSTemplates } from '@/hooks/useSMSTemplates';
import { useClients } from '@/hooks/useClients';

const SMSTemplateManager: React.FC = () => {
  const { templates, updateTemplate, isUpdatingTemplate, sendBulkSMS, isSendingBulkSMS } = useSMSTemplates();
  const { clients } = useClients();
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editContent, setEditContent] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setEditContent(template.template_content);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateTemplate({
        id: editingTemplate.id,
        template_content: editContent,
      });
      setEditingTemplate(null);
      setEditContent('');
    }
  };

  const handleSendBulkSMS = () => {
    if (bulkMessage.trim() && selectedClients.length > 0) {
      const phoneNumbers = clients
        .filter(client => selectedClients.includes(client.id))
        .map(client => client.phone);

      sendBulkSMS({
        templateKey: 'general_broadcast',
        recipients: phoneNumbers,
        variables: { message: bulkMessage },
      });

      setBulkMessage('');
      setSelectedClients([]);
    }
  };

  const getTemplateDescription = (templateKey: string) => {
    const descriptions: Record<string, string> = {
      account_created: 'Sent when a new client account is created with installation payment details',
      service_renewed: 'Sent when a client\'s service is successfully renewed',
      balance_warning_3days: 'Sent 3 days before service expires due to low wallet balance',
      balance_warning_2days: 'Sent 2 days before service expires - urgent warning',
      balance_warning_1day: 'Final warning sent 1 day before service disconnection',
      service_disconnected: 'Sent when service is suspended due to insufficient balance',
      post_disconnect_reminder: 'Sent 3 days after service disconnection as reminder',
      network_issue: 'Sent to notify clients about network issues in their area',
      general_broadcast: 'Used for general announcements to all clients',
    };
    return descriptions[templateKey] || 'Custom template';
  };

  const getTemplateIcon = (templateKey: string) => {
    if (templateKey.includes('warning') || templateKey === 'service_disconnected') {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    if (templateKey === 'account_created' || templateKey === 'service_renewed') {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SMS Template Manager</h1>
        <Badge variant="outline" className="text-sm">
          {templates.length} Templates Available
        </Badge>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Manage Templates</TabsTrigger>
          <TabsTrigger value="broadcast">Bulk Messaging</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getTemplateIcon(template.template_key)}
                    {template.template_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={template.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {getTemplateDescription(template.template_key)}
                  </p>
                  
                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <p className="font-medium mb-1">Current Template:</p>
                    <p className="line-clamp-3">{template.template_content}</p>
                  </div>

                  {template.variables && template.variables.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable: string) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    className="w-full"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Bulk Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message Content
                </label>
                <Textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Type your message to send to selected clients..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Recipients ({selectedClients.length} selected)
                </label>
                <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClients(clients.map(c => c.id))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClients([])}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={client.id}
                        checked={selectedClients.includes(client.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClients([...selectedClients, client.id]);
                          } else {
                            setSelectedClients(selectedClients.filter(id => id !== client.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={client.id} className="text-sm cursor-pointer">
                        {client.name} - {client.phone}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSendBulkSMS}
                disabled={!bulkMessage.trim() || selectedClients.length === 0 || isSendingBulkSMS}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSendingBulkSMS ? 'Sending...' : `Send to ${selectedClients.length} Recipients`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Template: {editingTemplate?.template_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {editingTemplate && getTemplateDescription(editingTemplate.template_key)}
              </p>
              
              {editingTemplate?.variables && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {editingTemplate.variables.map((variable: string) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Template Content
              </label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                placeholder="Enter your template content with variables..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTemplate}
                disabled={isUpdatingTemplate}
              >
                {isUpdatingTemplate ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SMSTemplateManager;
