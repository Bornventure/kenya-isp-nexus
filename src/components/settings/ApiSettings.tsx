
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Key, 
  Smartphone, 
  CreditCard,
  Mail,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MpesaSettings {
  id?: string;
  paybill_number: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  shortcode: string;
  is_active: boolean;
  isp_company_id: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  notification_types: string[];
}

const ApiSettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [mpesaSettings, setMpesaSettings] = useState<MpesaSettings>({
    paybill_number: '',
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    shortcode: '',
    is_active: false,
    isp_company_id: profile?.isp_company_id || ''
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: false,
    notification_types: ['payment_reminders', 'service_expiry', 'system_alerts']
  });

  const [testingStatus, setTestingStatus] = useState<{[key: string]: 'idle' | 'testing' | 'success' | 'error'}>({
    mpesa: 'idle',
    sms: 'idle',
    email: 'idle'
  });

  // Fetch existing M-Pesa settings
  const { data: existingMpesaSettings, isLoading: mpesaLoading } = useQuery({
    queryKey: ['mpesa-settings', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return null;

      const { data, error } = await supabase
        .from('mpesa_settings')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.isp_company_id,
  });

  // Fetch notification preferences
  const { data: existingNotificationSettings } = useQuery({
    queryKey: ['notification-preferences', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (existingMpesaSettings) {
      setMpesaSettings({
        ...existingMpesaSettings,
        isp_company_id: profile?.isp_company_id || ''
      });
    }
  }, [existingMpesaSettings, profile?.isp_company_id]);

  useEffect(() => {
    if (existingNotificationSettings) {
      setNotificationSettings({
        email_notifications: existingNotificationSettings.email_notifications,
        sms_notifications: existingNotificationSettings.sms_notifications,
        whatsapp_notifications: existingNotificationSettings.whatsapp_notifications,
        notification_types: existingNotificationSettings.notification_types || []
      });
    }
  }, [existingNotificationSettings]);

  // Save M-Pesa settings
  const saveMpesaSettingsMutation = useMutation({
    mutationFn: async (settings: MpesaSettings) => {
      if (existingMpesaSettings?.id) {
        const { data, error } = await supabase
          .from('mpesa_settings')
          .update(settings)
          .eq('id', existingMpesaSettings.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('mpesa_settings')
          .insert(settings)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpesa-settings'] });
      toast({
        title: "Success",
        description: "M-Pesa settings saved successfully",
      });
    },
    onError: (error) => {
      console.error('Error saving M-Pesa settings:', error);
      toast({
        title: "Error",
        description: "Failed to save M-Pesa settings",
        variant: "destructive",
      });
    },
  });

  // Save notification settings
  const saveNotificationSettingsMutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      const settingsData = {
        user_id: profile?.id,
        ...settings
      };

      if (existingNotificationSettings?.id) {
        const { data, error } = await supabase
          .from('notification_preferences')
          .update(settingsData)
          .eq('id', existingNotificationSettings.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert(settingsData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Success",
        description: "Notification settings saved successfully",
      });
    },
    onError: (error) => {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    },
  });

  const testMpesaConnection = async () => {
    setTestingStatus(prev => ({ ...prev, mpesa: 'testing' }));
    try {
      const { data, error } = await supabase.functions.invoke('test-mpesa-connection', {
        body: {
          consumer_key: mpesaSettings.consumer_key,
          consumer_secret: mpesaSettings.consumer_secret,
          shortcode: mpesaSettings.shortcode
        }
      });

      if (error) throw error;

      if (data?.success) {
        setTestingStatus(prev => ({ ...prev, mpesa: 'success' }));
        toast({
          title: "Connection Successful",
          description: "M-Pesa API connection is working properly",
        });
      } else {
        setTestingStatus(prev => ({ ...prev, mpesa: 'error' }));
        toast({
          title: "Connection Failed",
          description: data?.error || "Failed to connect to M-Pesa API",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('M-Pesa test error:', error);
      setTestingStatus(prev => ({ ...prev, mpesa: 'error' }));
      toast({
        title: "Test Failed",
        description: "Error testing M-Pesa connection",
        variant: "destructive",
      });
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'testing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <TestTube className="h-4 w-4" />;
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'testing': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API & Integration Settings</h2>
        <p className="text-muted-foreground">
          Configure third-party service integrations and API settings.
        </p>
      </div>

      <Tabs defaultValue="mpesa" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
          <TabsTrigger value="sms">SMS/Notifications</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* M-Pesa Settings */}
        <TabsContent value="mpesa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                M-Pesa Configuration
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={mpesaSettings.is_active ? 'default' : 'secondary'}>
                  {mpesaSettings.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getTestStatusColor(testingStatus.mpesa)}`}>
                  {getTestStatusIcon(testingStatus.mpesa)}
                  <span className="text-sm">
                    {testingStatus.mpesa === 'idle' && 'Not Tested'}
                    {testingStatus.mpesa === 'testing' && 'Testing...'}
                    {testingStatus.mpesa === 'success' && 'Connection OK'}
                    {testingStatus.mpesa === 'error' && 'Connection Failed'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paybill">Paybill Number</Label>
                  <Input
                    id="paybill"
                    value={mpesaSettings.paybill_number}
                    onChange={(e) => setMpesaSettings({...mpesaSettings, paybill_number: e.target.value})}
                    placeholder="Enter your M-Pesa paybill number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortcode">Shortcode</Label>
                  <Input
                    id="shortcode"
                    value={mpesaSettings.shortcode}
                    onChange={(e) => setMpesaSettings({...mpesaSettings, shortcode: e.target.value})}
                    placeholder="Enter M-Pesa shortcode"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consumer_key">Consumer Key</Label>
                  <Input
                    id="consumer_key"
                    type="password"
                    value={mpesaSettings.consumer_key}
                    onChange={(e) => setMpesaSettings({...mpesaSettings, consumer_key: e.target.value})}
                    placeholder="Enter M-Pesa consumer key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    value={mpesaSettings.consumer_secret}
                    onChange={(e) => setMpesaSettings({...mpesaSettings, consumer_secret: e.target.value})}
                    placeholder="Enter M-Pesa consumer secret"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="passkey">Passkey</Label>
                  <Textarea
                    id="passkey"
                    value={mpesaSettings.passkey}
                    onChange={(e) => setMpesaSettings({...mpesaSettings, passkey: e.target.value})}
                    placeholder="Enter M-Pesa passkey"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between md:col-span-2">
                  <div>
                    <Label>Enable M-Pesa Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Activate M-Pesa payments for your clients
                    </p>
                  </div>
                  <Switch
                    checked={mpesaSettings.is_active}
                    onCheckedChange={(checked) => setMpesaSettings({...mpesaSettings, is_active: checked})}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => saveMpesaSettingsMutation.mutate(mpesaSettings)}
                  disabled={saveMpesaSettingsMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save M-Pesa Settings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testMpesaConnection}
                  disabled={testingStatus.mpesa === 'testing' || !mpesaSettings.consumer_key}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS/Notifications Settings */}
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS & Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings,
                      email_notifications: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS using Africa's Talking
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.sms_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings,
                      sms_notifications: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via WhatsApp Business API
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.whatsapp_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({
                      ...notificationSettings,
                      whatsapp_notifications: checked
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Notification Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { key: 'payment_reminders', label: 'Payment Reminders' },
                    { key: 'service_expiry', label: 'Service Expiry Alerts' },
                    { key: 'system_alerts', label: 'System Alerts' },
                    { key: 'maintenance_notices', label: 'Maintenance Notices' },
                    { key: 'promotional', label: 'Promotional Messages' },
                    { key: 'security_alerts', label: 'Security Alerts' }
                  ].map((type) => (
                    <div key={type.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type.key}
                        checked={notificationSettings.notification_types.includes(type.key)}
                        onChange={(e) => {
                          const types = e.target.checked
                            ? [...notificationSettings.notification_types, type.key]
                            : notificationSettings.notification_types.filter(t => t !== type.key);
                          setNotificationSettings({
                            ...notificationSettings,
                            notification_types: types
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={type.key} className="text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => saveNotificationSettingsMutation.mutate(notificationSettings)}
                disabled={saveNotificationSettingsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Email Service</span>
                </div>
                <p className="text-sm text-blue-700">
                  Email notifications are handled through Resend service. The RESEND_API_KEY is already configured 
                  in your system settings and ready to use for sending transactional emails.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>From Name</Label>
                    <Input placeholder="Your Company Name" defaultValue="ISP Manager" />
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input placeholder="noreply@yourcompany.com" defaultValue="noreply@ispmanager.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Templates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Welcome Email',
                      'Payment Confirmation',
                      'Service Expiry Warning',
                      'Account Suspension Notice',
                      'Password Reset',
                      'Monthly Invoice'
                    ].map((template) => (
                      <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">{template}</span>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>System Timezone</Label>
                    <Input defaultValue="Africa/Nairobi" />
                  </div>
                  <div>
                    <Label>Default Currency</Label>
                    <Input defaultValue="KES" />
                  </div>
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div>
                    <Label>Max File Upload Size (MB)</Label>
                    <Input type="number" defaultValue="10" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Show detailed error messages for development
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup system data daily
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put system in maintenance mode for updates
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiSettings;
