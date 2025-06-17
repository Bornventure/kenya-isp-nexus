
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Phone, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreference {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  notification_types: string[];
}

const NotificationPreferences = () => {
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<NotificationPreference>({
    id: '1',
    user_id: 'current-user',
    email_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: true,
    notification_types: ['ticket_assigned', 'ticket_escalated', 'sla_breach']
  });

  const notificationTypes = [
    { id: 'ticket_assigned', label: 'Ticket Assigned', description: 'When a ticket is assigned to you' },
    { id: 'ticket_escalated', label: 'Ticket Escalated', description: 'When a ticket is escalated' },
    { id: 'sla_breach', label: 'SLA Breach', description: 'When SLA is about to be breached' },
    { id: 'new_comment', label: 'New Comments', description: 'When someone comments on your tickets' },
    { id: 'status_change', label: 'Status Changes', description: 'When ticket status is updated' },
    { id: 'priority_change', label: 'Priority Changes', description: 'When ticket priority is changed' },
  ];

  const handleChannelToggle = (channel: keyof NotificationPreference) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };

  const handleTypeToggle = (typeId: string) => {
    setPreferences(prev => ({
      ...prev,
      notification_types: prev.notification_types.includes(typeId)
        ? prev.notification_types.filter(id => id !== typeId)
        : [...prev.notification_types, typeId]
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    toast({
      title: "Success",
      description: "Notification preferences updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Configure how you want to be notified about ticket updates
        </p>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <Label htmlFor="email-notifications" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={() => handleChannelToggle('email_notifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <Label htmlFor="sms-notifications" className="text-base font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
            </div>
            <Switch
              id="sms-notifications"
              checked={preferences.sms_notifications}
              onCheckedChange={() => handleChannelToggle('sms_notifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <Label htmlFor="whatsapp-notifications" className="text-base font-medium">
                  WhatsApp Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via WhatsApp
                </p>
              </div>
            </div>
            <Switch
              id="whatsapp-notifications"
              checked={preferences.whatsapp_notifications}
              onCheckedChange={() => handleChannelToggle('whatsapp_notifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notificationTypes.map((type) => (
              <div
                key={type.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  preferences.notification_types.includes(type.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTypeToggle(type.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{type.label}</h4>
                  {preferences.notification_types.includes(type.id) && (
                    <Badge variant="default">Enabled</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Channels Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Active Notification Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Active Channels:</h4>
              <div className="flex gap-2">
                {preferences.email_notifications && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Badge>
                )}
                {preferences.sms_notifications && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    SMS
                  </Badge>
                )}
                {preferences.whatsapp_notifications && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    WhatsApp
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Notification Types:</h4>
              <div className="flex flex-wrap gap-2">
                {preferences.notification_types.map((typeId) => {
                  const type = notificationTypes.find(t => t.id === typeId);
                  return type ? (
                    <Badge key={typeId} variant="secondary">
                      {type.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
