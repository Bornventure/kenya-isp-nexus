
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationTemplate {
  id?: string;
  name: string;
  category: string;
  trigger_event: string;
  subject: string;
  email_template: string;
  sms_template: string;
  variables: string[];
  is_active: boolean;
  channels: string[];
}

interface NotificationTemplateEditorProps {
  template: NotificationTemplate | null;
  onSave: (template: NotificationTemplate) => void;
  onClose: () => void;
}

const NotificationTemplateEditor: React.FC<NotificationTemplateEditorProps> = ({
  template,
  onSave,
  onClose
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<NotificationTemplate>({
    name: '',
    category: 'billing',
    trigger_event: 'payment_received',
    subject: '',
    email_template: '',
    sms_template: '',
    variables: [],
    is_active: true,
    channels: ['email', 'sms']
  });

  const [newVariable, setNewVariable] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData(template);
    }
  }, [template]);

  const categories = [
    { value: 'billing', label: 'Billing' },
    { value: 'service', label: 'Service' },
    { value: 'support', label: 'Support' },
    { value: 'account', label: 'Account' },
    { value: 'network', label: 'Network' }
  ];

  const triggerEvents = [
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'service_expiry', label: 'Service Expiry' },
    { value: 'service_renewal', label: 'Service Renewal' },
    { value: 'service_suspension', label: 'Service Suspension' },
    { value: 'client_registration', label: 'Client Registration' },
    { value: 'package_upgrade', label: 'Package Upgrade' },
    { value: 'network_maintenance', label: 'Network Maintenance' }
  ];

  const handleInputChange = (field: keyof NotificationTemplate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const addVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()]
      }));
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.channels.length === 0) {
      toast({
        title: "Error",
        description: "At least one channel must be selected",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('isp_company_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const templateData = {
        ...formData,
        isp_company_id: userProfile?.isp_company_id
      };

      if (template?.id) {
        const { error } = await supabase
          .from('notification_templates')
          .update(templateData)
          .eq('id', template.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_templates')
          .insert(templateData);

        if (error) throw error;
      }

      onSave(formData);
      toast({
        title: "Success",
        description: "Template saved successfully"
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter template name"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trigger_event">Trigger Event</Label>
              <Select value={formData.trigger_event} onValueChange={(value) => handleInputChange('trigger_event', value)}>
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
              <Label>Channels</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={formData.channels.includes('email')}
                    onCheckedChange={(checked) => handleChannelChange('email', checked as boolean)}
                  />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms"
                    checked={formData.channels.includes('sms')}
                    onCheckedChange={(checked) => handleChannelChange('sms', checked as boolean)}
                  />
                  <Label htmlFor="sms">SMS</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </CardContent>
        </Card>

        {/* Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Template Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                placeholder="Enter variable name"
                onKeyPress={(e) => e.key === 'Enter' && addVariable()}
              />
              <Button onClick={addVariable} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.variables.map(variable => (
                <Badge key={variable} variant="secondary" className="gap-1">
                  {variable}
                  <button onClick={() => removeVariable(variable)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Template */}
      {formData.channels.includes('email') && (
        <Card>
          <CardHeader>
            <CardTitle>Email Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Email subject"
              />
            </div>

            <div>
              <Label htmlFor="email_template">Email Content</Label>
              <Textarea
                id="email_template"
                value={formData.email_template}
                onChange={(e) => handleInputChange('email_template', e.target.value)}
                placeholder="Email template content"
                rows={8}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMS Template */}
      {formData.channels.includes('sms') && (
        <Card>
          <CardHeader>
            <CardTitle>SMS Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="sms_template">SMS Content</Label>
              <Textarea
                id="sms_template"
                value={formData.sms_template}
                onChange={(e) => handleInputChange('sms_template', e.target.value)}
                placeholder="SMS template content"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationTemplateEditor;
