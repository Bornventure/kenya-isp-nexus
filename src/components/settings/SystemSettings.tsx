
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Database, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SystemSettingsData {
  company_name: string;
  timezone: string;
  date_format: string;
  currency: string;
  backup_enabled: boolean;
  backup_frequency: string;
  maintenance_mode: boolean;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  email_from_address: string;
  notifications_enabled: boolean;
}

const SystemSettings = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettingsData>({
    company_name: 'DataDefender Kenya Internet Services',
    timezone: 'Africa/Nairobi',
    date_format: 'DD/MM/YYYY',
    currency: 'KES',
    backup_enabled: true,
    backup_frequency: 'daily',
    maintenance_mode: false,
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    email_from_address: 'noreply@datadefender.com',
    notifications_enabled: true,
  });

  // Fetch existing settings
  useEffect(() => {
    if (profile?.isp_company_id) {
      fetchSettings();
    }
  }, [profile?.isp_company_id]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_system_settings', { company_id: profile?.isp_company_id });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data && data.length > 0) {
        const settingsData = data[0];
        setSettings({
          company_name: settingsData.company_name || settings.company_name,
          timezone: settingsData.timezone || settings.timezone,
          date_format: settingsData.date_format || settings.date_format,
          currency: settingsData.currency || settings.currency,
          backup_enabled: settingsData.backup_enabled ?? settings.backup_enabled,
          backup_frequency: settingsData.backup_frequency || settings.backup_frequency,
          maintenance_mode: settingsData.maintenance_mode ?? settings.maintenance_mode,
          smtp_host: settingsData.smtp_host || settings.smtp_host,
          smtp_port: settingsData.smtp_port || settings.smtp_port,
          smtp_username: settingsData.smtp_username || settings.smtp_username,
          email_from_address: settingsData.email_from_address || settings.email_from_address,
          notifications_enabled: settingsData.notifications_enabled ?? settings.notifications_enabled,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!profile?.isp_company_id) {
      toast({
        title: "Error",
        description: "Company ID not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .rpc('upsert_system_settings', {
          company_id: profile.isp_company_id,
          settings_data: settings
        });

      if (error) throw error;

      toast({
        title: "System Settings Updated",
        description: "Your system settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.company_name}
                onChange={(e) => setSettings({...settings, company_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({...settings, timezone: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.date_format}
                onValueChange={(value) => setSettings({...settings, date_format: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({...settings, currency: value})}
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
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="backupEnabled">Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic database backups
              </p>
            </div>
            <Switch
              id="backupEnabled"
              checked={settings.backup_enabled}
              onCheckedChange={(checked) => setSettings({...settings, backup_enabled: checked})}
            />
          </div>

          <div>
            <Label htmlFor="backupFrequency">Backup Frequency</Label>
            <Select
              value={settings.backup_frequency}
              onValueChange={(value) => setSettings({...settings, backup_frequency: value})}
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

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put system in maintenance mode
              </p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtp_host}
                onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                value={settings.smtp_port}
                onChange={(e) => setSettings({...settings, smtp_port: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input
                id="smtpUsername"
                value={settings.smtp_username}
                onChange={(e) => setSettings({...settings, smtp_username: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="emailFromAddress">From Email Address</Label>
              <Input
                id="emailFromAddress"
                value={settings.email_from_address}
                onChange={(e) => setSettings({...settings, email_from_address: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notificationsEnabled">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable email notifications
              </p>
            </div>
            <Switch
              id="notificationsEnabled"
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) => setSettings({...settings, notifications_enabled: checked})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save System Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;
