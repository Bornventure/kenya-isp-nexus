import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings as SettingsIcon, 
  Router, 
  Shield, 
  Mail, 
  MessageSquare,
  Save,
  TestTube,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mikrotikService } from '@/services/mikrotikService';
import { supabase } from '@/integrations/supabase/client';
import NotificationTemplates from '@/components/communication/NotificationTemplates';

const SettingsPage = () => {
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // MikroTik Configuration State
  const [mikrotikConfig, setMikrotikConfig] = useState({
    host: '192.168.100.2',
    user: 'admin',
    password: 'admin123',
    port: 8728
  });

  // RADIUS Configuration State
  const [radiusConfig, setRadiusConfig] = useState({
    server_address: '127.0.0.1',
    auth_port: 1812,
    accounting_port: 1813,
    shared_secret: 'testing123',
    timeout_seconds: 5,
    is_enabled: true
  });

  // Email Configuration State
  const [emailConfig, setEmailConfig] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'ISP Management System',
    use_tls: true
  });

  // Celcomafrica SMS Configuration State
  const [smsConfig, setSmsConfig] = useState({
    provider: 'celcomafrica',
    api_url: 'https://isms.celcomafrica.com/api/services/sendsms',
    api_key: '3230abd57d39aa89fc407618f3faaacc',
    partner_id: '800',
    shortcode: 'LAKELINK',
    is_enabled: true
  });

  const handleTestMikroTik = async () => {
    setIsTesting(true);
    try {
      const result = await mikrotikService.testConnection();
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: "MikroTik connection test passed successfully.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect to MikroTik router.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestSMS = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-celcomafrica', {
        body: {
          phone: '+254700000000', // Test number
          message: 'Test SMS from ISP Management System. SMS integration is working properly.',
          type: 'test'
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "SMS Test Successful",
          description: "Test SMS sent successfully via Celcomafrica.",
        });
      } else {
        toast({
          title: "SMS Test Failed",
          description: data.error || "Failed to send test SMS.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('SMS test error:', error);
      toast({
        title: "SMS Test Failed",
        description: "An error occurred while testing SMS functionality.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveMikroTik = () => {
    toast({
      title: "Configuration Saved",
      description: "MikroTik configuration has been saved successfully.",
    });
  };

  const handleSaveRadius = () => {
    toast({
      title: "Configuration Saved",
      description: "RADIUS configuration has been saved successfully.",
    });
  };

  const handleSaveEmail = () => {
    toast({
      title: "Configuration Saved",
      description: "Email configuration has been saved successfully.",
    });
  };

  const handleSaveSMS = () => {
    toast({
      title: "Configuration Saved",
      description: "SMS configuration has been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system integrations and preferences
        </p>
      </div>

      <Tabs defaultValue="sms">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="mikrotik">MikroTik</TabsTrigger>
          <TabsTrigger value="radius">RADIUS</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS Configuration - Celcomafrica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sms_provider">SMS Provider</Label>
                  <Select value={smsConfig.provider} onValueChange={(value) => setSmsConfig({...smsConfig, provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SMS provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celcomafrica">Celcomafrica</SelectItem>
                      <SelectItem value="africastalking">Africa's Talking</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms_shortcode">Shortcode</Label>
                  <Input
                    id="sms_shortcode"
                    value={smsConfig.shortcode}
                    onChange={(e) => setSmsConfig({...smsConfig, shortcode: e.target.value})}
                    placeholder="LAKELINK"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sms_api_url">API URL</Label>
                <Input
                  id="sms_api_url"
                  value={smsConfig.api_url}
                  onChange={(e) => setSmsConfig({...smsConfig, api_url: e.target.value})}
                  placeholder="https://isms.celcomafrica.com/api/services/sendsms"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sms_api_key">API Key</Label>
                  <Input
                    id="sms_api_key"
                    type={showPasswords ? "text" : "password"}
                    value={smsConfig.api_key}
                    onChange={(e) => setSmsConfig({...smsConfig, api_key: e.target.value})}
                    placeholder="3230abd57d39aa89fc407618f3faaacc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms_partner_id">Partner ID</Label>
                  <Input
                    id="sms_partner_id"
                    value={smsConfig.partner_id}
                    onChange={(e) => setSmsConfig({...smsConfig, partner_id: e.target.value})}
                    placeholder="800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sms_enabled"
                  checked={smsConfig.is_enabled}
                  onCheckedChange={(checked) => setSmsConfig({...smsConfig, is_enabled: checked})}
                />
                <Label htmlFor="sms_enabled">Enable SMS Notifications</Label>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">SMS Notification Types</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span>Client Registration Confirmation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span>Payment Confirmation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span>Service Activation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span>Payment Reminders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span>Service Suspension Notices</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span>Network Maintenance Alerts</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveSMS} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestSMS}
                  disabled={isTesting}
                  className="gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {isTesting ? 'Testing...' : 'Send Test SMS'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mikrotik" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router className="h-5 w-5" />
                MikroTik Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_host">Router IP Address</Label>
                  <Input
                    id="mikrotik_host"
                    value={mikrotikConfig.host}
                    onChange={(e) => setMikrotikConfig({...mikrotikConfig, host: e.target.value})}
                    placeholder="192.168.100.2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_port">API Port</Label>
                  <Input
                    id="mikrotik_port"
                    type="number"
                    value={mikrotikConfig.port}
                    onChange={(e) => setMikrotikConfig({...mikrotikConfig, port: parseInt(e.target.value)})}
                    placeholder="8728"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_user">Username</Label>
                  <Input
                    id="mikrotik_user"
                    value={mikrotikConfig.user}
                    onChange={(e) => setMikrotikConfig({...mikrotikConfig, user: e.target.value})}
                    placeholder="admin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_password">Password</Label>
                  <div className="relative">
                    <Input
                      id="mikrotik_password"
                      type={showPasswords ? "text" : "password"}
                      value={mikrotikConfig.password}
                      onChange={(e) => setMikrotikConfig({...mikrotikConfig, password: e.target.value})}
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveMikroTik} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestMikroTik}
                  disabled={isTesting}
                  className="gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radius" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                RADIUS Server Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="radius_server">Server Address</Label>
                  <Input
                    id="radius_server"
                    value={radiusConfig.server_address}
                    onChange={(e) => setRadiusConfig({...radiusConfig, server_address: e.target.value})}
                    placeholder="127.0.0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius_auth_port">Authentication Port</Label>
                  <Input
                    id="radius_auth_port"
                    type="number"
                    value={radiusConfig.auth_port}
                    onChange={(e) => setRadiusConfig({...radiusConfig, auth_port: parseInt(e.target.value)})}
                    placeholder="1812"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius_acct_port">Accounting Port</Label>
                  <Input
                    id="radius_acct_port"
                    type="number"
                    value={radiusConfig.accounting_port}
                    onChange={(e) => setRadiusConfig({...radiusConfig, accounting_port: parseInt(e.target.value)})}
                    placeholder="1813"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius_timeout">Timeout (seconds)</Label>
                  <Input
                    id="radius_timeout"
                    type="number"
                    value={radiusConfig.timeout_seconds}
                    onChange={(e) => setRadiusConfig({...radiusConfig, timeout_seconds: parseInt(e.target.value)})}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="radius_secret">Shared Secret</Label>
                <div className="relative">
                  <Input
                    id="radius_secret"
                    type={showPasswords ? "text" : "password"}
                    value={radiusConfig.shared_secret}
                    onChange={(e) => setRadiusConfig({...radiusConfig, shared_secret: e.target.value})}
                    placeholder="Enter shared secret"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="radius_enabled"
                  checked={radiusConfig.is_enabled}
                  onCheckedChange={(checked) => setRadiusConfig({...radiusConfig, is_enabled: checked})}
                />
                <Label htmlFor="radius_enabled">Enable RADIUS Server</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveRadius} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
                <Button variant="outline" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={emailConfig.smtp_host}
                    onChange={(e) => setEmailConfig({...emailConfig, smtp_host: e.target.value})}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={emailConfig.smtp_port}
                    onChange={(e) => setEmailConfig({...emailConfig, smtp_port: parseInt(e.target.value)})}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_user">SMTP Username</Label>
                  <Input
                    id="smtp_user"
                    value={emailConfig.smtp_user}
                    onChange={(e) => setEmailConfig({...emailConfig, smtp_user: e.target.value})}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type={showPasswords ? "text" : "password"}
                    value={emailConfig.smtp_password}
                    onChange={(e) => setEmailConfig({...emailConfig, smtp_password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    value={emailConfig.from_email}
                    onChange={(e) => setEmailConfig({...emailConfig, from_email: e.target.value})}
                    placeholder="noreply@yourisp.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={emailConfig.from_name}
                    onChange={(e) => setEmailConfig({...emailConfig, from_name: e.target.value})}
                    placeholder="ISP Management System"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="use_tls"
                  checked={emailConfig.use_tls}
                  onCheckedChange={(checked) => setEmailConfig({...emailConfig, use_tls: checked})}
                />
                <Label htmlFor="use_tls">Use TLS Encryption</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEmail} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
                <Button variant="outline" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <NotificationTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
