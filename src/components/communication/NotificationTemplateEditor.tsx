
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Send, TestTube2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationTemplateEditorProps {
  template: any;
  onSave: (template: any) => void;
  onClose: () => void;
}

const NotificationTemplateEditor: React.FC<NotificationTemplateEditorProps> = ({
  template,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState(template || {
    name: '',
    category: '',
    trigger_event: '',
    channels: [],
    email_template: {
      subject: '',
      content: '',
      html_content: ''
    },
    sms_template: {
      content: ''
    },
    variables: [],
    is_active: true,
    auto_send: true
  });

  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const availableVariables = [
    'client_name', 'client_email', 'client_phone', 'amount', 'invoice_number',
    'due_date', 'expiry_date', 'service_period_start', 'service_period_end',
    'package_name', 'paybill_number', 'account_number', 'receipt_number',
    'remaining_balance', 'days_remaining', 'support_ticket_number',
    'installation_date', 'technician_name', 'payment_method'
  ];

  const triggerEvents = [
    { value: 'client_registration', label: 'Client Registration' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'service_expiry', label: 'Service Expiry' },
    { value: 'service_renewal', label: 'Service Renewal' },
    { value: 'service_suspension', label: 'Service Suspension' },
    { value: 'package_upgrade', label: 'Package Upgrade' },
    { value: 'package_downgrade', label: 'Package Downgrade' },
    { value: 'installation_scheduled', label: 'Installation Scheduled' },
    { value: 'installation_completed', label: 'Installation Completed' },
    { value: 'network_maintenance', label: 'Network Maintenance' },
    { value: 'support_ticket_created', label: 'Support Ticket Created' },
    { value: 'support_ticket_resolved', label: 'Support Ticket Resolved' },
    { value: 'account_setup', label: 'Account Setup' },
    { value: 'password_reset', label: 'Password Reset' }
  ];

  const handleSave = () => {
    onSave(formData);
    toast({
      title: "Template Saved",
      description: "Notification template has been saved successfully",
    });
  };

  const handleTestSend = () => {
    toast({
      title: "Test Sent",
      description: "Test notification has been sent to your registered email/phone",
    });
  };

  const insertVariable = (variable: string, field: 'email_subject' | 'email_content' | 'sms_content') => {
    const variableTag = `{${variable}}`;
    
    if (field === 'email_subject') {
      setFormData(prev => ({
        ...prev,
        email_template: {
          ...prev.email_template,
          subject: prev.email_template.subject + variableTag
        }
      }));
    } else if (field === 'email_content') {
      setFormData(prev => ({
        ...prev,
        email_template: {
          ...prev.email_template,
          content: prev.email_template.content + variableTag
        }
      }));
    } else if (field === 'sms_content') {
      setFormData(prev => ({
        ...prev,
        sms_template: {
          ...prev.sms_template,
          content: prev.sms_template.content + variableTag
        }
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notification Template Editor</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestSend}>
            <TestTube2 className="h-4 w-4 mr-2" />
            Test Send
          </Button>
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Template Configuration</CardTitle>
            <CardDescription>Configure the notification template settings and content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="trigger_event">Trigger Event</Label>
              <Select value={formData.trigger_event} onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_event: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger event" />
                </SelectTrigger>
                <SelectContent>
                  {triggerEvents.map(event => (
                    <SelectItem key={event.value} value={event.value}>{event.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Selection */}
            <div>
              <Label>Notification Channels</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-channel"
                    checked={formData.channels.includes('email')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData(prev => ({ ...prev, channels: [...prev.channels, 'email'] }));
                      } else {
                        setFormData(prev => ({ ...prev, channels: prev.channels.filter(c => c !== 'email') }));
                      }
                    }}
                  />
                  <Label htmlFor="email-channel">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms-channel"
                    checked={formData.channels.includes('sms')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData(prev => ({ ...prev, channels: [...prev.channels, 'sms'] }));
                      } else {
                        setFormData(prev => ({ ...prev, channels: prev.channels.filter(c => c !== 'sms') }));
                      }
                    }}
                  />
                  <Label htmlFor="sms-channel">SMS</Label>
                </div>
              </div>
            </div>

            {/* Template Content */}
            <Tabs defaultValue="email" className="w-full">
              <TabsList>
                <TabsTrigger value="email">Email Template</TabsTrigger>
                <TabsTrigger value="sms">SMS Template</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <div>
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    value={formData.email_template.subject}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      email_template: { ...prev.email_template, subject: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email-content">Email Content</Label>
                  <Textarea
                    id="email-content"
                    rows={8}
                    value={formData.email_template.content}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      email_template: { ...prev.email_template, content: e.target.value }
                    }))}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="sms" className="space-y-4">
                <div>
                  <Label htmlFor="sms-content">SMS Content</Label>
                  <Textarea
                    id="sms-content"
                    rows={4}
                    value={formData.sms_template.content}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      sms_template: { ...prev.sms_template, content: e.target.value }
                    }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Character count: {formData.sms_template.content.length}/160
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Auto-send Settings */}
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-send"
                checked={formData.auto_send}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_send: checked }))}
              />
              <Label htmlFor="auto-send">Automatically send when triggered</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Variables</CardTitle>
            <CardDescription>Click to insert into template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableVariables.map(variable => (
                <div key={variable} className="flex flex-wrap gap-1">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => insertVariable(variable, 'email_subject')}
                  >
                    {variable}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationTemplateEditor;
