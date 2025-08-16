
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSMSTemplates } from '@/hooks/useSMSTemplates';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Settings, Users, Plus, Edit2 } from 'lucide-react';

const defaultTemplates = [
  {
    key: 'account_created',
    name: 'Account Created',
    content: 'Welcome {name}! Your account has been created. Installation invoice: KES {amount}. Pay via M-Pesa Paybill {paybill}, Account: {phone}. Ref: {invoice_number}',
    variables: ['name', 'amount', 'paybill', 'phone', 'invoice_number']
  },
  {
    key: 'service_renewal_success',
    name: 'Service Renewal Success',
    content: 'Hi {name}, your internet service has been renewed successfully. Expires: {expiry_date}. Current balance: KES {balance}',
    variables: ['name', 'expiry_date', 'balance']
  },
  {
    key: 'low_balance_3_days',
    name: 'Low Balance - 3 Days Warning',
    content: 'Hi {name}, your service expires in 3 days ({expiry_date}). Top up KES {required_amount} to avoid disconnection. Paybill: {paybill}, Account: {phone}',
    variables: ['name', 'expiry_date', 'required_amount', 'paybill', 'phone']
  },
  {
    key: 'low_balance_2_days',
    name: 'Low Balance - 2 Days Warning',
    content: 'URGENT: Hi {name}, your service expires in 2 days ({expiry_date}). Top up KES {required_amount} now. Paybill: {paybill}, Account: {phone}',
    variables: ['name', 'expiry_date', 'required_amount', 'paybill', 'phone']
  },
  {
    key: 'low_balance_1_day',
    name: 'Low Balance - 1 Day Warning',
    content: 'FINAL NOTICE: Hi {name}, your service expires tomorrow ({expiry_date}). Top up KES {required_amount} immediately. Paybill: {paybill}, Account: {phone}',
    variables: ['name', 'expiry_date', 'required_amount', 'paybill', 'phone']
  },
  {
    key: 'service_disconnected',
    name: 'Service Disconnected',
    content: 'Hi {name}, your internet service has been suspended due to insufficient balance. Top up KES {required_amount} for immediate reactivation. Paybill: {paybill}, Account: {phone}',
    variables: ['name', 'required_amount', 'paybill', 'phone']
  },
  {
    key: 'disconnection_reminder_3_days',
    name: 'Post-Disconnection Reminder',
    content: 'Hi {name}, it\'s been 3 days since your service was suspended. Renew now to continue enjoying our internet service. Top up: KES {required_amount}',
    variables: ['name', 'required_amount']
  },
  {
    key: 'network_issues',
    name: 'Network Issues Alert',
    content: 'Hi {name}, we\'re experiencing network issues in your area. Our team is working to resolve this. Expected resolution: {eta}. Sorry for the inconvenience.',
    variables: ['name', 'eta']
  }
];

const SMSTemplateManager: React.FC = () => {
  const { templates, updateTemplate, sendBulkSMS, isUpdatingTemplate, isSendingBulkSMS } = useSMSTemplates();
  const { toast } = useToast();
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [bulkMessageDialog, setBulkMessageDialog] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkRecipients, setBulkRecipients] = useState('');

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      await updateTemplate({
        id: editingTemplate.id,
        template_content: editingTemplate.template_content,
        is_active: true
      });
      
      setEditDialog(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleBulkSMS = async () => {
    if (!bulkMessage.trim() || !bulkRecipients.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both message and recipients",
        variant: "destructive",
      });
      return;
    }

    const recipients = bulkRecipients.split('\n').map(phone => phone.trim()).filter(phone => phone);
    
    try {
      await sendBulkSMS({
        templateKey: 'bulk_message',
        recipients,
        variables: { message: bulkMessage }
      });
      
      setBulkMessageDialog(false);
      setBulkMessage('');
      setBulkRecipients('');
    } catch (error) {
      console.error('Failed to send bulk SMS:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SMS Template Management</h1>
        <div className="flex gap-2">
          <Dialog open={bulkMessageDialog} onOpenChange={setBulkMessageDialog}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Bulk SMS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send Bulk SMS</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-message">Message</Label>
                  <Textarea
                    id="bulk-message"
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-recipients">Recipients (one phone per line)</Label>
                  <Textarea
                    id="bulk-recipients"
                    value={bulkRecipients}
                    onChange={(e) => setBulkRecipients(e.target.value)}
                    placeholder="+254712345678&#10;+254723456789"
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={handleBulkSMS} 
                  disabled={isSendingBulkSMS}
                  className="w-full"
                >
                  {isSendingBulkSMS ? 'Sending...' : 'Send SMS'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Settings className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {defaultTemplates.map((template) => {
              const existingTemplate = templates.find(t => t.template_key === template.key);
              return (
                <Card key={template.key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={existingTemplate?.is_active ? "default" : "secondary"}>
                          {existingTemplate?.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTemplate({
                              ...existingTemplate,
                              template_key: template.key,
                              template_name: template.name,
                              template_content: existingTemplate?.template_content || template.content,
                              variables: template.variables
                            });
                            setEditDialog(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {existingTemplate?.template_content || template.content}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated SMS Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Account Creation</h4>
                  <p className="text-sm text-muted-foreground">
                    Sent automatically when a new client account is approved
                  </p>
                  <Badge className="mt-2" variant="default">Active</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Service Renewal</h4>
                  <p className="text-sm text-muted-foreground">
                    Sent when service is successfully renewed from wallet balance
                  </p>
                  <Badge className="mt-2" variant="default">Active</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Low Balance Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Progressive warnings sent 3, 2, and 1 days before service expiration
                  </p>
                  <Badge className="mt-2" variant="default">Active</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Service Disconnection</h4>
                  <p className="text-sm text-muted-foreground">
                    Sent when service is suspended due to insufficient balance
                  </p>
                  <Badge className="mt-2" variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SMS Template</DialogTitle>
          </DialogHeader>
          
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={editingTemplate.template_name}
                  readOnly
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="template-content">Message Template</Label>
                <Textarea
                  id="template-content"
                  value={editingTemplate.template_content}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    template_content: e.target.value
                  })}
                  rows={5}
                  placeholder="Enter your message template..."
                />
              </div>
              
              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {editingTemplate.variables?.map((variable: string) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {`{${variable}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateTemplate}
                  disabled={isUpdatingTemplate}
                  className="flex-1"
                >
                  {isUpdatingTemplate ? 'Saving...' : 'Save Template'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SMSTemplateManager;
