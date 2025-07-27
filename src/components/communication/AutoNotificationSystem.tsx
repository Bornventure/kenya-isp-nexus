
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Activity, Mail, MessageSquare, AlertCircle, CheckCircle, Clock, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AutoNotificationSystem: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    email_service: 'active',
    sms_service: 'active',
    auto_processing: true,
    daily_limit: 1000,
    used_today: 247
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      type: 'email',
      template: 'Payment Confirmation',
      recipient: 'john.doe@example.com',
      status: 'sent',
      timestamp: '2025-01-27T10:30:00Z',
      trigger: 'payment_received'
    },
    {
      id: '2',
      type: 'sms',
      template: 'Service Renewal',
      recipient: '+254700123456',
      status: 'sent',
      timestamp: '2025-01-27T10:25:00Z',
      trigger: 'service_renewal'
    },
    {
      id: '3',
      type: 'email',
      template: 'Payment Reminder',
      recipient: 'jane.smith@example.com',
      status: 'failed',
      timestamp: '2025-01-27T10:20:00Z',
      trigger: 'payment_reminder'
    }
  ]);

  const [dailyStats, setDailyStats] = useState({
    emails_sent: 156,
    sms_sent: 91,
    failed_deliveries: 3,
    success_rate: 98.2
  });

  const { toast } = useToast();

  const handleToggleAutoProcessing = (enabled: boolean) => {
    setSystemStatus(prev => ({ ...prev, auto_processing: enabled }));
    toast({
      title: enabled ? "Auto-processing Enabled" : "Auto-processing Disabled",
      description: `Automatic notifications ${enabled ? 'enabled' : 'disabled'}`,
    });
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
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Auto-Notification System</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-processing"
              checked={systemStatus.auto_processing}
              onCheckedChange={handleToggleAutoProcessing}
            />
            <Label htmlFor="auto-processing">Auto-processing</Label>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Service</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SMS Service</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{dailyStats.success_rate}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Daily Usage</p>
                <p className="text-2xl font-bold">{systemStatus.used_today}</p>
                <p className="text-xs text-gray-500">of {systemStatus.daily_limit}</p>
              </div>
              <div className="w-16">
                <Progress value={(systemStatus.used_today / systemStatus.daily_limit) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Latest automated notifications sent to clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.type === 'email' ? (
                        <Mail className="h-5 w-5 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">{activity.template}</p>
                        <p className="text-sm text-gray-500">{activity.recipient}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(activity.status) as any}>
                        {getStatusIcon(activity.status)}
                        {activity.status}
                      </Badge>
                      <Badge variant="outline">{activity.trigger}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Emails Sent</span>
                  <span className="font-bold">{dailyStats.emails_sent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SMS Sent</span>
                  <span className="font-bold">{dailyStats.sms_sent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Failed Deliveries</span>
                  <span className="font-bold text-red-600">{dailyStats.failed_deliveries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <span className="font-bold text-green-600">{dailyStats.success_rate}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Daily Limit</span>
                    <span>{systemStatus.used_today}/{systemStatus.daily_limit}</span>
                  </div>
                  <Progress value={(systemStatus.used_today / systemStatus.daily_limit) * 100} />
                </div>
                <div className="text-sm text-gray-500">
                  <p>Email quota: Unlimited (Resend)</p>
                  <p>SMS quota: Based on Celcomafrica plan</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure automatic notification system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Email Settings</h3>
                  <div className="flex items-center space-x-2">
                    <Switch id="email-enabled" defaultChecked />
                    <Label htmlFor="email-enabled">Enable email notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="email-attachments" defaultChecked />
                    <Label htmlFor="email-attachments">Include PDF attachments</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Service: Resend (resend.com)
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">SMS Settings</h3>
                  <div className="flex items-center space-x-2">
                    <Switch id="sms-enabled" defaultChecked />
                    <Label htmlFor="sms-enabled">Enable SMS notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sms-unicode" />
                    <Label htmlFor="sms-unicode">Unicode support</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Service: Celcomafrica
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoNotificationSystem;
