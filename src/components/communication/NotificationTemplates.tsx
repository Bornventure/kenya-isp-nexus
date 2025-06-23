
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Save, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  category: string;
  subject?: string;
  content: string;
  variables: string[];
}

const NotificationTemplates = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [templates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Payment Reminder',
      type: 'email',
      category: 'billing',
      subject: 'Payment Reminder - Invoice {invoice_number}',
      content: 'Dear {client_name}, your payment for invoice {invoice_number} is due on {due_date}.',
      variables: ['client_name', 'invoice_number', 'due_date', 'amount']
    },
    {
      id: '2',
      name: 'Service Activation',
      type: 'sms',
      category: 'service',
      content: 'Hello {client_name}, your internet service has been activated. Welcome to our network!',
      variables: ['client_name', 'service_type']
    },
  ]);

  const handleSaveTemplate = () => {
    toast({
      title: "Template Saved",
      description: "Notification template has been updated successfully",
    });
    setIsEditing(false);
  };

  const handleDeleteTemplate = (id: string) => {
    toast({
      title: "Template Deleted",
      description: "Notification template has been removed",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Template List */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>
            Manage email and SMS templates for automated communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{template.name}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={template.type === 'email' ? 'default' : 'secondary'}>
                    {template.type === 'email' ? <Mail className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
                    {template.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.subject || template.content}
              </p>
            </div>
          ))}
          
          <Button className="w-full" variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </CardContent>
      </Card>

      {/* Template Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedTemplate ? 'Edit Template' : 'Select a Template'}
            </CardTitle>
            {selectedTemplate && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTemplate ? (
            <>
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={selectedTemplate.name}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateType">Type</Label>
                  <Select value={selectedTemplate.type} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="templateCategory">Category</Label>
                  <Select value={selectedTemplate.category} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTemplate.type === 'email' && (
                <div>
                  <Label htmlFor="templateSubject">Subject</Label>
                  <Input
                    id="templateSubject"
                    value={selectedTemplate.subject || ''}
                    disabled={!isEditing}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="templateContent">Content</Label>
                <Textarea
                  id="templateContent"
                  value={selectedTemplate.content}
                  disabled={!isEditing}
                  rows={6}
                />
              </div>

              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{${variable}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              {isEditing && (
                <Button onClick={handleSaveTemplate} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select a template from the list to view or edit it
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTemplates;
