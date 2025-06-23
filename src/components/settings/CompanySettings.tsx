
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building, Palette, Globe, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CompanySettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    companyName: 'DataDefender ISP',
    companyEmail: 'admin@datadefender.com',
    companyPhone: '+254700000000',
    companyAddress: 'Nairobi, Kenya',
    kraPin: 'P051234567X',
    licenseNumber: 'CA-001-2024',
    website: 'https://datadefender.com',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    logoUrl: '',
    timezone: 'Africa/Nairobi',
    currency: 'KES',
    language: 'en',
    dateFormat: 'dd/MM/yyyy',
    enableBranding: true,
    enableCustomTheme: false,
  });

  const handleSave = () => {
    // TODO: Implement actual save functionality
    toast({
      title: "Company Settings Updated",
      description: "Your company settings have been saved successfully.",
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement file upload
      toast({
        title: "Logo Upload",
        description: "Logo upload functionality will be implemented soon.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Company Settings</h2>
        <p className="text-muted-foreground">
          Manage your company information and branding preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic company details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyName: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={settings.licenseNumber}
                  onChange={(e) => setSettings({
                    ...settings,
                    licenseNumber: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyEmail">Company Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyEmail: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="companyPhone">Company Phone</Label>
                <Input
                  id="companyPhone"
                  value={settings.companyPhone}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyPhone: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kraPin">KRA PIN</Label>
                <Input
                  id="kraPin"
                  value={settings.kraPin}
                  onChange={(e) => setSettings({
                    ...settings,
                    kraPin: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.website}
                  onChange={(e) => setSettings({
                    ...settings,
                    website: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="companyAddress">Company Address</Label>
              <Textarea
                id="companyAddress"
                value={settings.companyAddress}
                onChange={(e) => setSettings({
                  ...settings,
                  companyAddress: e.target.value
                })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding & Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding & Theme
            </CardTitle>
            <CardDescription>
              Customize your company's visual identity and branding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo">Company Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <Button variant="outline" onClick={() => document.getElementById('logoInput')?.click()}>
                  Upload Logo
                </Button>
                <input
                  id="logoInput"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      primaryColor: e.target.value
                    })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      primaryColor: e.target.value
                    })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      secondaryColor: e.target.value
                    })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      secondaryColor: e.target.value
                    })}
                    placeholder="#64748b"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableBranding">Enable Company Branding</Label>
                  <p className="text-sm text-muted-foreground">
                    Show company logo and colors in the interface
                  </p>
                </div>
                <Switch
                  id="enableBranding"
                  checked={settings.enableBranding}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    enableBranding: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCustomTheme">Enable Custom Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply custom colors throughout the system
                  </p>
                </div>
                <Switch
                  id="enableCustomTheme"
                  checked={settings.enableCustomTheme}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    enableCustomTheme: checked
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>
              Configure regional preferences and localization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    timezone: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Africa/Cairo">Africa/Cairo (CAT)</SelectItem>
                    <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    currency: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    language: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    dateFormat: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Save Company Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
