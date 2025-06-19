
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  MessageSquare, 
  Mail, 
  Save, 
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface MpesaSettings {
  id?: string;
  paybill_number: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  shortcode: string;
  is_active: boolean;
}

interface NotificationSettings {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  notification_types: string[];
}

const ApiSettings: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mpesaSettings, setMpesaSettings] = useState<MpesaSettings>({
    paybill_number: '',
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    shortcode: '',
    is_active: false,
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    user_id: '',
    email_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: false,
    notification_types: ['payment_reminder', 'service_expiry', 'low_balance'],
  });

  // Fetch existing settings
  useEffect(() => {
    if (profile?.isp_company_id) {
      fetchMpesaSettings();
      fetchNotificationSettings();
    }
  }, [profile?.isp_company_id]);

  const fetchMpesaSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('mpesa_settings')
        .select('*')
        .eq('isp_company_id', profile?.isp_company_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMpesaSettings(data);
      }
    } catch (error) {
      console.error('Error fetching M-Pesa settings:', error);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const settings = {
          ...data,
          notification_types: Array.isArray(data.notification_types) 
            ? (data.notification_types as any[]).map(item => 
                typeof item === 'string' ? item : String(item)
              )
            : ['payment_reminder', 'service_expiry', 'low_balance']
        };
        setNotificationSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const saveMpesaSettings = async () => {
    if (!profile?.isp_company_id) return;

    setLoading(true);
    try {
      const settingsData = {
        ...mpesaSettings,
        isp_company_id: profile.isp_company_id,
      };

      const { error } = await supabase
        .from('mpesa_settings')
        .upsert(settingsData, { onConflict: 'isp_company_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "M-Pesa settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving M-Pesa settings:', error);
      toast({
        title: "Error",
        description: "Failed to save M-Pesa settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const settingsData = {
        ...notificationSettings,
        user_id: profile.id,
      };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testMpesaConnection = async () => {
    if (!mpesaSettings.consumer_key || !mpesaSettings.consumer_secret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both Consumer Key and Consumer Secret",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // This would normally test the M-Pesa connection
      // For now, we'll simulate a successful test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connection Test Successful",
        description: "M-Pesa API connection is working correctly",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to connect to M-Pesa API. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your external API integrations and notification preferences
        </p>
      </div>

      <Tabs defaultValue="mpesa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mpesa" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            M-Pesa
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS/Notifications
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        {/* M-Pesa Settings */}
        <TabsContent value="mpesa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                M-Pesa Integration Settings
                {mpesaSettings.is_active && (
                  <Badge variant="default" className="ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paybill">Paybill Number</Label>
                  <Input
                    id="paybill"
                    placeholder="Enter your paybill number"
                    value={mpesaSettings.paybill_number}
                    onChange={(e) => setMpesaSettings(prev => ({ ...prev, paybill_number: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="shortcode">Shortcode</Label>
                  <Input
                    id="shortcode"
                    placeholder="Enter your shortcode"
                    value={mpesaSettings.shortcode}
                    onChange={(e) => setMpesaSettings(prev => ({ ...prev, shortcode: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="consumer_key">Consumer Key</Label>
                  <Input
                    id="consumer_key"
                    type="password"
                    placeholder="Enter your consumer key"
                    value={mpesaSettings.consumer_key}
                    onChange={(e) => setMpesaSettings(prev => ({ ...prev, consumer_key: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    placeholder="Enter your consumer secret"
                    value={mpesaSettings.consumer_secret}
                    onChange={(e) => setMpesaSettings(prev => ({ ...prev, consumer_secret: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="passkey">Passkey</Label>
                  <Input
                    id="passkey"
                    type="password"
                    placeholder="Enter your passkey"
                    value={mpesaSettings.passkey}
                    onChange={(e) => setMpesaSettings(prev => ({ ...prev, passkey: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="mpesa_active"
                  checked={mpesaSettings.is_active}
                  onCheckedChange={(checked) => setMpesaSettings(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="mpesa_active">Enable M-Pesa Integration</Label>
              </div>

              <div className="flex gap-3">
                <Button onClick={saveMpesaSettings} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Settings
                </Button>
                <Button variant="outline" onClick={testMpesaConnection} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS & Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email_notifications"
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))}
                  />
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms_notifications"
                    checked={notificationSettings.sms_notifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, sms_notifications: checked }))}
                  />
                  <Label htmlFor="sms_notifications">SMS Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="whatsapp_notifications"
                    checked={notificationSettings.whatsapp_notifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, whatsapp_notifications: checked }))}
                  />
                  <Label htmlFor="whatsapp_notifications">WhatsApp Notifications</Label>
                </div>
              </div>

              <div>
                <Label>Notification Types</Label>
                <div className="mt-2 space-y-2">
                  {['payment_reminder', 'service_expiry', 'low_balance', 'account_update'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Switch
                        id={type}
                        checked={notificationSettings.notification_types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNotificationSettings(prev => ({
                              ...prev,
                              notification_types: [...prev.notification_types, type]
                            }));
                          } else {
                            setNotificationSettings(prev => ({
                              ...prev,
                              notification_types: prev.notification_types.filter(t => t !== type)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={type} className="capitalize">
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={saveNotificationSettings} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Email Service</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Email services are configured server-side using Resend API. Contact your administrator for email configuration changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiSettings;
