
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
    passwordExpiry: 90,
  });

  const handleSave = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Password Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minLength">Minimum Password Length</Label>
              <Input
                id="minLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                min="6"
                max="32"
              />
            </div>
            <div>
              <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => setSettings({...settings, passwordExpiry: parseInt(e.target.value)})}
                min="30"
                max="365"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="specialChars">Require Special Characters</Label>
              <Switch
                id="specialChars"
                checked={settings.requireSpecialChars}
                onCheckedChange={(checked) => setSettings({...settings, requireSpecialChars: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers">Require Numbers</Label>
              <Switch
                id="numbers"
                checked={settings.requireNumbers}
                onCheckedChange={(checked) => setSettings({...settings, requireNumbers: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase">Require Uppercase Letters</Label>
              <Switch
                id="uppercase"
                checked={settings.requireUppercase}
                onCheckedChange={(checked) => setSettings({...settings, requireUppercase: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                min="5"
                max="480"
              />
            </div>
            <div>
              <Label htmlFor="maxAttempts">Max Login Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                min="3"
                max="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require users to verify identity with a second factor
              </p>
            </div>
            <Switch
              id="twoFactor"
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => setSettings({...settings, twoFactorEnabled: checked})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Security Settings</Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
