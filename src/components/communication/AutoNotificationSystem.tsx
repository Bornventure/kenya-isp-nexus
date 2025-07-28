
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Activity, Settings, Mail, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAutoNotifications } from '@/hooks/useAutoNotifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AutoNotificationSystem = () => {
  const { toast } = useToast();
  const { settings, settingsLoading, notificationLogs, logsLoading } = useAutoNotifications();
  const [localSettings, setLocalSettings] = useState<any[]>([]);

  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSetting = async (settingId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('auto_notification_settings')
        .update({ [field]: value })
        .eq('id', settingId);

      if (error) throw error;

      setLocalSettings(prev => 
        prev.map(s => s.id === settingId ? { ...s, [field]: value } : s)
      );

      toast({
        title: "Settings Updated",
        description: "Auto-notification settings have been updated",
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Auto-Notification System</h2>
        <p className="text-muted-foreground">
          Monitor and manage automated notifications sent to clients
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="h-4 w-4" />
            Notification Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localSettings.map((setting) => (
              <Card key={setting.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {setting.trigger_event.replace('_', ' ')}
                      </CardTitle>
                      <CardDescription>
                        Automatic notification for {setting.trigger_event.replace('_', ' ')} events
                      </CardDescription>
                    </div>
                    <Switch
                      checked={setting.is_enabled}
                      onCheckedChange={(checked) => updateSetting(setting.id, 'is_enabled', checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`delay-${setting.id}`}>Delay (minutes)</Label>
                      <Input
                        id={`delay-${setting.id}`}
                        type="number"
                        value={setting.delay_minutes}
                        onChange={(e) => updateSetting(setting.id, 'delay_minutes', parseInt(e.target.value))}
                        min="0"
                        max="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`retry-${setting.id}`}>Retry Attempts</Label>
                      <Input
                        id={`retry-${setting.id}`}
                        type="number"
                        value={setting.retry_attempts}
                        onChange={(e) => updateSetting(setting.id, 'retry_attempts', parseInt(e.target.value))}
                        min="0"
                        max="5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`retry-delay-${setting.id}`}>Retry Delay (minutes)</Label>
                    <Input
                      id={`retry-delay-${setting.id}`}
                      type="number"
                      value={setting.retry_delay_minutes}
                      onChange={(e) => updateSetting(setting.id, 'retry_delay_minutes', parseInt(e.target.value))}
                      min="1"
                      max="30"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                View the status of recently sent notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notificationLogs && notificationLogs.length > 0 ? (
                    notificationLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(log.status)}
                          <div>
                            <div className="font-medium">{log.clients?.name || 'Unknown Client'}</div>
                            <div className="text-sm text-gray-500">
                              {log.notification_templates?.name || log.trigger_event}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {log.channels.includes('email') && (
                              <Badge variant="outline" className="gap-1">
                                <Mail className="h-3 w-3" />
                                Email
                              </Badge>
                            )}
                            {log.channels.includes('sms') && (
                              <Badge variant="outline" className="gap-1">
                                <MessageSquare className="h-3 w-3" />
                                SMS
                              </Badge>
                            )}
                          </div>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No notifications sent yet
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoNotificationSystem;
