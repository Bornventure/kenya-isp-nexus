
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Wifi,
  Shield,
  Clock,
  Users,
  DollarSign,
  Bell,
  Save
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface HotspotSettingsProps {
  selectedHotspot: string | null;
}

const HotspotSettings: React.FC<HotspotSettingsProps> = ({ selectedHotspot }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [globalSettings, setGlobalSettings] = useState({
    defaultBandwidthLimit: 10,
    defaultMaxUsers: 50,
    defaultCoverageRadius: 100,
    autoSessionTimeout: 60,
    enableGuestAccess: true,
    enableVoucherSystem: true,
    enableClientAuth: true,
    guestSessionDuration: 60,
    voucherPricing: {
      oneHour: 10,
      threeHours: 25,
      oneDay: 50,
    },
    notifications: {
      sessionAlerts: true,
      revenueReports: true,
      maintenanceReminders: true,
      lowBalanceAlerts: true,
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      // In a real implementation, these would be stored in a settings table
      console.log('Updating settings:', settings);
      return Promise.resolve(settings);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      console.error('Error updating settings:', error);
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(globalSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Hotspot Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure global settings and preferences for your hotspot network
          </p>
        </div>
        
        <Button onClick={handleSaveSettings} disabled={updateSettingsMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Default Hotspot Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Default Bandwidth Limit (Mbps)</Label>
                  <Input
                    type="number"
                    value={globalSettings.defaultBandwidthLimit}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      defaultBandwidthLimit: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div>
                  <Label>Default Max Concurrent Users</Label>
                  <Input
                    type="number"
                    value={globalSettings.defaultMaxUsers}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      defaultMaxUsers: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div>
                  <Label>Default Coverage Radius (meters)</Label>
                  <Input
                    type="number"
                    value={globalSettings.defaultCoverageRadius}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      defaultCoverageRadius: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Auto Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={globalSettings.autoSessionTimeout}
                  onChange={(e) => setGlobalSettings({
                    ...globalSettings,
                    autoSessionTimeout: parseInt(e.target.value) || 0
                  })}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically terminate inactive sessions after this duration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Control Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Guest Access</Label>
                  <p className="text-sm text-muted-foreground">Allow non-registered users to access WiFi</p>
                </div>
                <Switch
                  checked={globalSettings.enableGuestAccess}
                  onCheckedChange={(checked) => setGlobalSettings({
                    ...globalSettings,
                    enableGuestAccess: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Voucher System</Label>
                  <p className="text-sm text-muted-foreground">Allow paid access through voucher codes</p>
                </div>
                <Switch
                  checked={globalSettings.enableVoucherSystem}
                  onCheckedChange={(checked) => setGlobalSettings({
                    ...globalSettings,
                    enableVoucherSystem: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Client Authentication</Label>
                  <p className="text-sm text-muted-foreground">Auto-authenticate registered client devices</p>
                </div>
                <Switch
                  checked={globalSettings.enableClientAuth}
                  onCheckedChange={(checked) => setGlobalSettings({
                    ...globalSettings,
                    enableClientAuth: checked
                  })}
                />
              </div>

              {globalSettings.enableGuestAccess && (
                <div>
                  <Label>Guest Session Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={globalSettings.guestSessionDuration}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      guestSessionDuration: parseInt(e.target.value) || 0
                    })}
                    className="max-w-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Voucher Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>1 Hour Access (KES)</Label>
                  <Input
                    type="number"
                    value={globalSettings.voucherPricing.oneHour}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      voucherPricing: {
                        ...globalSettings.voucherPricing,
                        oneHour: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
                
                <div>
                  <Label>3 Hours Access (KES)</Label>
                  <Input
                    type="number"
                    value={globalSettings.voucherPricing.threeHours}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      voucherPricing: {
                        ...globalSettings.voucherPricing,
                        threeHours: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
                
                <div>
                  <Label>24 Hours Access (KES)</Label>
                  <Input
                    type="number"
                    value={globalSettings.voucherPricing.oneDay}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      voucherPricing: {
                        ...globalSettings.voucherPricing,
                        oneDay: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Session Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about session activities</p>
                </div>
                <Switch
                  checked={globalSettings.notifications.sessionAlerts}
                  onCheckedChange={(checked) => setGlobalSettings({
                    ...globalSettings,
                    notifications: {
                      ...globalSettings.notifications,
                      sessionAlerts: checked
                    }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Revenue Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive daily revenue summaries</p>
                </div>
                <Switch
                  checked={globalSettings.notifications.revenueReports}
                  onCheckedChange={(checked) => setGlobalSettings({
                    ...globalSettings,
                    notifications: {
                      ...globalSettings.notifications,
                      revenueReports: checked
                    }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded about scheduled maintenance</p>
                </div>
                <Switch
                  checked={globalSettings.notifications.maintenanceReminders}
                  onCheckedChange={(checked) => setGlobalSettings({
                    ...globalSettings,
                    notifications: {
                      ...globalSettings.notifications,
                      maintenanceReminders: checked
                    }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Balance Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert when hotspot revenue is low</p>
                </div>
                <Switch
                  checked={globalSettings.notifications.lowBalanceAlerts}
                  onCheckedChange={(checked) => setGlobalSettings({
                    ...globalSettings,
                    notifications: {
                      ...globalSettings.notifications,
                      lowBalanceAlerts: checked
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Advanced Settings</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Advanced configuration options will be available in future updates. 
                  Contact support for custom configurations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HotspotSettings;
