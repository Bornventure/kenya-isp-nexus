
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  Mail, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAutoNotifications } from '@/hooks/useAutoNotifications';
import { useToast } from '@/hooks/use-toast';

const AutoNotificationSystem = () => {
  const { toast } = useToast();
  const { 
    settings, 
    settingsLoading, 
    templates, 
    templatesLoading,
    notificationLogs,
    logsLoading 
  } = useAutoNotifications();

  const [autoSettings, setAutoSettings] = useState({
    payment_received: { enabled: true, template_id: '', delay_minutes: 0 },
    payment_reminder: { enabled: true, template_id: '', delay_minutes: 1440 }, // 24 hours
    service_renewal: { enabled: true, template_id: '', delay_minutes: 0 },
    service_suspension: { enabled: true, template_id: '', delay_minutes: 0 },
    client_registration: { enabled: true, template_id: '', delay_minutes: 30 },
    package_upgrade: { enabled: true, template_id: '', delay_minutes: 0 },
    network_maintenance: { enabled: true, template_id: '', delay_minutes: 60 }
  });

  const triggerEvents = [
    { 
      key: 'payment_received', 
      label: 'Payment Received', 
      description: 'Sent when client payment is confirmed',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    { 
      key: 'payment_reminder', 
      label: 'Payment Reminder', 
      description: 'Sent before service expiry',
      icon: Clock,
      color: 'text-yellow-600'
    },
    { 
      key: 'service_renewal', 
      label: 'Service Renewal', 
      description: 'Sent when service is renewed',
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    { 
      key: 'service_suspension', 
      label: 'Service Suspension', 
      description: 'Sent when service is suspended',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    { 
      key: 'client_registration', 
      label: 'Client Registration', 
      description: 'Sent when new client registers',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    { 
      key: 'package_upgrade', 
      label: 'Package Upgrade', 
      description: 'Sent when client upgrades package',
      icon: CheckCircle,
      color: 'text-purple-600'
    },
    { 
      key: 'network_maintenance', 
      label: 'Network Maintenance', 
      description: 'Sent for scheduled maintenance',
      icon: Settings,
      color: 'text-orange-600'
    }
  ];

  const handleToggleTrigger = (triggerKey: string) => {
    setAutoSettings(prev => ({
      ...prev,
      [triggerKey]: {
        ...prev[triggerKey as keyof typeof prev],
        enabled: !prev[triggerKey as keyof typeof prev].enabled
      }
    }));
  };

  const handleTemplateChange = (triggerKey: string, templateId: string) => {
    setAutoSettings(prev => ({
      ...prev,
      [triggerKey]: {
        ...prev[triggerKey as keyof typeof prev],
        template_id: templateId
      }
    }));
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Auto-notification settings have been updated successfully.",
    });
  };

  if (settingsLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Auto-Notification System</h2>
          <p className="text-muted-foreground">
            Configure automatic notifications triggered by system events
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <Settings className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6">
        {triggerEvents.map((trigger) => {
          const setting = autoSettings[trigger.key as keyof typeof autoSettings];
          const Icon = trigger.icon;
          
          return (
            <Card key={trigger.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${trigger.color}`} />
                    <div>
                      <CardTitle className="text-lg">{trigger.label}</CardTitle>
                      <CardDescription>{trigger.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={setting.enabled ? "default" : "secondary"}>
                      {setting.enabled ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => handleToggleTrigger(trigger.key)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              {setting.enabled && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`template-${trigger.key}`}>Template</Label>
                      <Select
                        value={setting.template_id}
                        onValueChange={(value) => handleTemplateChange(trigger.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates?.filter(t => t.trigger_event === trigger.key).map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Channels</Label>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <MessageSquare className="h-3 w-3" />
                          SMS
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Auto-Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {notificationLogs?.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {log.type || 'System Notification'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Sent to {Array.isArray(log.recipients) ? log.recipients.length : 0} recipient(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!notificationLogs || notificationLogs.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No recent notifications found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoNotificationSystem;
