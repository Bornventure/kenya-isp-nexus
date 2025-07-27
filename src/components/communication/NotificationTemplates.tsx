
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Activity, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NotificationTemplatesList from './NotificationTemplatesList';
import NotificationTemplateEditor from './NotificationTemplateEditor';
import AutoNotificationSystem from './AutoNotificationSystem';

const NotificationTemplates = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sample templates - in real app, these would come from the database
  const [templates] = useState([
    {
      id: '1',
      name: 'Payment Confirmation',
      category: 'billing',
      trigger_event: 'payment_received',
      channels: ['email', 'sms'],
      email_template: {
        subject: 'Payment Confirmation - Receipt {receipt_number}',
        content: 'Dear {client_name}, your payment of KES {amount} has been received successfully. Receipt: {receipt_number}. Your service is now active until {expiry_date}.'
      },
      sms_template: {
        content: 'Dear {client_name}, payment of KES {amount} received. Receipt: {receipt_number}. Service active until {expiry_date}. Thank you!'
      },
      variables: ['client_name', 'amount', 'receipt_number', 'expiry_date'],
      is_active: true,
      auto_send: true
    },
    {
      id: '2',
      name: 'Service Renewal Reminder',
      category: 'service',
      trigger_event: 'payment_reminder',
      channels: ['email', 'sms'],
      email_template: {
        subject: 'Service Renewal Reminder - {days_remaining} days remaining',
        content: 'Dear {client_name}, your {package_name} service expires in {days_remaining} days. Please renew to continue enjoying uninterrupted service. Pay KES {amount} via M-PESA Paybill {paybill_number}, Account: {account_number}.'
      },
      sms_template: {
        content: 'Dear {client_name}, your service expires in {days_remaining} days. Pay KES {amount} via M-PESA {paybill_number}, Account: {account_number}.'
      },
      variables: ['client_name', 'package_name', 'days_remaining', 'amount', 'paybill_number', 'account_number'],
      is_active: true,
      auto_send: true
    },
    {
      id: '3',
      name: 'Welcome & Account Setup',
      category: 'account',
      trigger_event: 'client_registration',
      channels: ['email', 'sms'],
      email_template: {
        subject: 'Welcome to Our Network - Account Setup Complete',
        content: 'Dear {client_name}, welcome to our network! Your account has been successfully created. Installation is scheduled for {installation_date}. Your technician {technician_name} will contact you soon.'
      },
      sms_template: {
        content: 'Welcome {client_name}! Your account is ready. Installation scheduled for {installation_date}. Technician {technician_name} will contact you soon.'
      },
      variables: ['client_name', 'installation_date', 'technician_name'],
      is_active: true,
      auto_send: true
    },
    {
      id: '4',
      name: 'Service Suspension Notice',
      category: 'service',
      trigger_event: 'service_suspension',
      channels: ['email', 'sms'],
      email_template: {
        subject: 'Service Suspension Notice - Action Required',
        content: 'Dear {client_name}, your internet service has been suspended due to non-payment. Please pay KES {amount} to reactivate your service immediately. Contact support if you need assistance.'
      },
      sms_template: {
        content: 'Dear {client_name}, your service is suspended due to non-payment. Pay KES {amount} to reactivate. Contact support for help.'
      },
      variables: ['client_name', 'amount'],
      is_active: true,
      auto_send: true
    },
    {
      id: '5',
      name: 'Package Upgrade Confirmation',
      category: 'service',
      trigger_event: 'package_upgrade',
      channels: ['email', 'sms'],
      email_template: {
        subject: 'Package Upgrade Confirmation - {package_name}',
        content: 'Dear {client_name}, your package has been successfully upgraded to {package_name}. New monthly rate: KES {amount}. Enjoy faster speeds and improved service!'
      },
      sms_template: {
        content: 'Dear {client_name}, package upgraded to {package_name}. New rate: KES {amount}/month. Enjoy faster speeds!'
      },
      variables: ['client_name', 'package_name', 'amount'],
      is_active: true,
      auto_send: true
    },
    {
      id: '6',
      name: 'Network Maintenance Notice',
      category: 'network',
      trigger_event: 'network_maintenance',
      channels: ['email', 'sms'],
      email_template: {
        subject: 'Scheduled Network Maintenance - {maintenance_date}',
        content: 'Dear {client_name}, we will be conducting network maintenance on {maintenance_date} from {start_time} to {end_time}. Service may be temporarily unavailable. We apologize for any inconvenience.'
      },
      sms_template: {
        content: 'Network maintenance scheduled for {maintenance_date} {start_time}-{end_time}. Service may be temporarily unavailable. Sorry for inconvenience.'
      },
      variables: ['client_name', 'maintenance_date', 'start_time', 'end_time'],
      is_active: true,
      auto_send: false
    }
  ]);

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

  const handleDelete = (templateId: string) => {
    // In real app, this would delete from database
    toast({
      title: "Template Deleted",
      description: "Template has been deleted successfully",
    });
  };

  const handleToggleActive = (templateId: string, isActive: boolean) => {
    // In real app, this would update database
    toast({
      title: isActive ? "Template Activated" : "Template Deactivated",
      description: `Template has been ${isActive ? 'activated' : 'deactivated'}`,
    });
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
          </TabsList>

          <TabsContent value="templates">
            <NotificationTemplatesList
              templates={templates}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          </TabsContent>

          <TabsContent value="automation">
            <AutoNotificationSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationTemplates;
