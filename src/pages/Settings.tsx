
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Building2,
  Network,
  CreditCard,
  Shield,
  Bell,
  Monitor,
  Palette,
  Globe,
  Database,
  Mail,
  Phone,
  MapPin,
  Save,
  RefreshCw,
  AlertTriangle,
  Check
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+254 700 123 456',
    avatar: '',
    timezone: 'Africa/Nairobi',
    language: 'en'
  });

  // Company settings state
  const [companyData, setCompanyData] = useState({
    name: user?.company || 'Kisumu Internet Services',
    address: 'Kisumu CBD, Kenya',
    phone: '+254 700 555 000',
    email: 'info@kisumu-net.com',
    website: 'https://kisumu-net.com',
    license: 'ISP-2024-001',
    taxId: 'KRA-123456789'
  });

  // Network settings state
  const [networkSettings, setNetworkSettings] = useState({
    defaultBandwidth: '10',
    maxClients: '500',
    networkName: 'Kisumu-WiFi',
    backupEnabled: true,
    monitoring: true,
    autoFailover: true,
    loadBalancing: false
  });

  // Billing settings state
  const [billingSettings, setBillingSettings] = useState({
    currency: 'KES',
    taxRate: '16',
    lateFee: '5',
    gracePeriod: '7',
    autoSuspend: true,
    paymentReminders: true,
    invoicePrefix: 'INV',
    receiptPrefix: 'RCP'
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
    auditLogging: true,
    ipWhitelist: '',
    sslRequired: true
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    paymentAlerts: true,
    networkAlerts: true,
    maintenanceAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    theme: 'light',
    dataRetention: '365',
    backupFrequency: 'daily',
    logLevel: 'info',
    apiRateLimit: '1000',
    maintenanceMode: false,
    debugMode: false
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings`);
    setUnsavedChanges(false);
    // Here you would typically send the data to your backend
  };

  const handleReset = (section: string) => {
    console.log(`Resetting ${section} settings`);
    setUnsavedChanges(false);
    // Reset to original values
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your ISP system configuration</p>
        </div>
        {unsavedChanges && (
          <Badge variant="destructive" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Unsaved Changes
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => {
                      setProfileData({ ...profileData, name: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => {
                      setProfileData({ ...profileData, email: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => {
                      setProfileData({ ...profileData, phone: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profileData.timezone}
                    onValueChange={(value) => {
                      setProfileData({ ...profileData, timezone: value });
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave('profile')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('profile')}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Manage your ISP company details and legal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyData.name}
                    onChange={(e) => {
                      setCompanyData({ ...companyData, name: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => {
                      setCompanyData({ ...companyData, email: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Company Phone</Label>
                  <Input
                    id="company-phone"
                    value={companyData.phone}
                    onChange={(e) => {
                      setCompanyData({ ...companyData, phone: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyData.website}
                    onChange={(e) => {
                      setCompanyData({ ...companyData, website: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">ISP License Number</Label>
                  <Input
                    id="license"
                    value={companyData.license}
                    onChange={(e) => {
                      setCompanyData({ ...companyData, license: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID</Label>
                  <Input
                    id="tax-id"
                    value={companyData.taxId}
                    onChange={(e) => {
                      setCompanyData({ ...companyData, taxId: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={companyData.address}
                  onChange={(e) => {
                    setCompanyData({ ...companyData, address: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave('company')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('company')}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Settings */}
        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Configuration
              </CardTitle>
              <CardDescription>
                Configure network parameters and infrastructure settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bandwidth">Default Bandwidth (Mbps)</Label>
                  <Input
                    id="bandwidth"
                    type="number"
                    value={networkSettings.defaultBandwidth}
                    onChange={(e) => {
                      setNetworkSettings({ ...networkSettings, defaultBandwidth: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-clients">Maximum Clients</Label>
                  <Input
                    id="max-clients"
                    type="number"
                    value={networkSettings.maxClients}
                    onChange={(e) => {
                      setNetworkSettings({ ...networkSettings, maxClients: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="network-name">Network Name (SSID)</Label>
                  <Input
                    id="network-name"
                    value={networkSettings.networkName}
                    onChange={(e) => {
                      setNetworkSettings({ ...networkSettings, networkName: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Network Features</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="backup-enabled">Automatic Backup</Label>
                    <Switch
                      id="backup-enabled"
                      checked={networkSettings.backupEnabled}
                      onCheckedChange={(checked) => {
                        setNetworkSettings({ ...networkSettings, backupEnabled: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monitoring">Network Monitoring</Label>
                    <Switch
                      id="monitoring"
                      checked={networkSettings.monitoring}
                      onCheckedChange={(checked) => {
                        setNetworkSettings({ ...networkSettings, monitoring: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-failover">Auto Failover</Label>
                    <Switch
                      id="auto-failover"
                      checked={networkSettings.autoFailover}
                      onCheckedChange={(checked) => {
                        setNetworkSettings({ ...networkSettings, autoFailover: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="load-balancing">Load Balancing</Label>
                    <Switch
                      id="load-balancing"
                      checked={networkSettings.loadBalancing}
                      onCheckedChange={(checked) => {
                        setNetworkSettings({ ...networkSettings, loadBalancing: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave('network')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('network')}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Configuration
              </CardTitle>
              <CardDescription>
                Configure billing parameters and payment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={billingSettings.currency}
                    onValueChange={(value) => {
                      setBillingSettings({ ...billingSettings, currency: value });
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={billingSettings.taxRate}
                    onChange={(e) => {
                      setBillingSettings({ ...billingSettings, taxRate: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late-fee">Late Fee (%)</Label>
                  <Input
                    id="late-fee"
                    type="number"
                    value={billingSettings.lateFee}
                    onChange={(e) => {
                      setBillingSettings({ ...billingSettings, lateFee: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grace-period">Grace Period (days)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    value={billingSettings.gracePeriod}
                    onChange={(e) => {
                      setBillingSettings({ ...billingSettings, gracePeriod: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    value={billingSettings.invoicePrefix}
                    onChange={(e) => {
                      setBillingSettings({ ...billingSettings, invoicePrefix: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt-prefix">Receipt Prefix</Label>
                  <Input
                    id="receipt-prefix"
                    value={billingSettings.receiptPrefix}
                    onChange={(e) => {
                      setBillingSettings({ ...billingSettings, receiptPrefix: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Billing Features</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-suspend">Auto Suspend Overdue</Label>
                    <Switch
                      id="auto-suspend"
                      checked={billingSettings.autoSuspend}
                      onCheckedChange={(checked) => {
                        setBillingSettings({ ...billingSettings, autoSuspend: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-reminders">Payment Reminders</Label>
                    <Switch
                      id="payment-reminders"
                      checked={billingSettings.paymentReminders}
                      onCheckedChange={(checked) => {
                        setBillingSettings({ ...billingSettings, paymentReminders: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave('billing')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('billing')}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-attempts">Max Login Attempts</Label>
                  <Input
                    id="login-attempts"
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, loginAttempts: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip-whitelist">IP Whitelist (one per line)</Label>
                <Textarea
                  id="ip-whitelist"
                  placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => {
                    setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Security Features</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <Switch
                      id="two-factor"
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => {
                        setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audit-logging">Audit Logging</Label>
                    <Switch
                      id="audit-logging"
                      checked={securitySettings.auditLogging}
                      onCheckedChange={(checked) => {
                        setSecuritySettings({ ...securitySettings, auditLogging: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ssl-required">Require SSL/TLS</Label>
                    <Switch
                      id="ssl-required"
                      checked={securitySettings.sslRequired}
                      onCheckedChange={(checked) => {
                        setSecuritySettings({ ...securitySettings, sslRequired: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave('security')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('security')}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email</Label>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">SMS</Label>
                    <Switch
                      id="sms-notifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, smsNotifications: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push</Label>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Alert Types</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-alerts">System Alerts</Label>
                    <Switch
                      id="system-alerts"
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, systemAlerts: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-alerts">Payment Alerts</Label>
                    <Switch
                      id="payment-alerts"
                      checked={notificationSettings.paymentAlerts}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, paymentAlerts: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="network-alerts">Network Alerts</Label>
                    <Switch
                      id="network-alerts"
                      checked={notificationSettings.networkAlerts}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, networkAlerts: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
                    <Switch
                      id="maintenance-alerts"
                      checked={notificationSettings.maintenanceAlerts}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, maintenanceAlerts: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Reports</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="daily-reports">Daily</Label>
                    <Switch
                      id="daily-reports"
                      checked={notificationSettings.dailyReports}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, dailyReports: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekly-reports">Weekly</Label>
                    <Switch
                      id="weekly-reports"
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, weeklyReports: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monthly-reports">Monthly</Label>
                    <Switch
                      id="monthly-reports"
                      checked={notificationSettings.monthlyReports}
                      onCheckedChange={(checked) => {
                        setNotificationSettings({ ...notificationSettings, monthlyReports: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave('notifications')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('notifications')}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={systemSettings.theme}
                    onValueChange={(value) => {
                      setSystemSettings({ ...systemSettings, theme: value });
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select
                    value={systemSettings.backupFrequency}
                    onValueChange={(value) => {
                      setSystemSettings({ ...systemSettings, backupFrequency: value });
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention (days)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    value={systemSettings.dataRetention}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, dataRetention: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-rate-limit">API Rate Limit (per hour)</Label>
                  <Input
                    id="api-rate-limit"
                    type="number"
                    value={systemSettings.apiRateLimit}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, apiRateLimit: e.target.value });
                      setUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select
                    value={systemSettings.logLevel}
                    onValueChange={(value) => {
                      setSystemSettings({ ...systemSettings, logLevel: value });
                      setUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">System Modes</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Temporarily disable user access</p>
                    </div>
                    <Switch
                      id="maintenance-mode"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => {
                        setSystemSettings({ ...systemSettings, maintenanceMode: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="debug-mode">Debug Mode</Label>
                      <p className="text-sm text-gray-500">Enable detailed logging</p>
                    </div>
                    <Switch
                      id="debug-mode"
                      checked={systemSettings.debugMode}
                      onCheckedChange={(checked) => {
                        setSystemSettings({ ...systemSettings, debugMode: checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave('system')} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => handleReset('system')}>
                  Reset
                </Button>
                <Button variant="destructive" className="ml-auto flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Restart System
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
