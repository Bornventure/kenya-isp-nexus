
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Edit, 
  Plus, 
  Users,
  Bell
} from 'lucide-react';
import { useNotificationTemplates, NotificationTemplate } from '@/hooks/useNotificationTemplates';

const NotificationTemplatesManager: React.FC = () => {
  const { 
    templates, 
    isLoading, 
    updateTemplate, 
    createTemplate, 
    sendBroadcast,
    isUpdating,
    isCreating,
    isSending
  } = useNotificationTemplates();

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastChannels, setBroadcastChannels] = useState(['sms']);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'sms',
    trigger_event: '',
    message_template: '',
    variables: [] as string[],
    is_active: true
  });

  const triggerEvents = [
    { value: 'account_creation', label: 'Account Creation' },
    { value: 'renewal_confirmation', label: 'Service Renewal' },
    { value: 'payment_reminder_3_days', label: 'Payment Reminder (3 Days)' },
    { value: 'payment_reminder_2_days', label: 'Payment Reminder (2 Days)' },
    { value: 'payment_reminder_1_day', label: 'Payment Reminder (1 Day)' },
    { value: 'service_disconnection', label: 'Service Disconnection' },
    { value: 'post_disconnection_reminder', label: 'Post-Disconnection Reminder' },
    { value: 'network_maintenance', label: 'Network Maintenance' },
    { value: 'package_upgrade', label: 'Package Upgrade' },
    { value: 'welcome_message', label: 'Welcome Message' }
  ];

  const availableVariables = [
    '{{client_name}}', '{{company_name}}', '{{amount}}', '{{expiry_date}}',
    '{{wallet_balance}}', '{{package_name}}', '{{invoice_number}}', 
    '{{tracking_number}}', '{{paybill_number}}', '{{client_phone}}',
    '{{service_period}}', '{{maintenance_date}}', '{{disconnection_date}}'
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate) {
      updateTemplate({ 
        id: editingTemplate.id, 
        updates: editingTemplate 
      });
      setEditingTemplate(null);
    }
  };

  const handleCreateTemplate = () => {
    createTemplate(newTemplate);
    setNewTemplate({
      name: '',
      category: 'sms',
      trigger_event: '',
      message_template: '',
      variables: [],
      is_active: true
    });
  };

  const handleSendBroadcast = () => {
    if (broadcastMessage.trim()) {
      sendBroadcast({ 
        message: broadcastMessage, 
        channels: broadcastChannels 
      });
      setBroadcastMessage('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Notification Templates</h2>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Send Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Broadcast Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Enter your broadcast message..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Channels</label>
                  <div className="flex gap-2 mt-2">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={broadcastChannels.includes('sms')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBroadcastChannels([...broadcastChannels, 'sms']);
                          } else {
                            setBroadcastChannels(broadcastChannels.filter(c => c !== 'sms'));
                          }
                        }}
                      />
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={broadcastChannels.includes('email')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBroadcastChannels([...broadcastChannels, 'email']);
                          } else {
                            setBroadcastChannels(broadcastChannels.filter(c => c !== 'email'));
                          }
                        }}
                      />
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </label>
                  </div>
                </div>
                <Button 
                  onClick={handleSendBroadcast}
                  disabled={!broadcastMessage.trim() || broadcastChannels.length === 0 || isSending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Broadcast
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      placeholder="e.g., Payment Reminder"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Trigger Event</label>
                  <Select value={newTemplate.trigger_event} onValueChange={(value) => setNewTemplate({...newTemplate, trigger_event: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger event" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerEvents.map(event => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message Template</label>
                  <Textarea
                    placeholder="Enter your template message..."
                    value={newTemplate.message_template}
                    onChange={(e) => setNewTemplate({...newTemplate, message_template: e.target.value})}
                    rows={4}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {availableVariables.map(variable => (
                      <Badge 
                        key={variable}
                        variant="outline" 
                        className="cursor-pointer text-xs"
                        onClick={() => setNewTemplate({
                          ...newTemplate, 
                          message_template: newTemplate.message_template + variable
                        })}
                      >
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleCreateTemplate}
                  disabled={!newTemplate.name || !newTemplate.trigger_event || !newTemplate.message_template || isCreating}
                  className="w-full"
                >
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  {template.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Template</DialogTitle>
                      </DialogHeader>
                      {editingTemplate && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Template Name</label>
                            <Input
                              value={editingTemplate.name}
                              onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Message Template</label>
                            <Textarea
                              value={editingTemplate.message_template}
                              onChange={(e) => setEditingTemplate({...editingTemplate, message_template: e.target.value})}
                              rows={4}
                            />
                            <div className="flex flex-wrap gap-1 mt-2">
                              {availableVariables.map(variable => (
                                <Badge 
                                  key={variable}
                                  variant="outline" 
                                  className="cursor-pointer text-xs"
                                  onClick={() => setEditingTemplate({
                                    ...editingTemplate, 
                                    message_template: editingTemplate.message_template + variable
                                  })}
                                >
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={editingTemplate.is_active}
                              onCheckedChange={(checked) => setEditingTemplate({...editingTemplate, is_active: checked})}
                            />
                            <label className="text-sm font-medium">Template Active</label>
                          </div>
                          <Button 
                            onClick={handleUpdateTemplate}
                            disabled={isUpdating}
                            className="w-full"
                          >
                            Update Template
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Trigger:</span>
                  <Badge variant="outline">{triggerEvents.find(e => e.value === template.trigger_event)?.label || template.trigger_event}</Badge>
                </div>
                <div className="text-sm bg-muted p-3 rounded-lg">
                  {template.message_template}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationTemplatesManager;
