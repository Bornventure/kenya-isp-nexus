
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Save, Settings, Globe, Mail, Database, Shield } from 'lucide-react';
import CompanySettings from './CompanySettings';
import SecuritySettings from './SecuritySettings';
import InstallationFeeSettings from './InstallationFeeSettings';

const SystemSettings = () => {
  const { profile } = useAuth();
  const { settings, updateSettings, isUpdating } = useSystemSettings();
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    console.log('Saving settings:', formData);
    updateSettings(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Only show installation fee settings for isp_admin
  const canManageInstallationFee = profile?.role === 'isp_admin' || profile?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            System Settings
          </h2>
          <p className="text-gray-600">Configure your system preferences and company settings.</p>
        </div>
        <Button onClick={handleSave} disabled={isUpdating}>
          <Save className="h-4 w-4 mr-2" />
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Enter your company name"
              />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date_format">Date Format</Label>
              <Select value={formData.date_format} onValueChange={(value) => handleInputChange('date_format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                value={formData.smtp_host}
                onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                value={formData.smtp_port}
                onChange={(e) => handleInputChange('smtp_port', e.target.value)}
                placeholder="587"
              />
            </div>

            <div>
              <Label htmlFor="smtp_username">SMTP Username</Label>
              <Input
                id="smtp_username"
                value={formData.smtp_username}
                onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <Label htmlFor="email_from_address">From Email Address</Label>
              <Input
                id="email_from_address"
                value={formData.email_from_address}
                onChange={(e) => handleInputChange('email_from_address', e.target.value)}
                placeholder="noreply@yourcompany.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications_enabled">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Allow system to send notifications
                </p>
              </div>
              <Switch
                id="notifications_enabled"
                checked={formData.notifications_enabled}
                onCheckedChange={(checked) => handleInputChange('notifications_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backup_enabled">Enable Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup system data
                </p>
              </div>
              <Switch
                id="backup_enabled"
                checked={formData.backup_enabled}
                onCheckedChange={(checked) => handleInputChange('backup_enabled', checked)}
              />
            </div>

            {formData.backup_enabled && (
              <div>
                <Label htmlFor="backup_frequency">Backup Frequency</Label>
                <Select value={formData.backup_frequency} onValueChange={(value) => handleInputChange('backup_frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable to perform system maintenance
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={formData.maintenance_mode}
                onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <CompanySettings />
      
      {canManageInstallationFee && <InstallationFeeSettings />}
      
      <SecuritySettings />
    </div>
  );
};

export default SystemSettings;
