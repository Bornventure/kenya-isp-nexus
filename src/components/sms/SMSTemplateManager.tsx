
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, Edit, Save, Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  category: 'account' | 'payment' | 'service' | 'general';
  variables: string[];
}

const SMSTemplateManager: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SMSTemplate[]>([
    {
      id: '1',
      name: 'Account Created',
      content: 'Welcome {clientName}! Your account has been created. Installation payment: KSh {amount}. Pay to Paybill: {paybill}, Account: {phone}. Invoice: {invoiceNumber}',
      category: 'account',
      variables: ['clientName', 'amount', 'paybill', 'phone', 'invoiceNumber']
    },
    {
      id: '2',
      name: 'Service Renewal Success',
      content: 'Hi {clientName}, your internet service has been renewed successfully. New expiry date: {expiryDate}. Thank you for your payment!',
      category: 'service',
      variables: ['clientName', 'expiryDate']
    },
    {
      id: '3',
      name: 'Low Balance Warning - 3 Days',
      content: 'Dear {clientName}, your service expires in 3 days ({expiryDate}). Please top up KSh {amount} to avoid disconnection. Paybill: {paybill}, Account: {phone}',
      category: 'payment',
      variables: ['clientName', 'expiryDate', 'amount', 'paybill', 'phone']
    },
    {
      id: '4',
      name: 'Low Balance Warning - 2 Days',
      content: 'URGENT: {clientName}, your service expires in 2 days ({expiryDate}). Top up KSh {amount} now to continue enjoying our service. Paybill: {paybill}, Account: {phone}',
      category: 'payment',
      variables: ['clientName', 'expiryDate', 'amount', 'paybill', 'phone']
    },
    {
      id: '5',
      name: 'Low Balance Warning - 1 Day',
      content: 'FINAL NOTICE: {clientName}, your service expires tomorrow ({expiryDate}). Pay KSh {amount} immediately to avoid disconnection. Paybill: {paybill}, Account: {phone}',
      category: 'payment',
      variables: ['clientName', 'expiryDate', 'amount', 'paybill', 'phone']
    },
    {
      id: '6',
      name: 'Service Disconnected',
      content: 'Hi {clientName}, your internet service has been suspended due to non-payment. Pay KSh {amount} for immediate reactivation. Paybill: {paybill}, Account: {phone}',
      category: 'service',
      variables: ['clientName', 'amount', 'paybill', 'phone']
    },
    {
      id: '7',
      name: 'Post-Disconnection Reminder',
      content: '{clientName}, it\'s been 3 days since your service was suspended. Renew now to continue enjoying high-speed internet. Pay KSh {amount} to Paybill: {paybill}, Account: {phone}',
      category: 'service',
      variables: ['clientName', 'amount', 'paybill', 'phone']
    }
  ]);

  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<SMSTemplate>>({
    name: '',
    content: '',
    category: 'general',
    variables: []
  });

  const [bulkMessage, setBulkMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      setEditingTemplate(null);
      toast({
        title: "Template Updated",
        description: "SMS template has been updated successfully",
      });
    }
  };

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.content && newTemplate.category) {
      const template: SMSTemplate = {
        id: Date.now().toString(),
        name: newTemplate.name,
        content: newTemplate.content,
        category: newTemplate.category as SMSTemplate['category'],
        variables: extractVariables(newTemplate.content)
      };
      setTemplates(prev => [...prev, template]);
      setNewTemplate({ name: '', content: '', category: 'general', variables: [] });
      toast({
        title: "Template Created",
        description: "New SMS template has been created successfully",
      });
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleSendBulkMessage = () => {
    if (bulkMessage.trim()) {
      console.log('Sending bulk message:', bulkMessage, 'to category:', selectedCategory);
      toast({
        title: "Bulk Message Sent",
        description: `Message sent to all clients${selectedCategory !== 'all' ? ` in ${selectedCategory} category` : ''}`,
      });
      setBulkMessage('');
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'account': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-red-100 text-red-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SMS Template Manager</h1>
        <p className="text-muted-foreground">
          Manage automated SMS templates and send bulk messages
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="create">Create Template</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Messaging</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getCategoryBadgeColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingTemplate?.id === template.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-content">Message Content</Label>
                        <Textarea
                          id="edit-content"
                          value={editingTemplate.content}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            content: e.target.value,
                            variables: extractVariables(e.target.value)
                          })}
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={handleSaveTemplate}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">{template.content}</p>
                      {template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-2">Variables:</span>
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Create New Template
              </CardTitle>
              <CardDescription>
                Create a new SMS template with dynamic variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value as SMSTemplate['category'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-content">Message Content</Label>
                <Textarea
                  id="template-content"
                  value={newTemplate.content || ''}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    content: e.target.value,
                    variables: extractVariables(e.target.value)
                  })}
                  placeholder="Enter message content (use {variableName} for dynamic content)"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use curly braces for variables: {'{clientName}'}, {'{amount}'}, {'{date}'}
                </p>
              </div>

              {newTemplate.content && newTemplate.variables && newTemplate.variables.length > 0 && (
                <div>
                  <Label>Detected Variables</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {newTemplate.variables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleCreateTemplate} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Bulk Messaging
              </CardTitle>
              <CardDescription>
                Send messages to all clients or specific categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipient-category">Recipient Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="active">Active Clients</SelectItem>
                    <SelectItem value="suspended">Suspended Clients</SelectItem>
                    <SelectItem value="pending">Pending Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulk-message">Message</Label>
                <Textarea
                  id="bulk-message"
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Enter your message to send to clients"
                  rows={4}
                />
              </div>

              <Button onClick={handleSendBulkMessage} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Bulk Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SMSTemplateManager;
