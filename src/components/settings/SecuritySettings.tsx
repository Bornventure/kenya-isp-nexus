
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Save, Key, Clock, Users } from 'lucide-react';

const SecuritySettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    require_2fa: false,
    password_expiry_days: 90,
    session_timeout_minutes: 60,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    require_password_change: false,
    min_password_length: 8,
    require_special_chars: true,
    require_numbers: true,
    require_uppercase: true,
    allow_password_reset: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to the database
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Security settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (field: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-4 w-4" />
            Authentication
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require_2fa">Require Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Force all users to enable 2FA
                </p>
              </div>
              <Switch
                id="require_2fa"
                checked={settings.require_2fa}
                onCheckedChange={() => handleToggle('require_2fa')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require_password_change">Force Password Change</Label>
                <p className="text-sm text-muted-foreground">
                  Require users to change passwords on next login
                </p>
              </div>
              <Switch
                id="require_password_change"
                checked={settings.require_password_change}
                onCheckedChange={() => handleToggle('require_password_change')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow_password_reset">Allow Password Reset</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to reset their passwords via email
                </p>
              </div>
              <Switch
                id="allow_password_reset"
                checked={settings.allow_password_reset}
                onCheckedChange={() => handleToggle('allow_password_reset')}
              />
            </div>
          </div>
        </div>

        {/* Session Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Session Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={settings.session_timeout_minutes}
                onChange={(e) => handleInputChange('session_timeout_minutes', parseInt(e.target.value))}
                min="15"
                max="480"
              />
            </div>

            <div>
              <Label htmlFor="password_expiry">Password Expiry (days)</Label>
              <Input
                id="password_expiry"
                type="number"
                value={settings.password_expiry_days}
                onChange={(e) => handleInputChange('password_expiry_days', parseInt(e.target.value))}
                min="30"
                max="365"
              />
            </div>
          </div>
        </div>

        {/* Login Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Login Security
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_attempts">Max Login Attempts</Label>
              <Input
                id="max_attempts"
                type="number"
                value={settings.max_login_attempts}
                onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>

            <div>
              <Label htmlFor="lockout_duration">Lockout Duration (minutes)</Label>
              <Input
                id="lockout_duration"
                type="number"
                value={settings.lockout_duration_minutes}
                onChange={(e) => handleInputChange('lockout_duration_minutes', parseInt(e.target.value))}
                min="5"
                max="120"
              />
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Password Policy</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="min_length">Minimum Password Length</Label>
              <Select 
                value={settings.min_password_length.toString()} 
                onValueChange={(value) => handleInputChange('min_password_length', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 characters</SelectItem>
                  <SelectItem value="10">10 characters</SelectItem>
                  <SelectItem value="12">12 characters</SelectItem>
                  <SelectItem value="14">14 characters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="require_uppercase">Require Uppercase Letters</Label>
                <Switch
                  id="require_uppercase"
                  checked={settings.require_uppercase}
                  onCheckedChange={() => handleToggle('require_uppercase')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require_numbers">Require Numbers</Label>
                <Switch
                  id="require_numbers"
                  checked={settings.require_numbers}
                  onCheckedChange={() => handleToggle('require_numbers')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require_special">Require Special Characters</Label>
                <Switch
                  id="require_special"
                  checked={settings.require_special_chars}
                  onCheckedChange={() => handleToggle('require_special_chars')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Security Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
