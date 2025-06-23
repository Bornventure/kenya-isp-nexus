
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorRequired: false,
    ipWhitelistEnabled: false,
    auditLogging: true,
  });

  const handleSave = () => {
    // TODO: Implement actual save functionality
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">
          Configure security policies and authentication settings for your organization.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Policy
            </CardTitle>
            <CardDescription>
              Set requirements for user passwords to ensure account security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minLength">Minimum Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  min="6"
                  max="32"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordMinLength: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="uppercase">Require Uppercase Letters</Label>
                <Switch
                  id="uppercase"
                  checked={settings.requireUppercase}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    requireUppercase: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="numbers">Require Numbers</Label>
                <Switch
                  id="numbers"
                  checked={settings.requireNumbers}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    requireNumbers: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="special">Require Special Characters</Label>
                <Switch
                  id="special"
                  checked={settings.requireSpecialChars}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    requireSpecialChars: checked
                  })}
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
            <CardDescription>
              Control user session behavior and automatic logouts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  sessionTimeout: parseInt(e.target.value)
                })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Users will be automatically logged out after this period of inactivity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Account Protection
            </CardTitle>
            <CardDescription>
              Configure protection against unauthorized access attempts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxLoginAttempts: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  min="5"
                  max="60"
                  value={settings.lockoutDuration}
                  onChange={(e) => setSettings({
                    ...settings,
                    lockoutDuration: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Advanced Security
            </CardTitle>
            <CardDescription>
              Enable additional security features for enhanced protection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require all users to enable 2FA
                </p>
              </div>
              <Switch
                id="twoFactor"
                checked={settings.twoFactorRequired}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  twoFactorRequired: checked
                })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ipWhitelist">IP Address Restrictions</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <Switch
                id="ipWhitelist"
                checked={settings.ipWhitelistEnabled}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  ipWhitelistEnabled: checked
                })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auditLog">Audit Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Log all user actions and system changes
                </p>
              </div>
              <Switch
                id="auditLog"
                checked={settings.auditLogging}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  auditLogging: checked
                })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Save Security Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
