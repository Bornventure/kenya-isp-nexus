
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GDPRCompliance = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    cookieConsent: true,
    dataProcessingConsent: true,
    marketingConsent: false,
    dataRetention: true,
    rightToErasure: true,
    dataPortability: true,
    consentTracking: true,
  });

  const [retentionPolicies] = useState([
    { type: 'Client Data', period: '7 years', status: 'active' },
    { type: 'Support Tickets', period: '2 years', status: 'active' },
    { type: 'Payment Records', period: '10 years', status: 'active' },
    { type: 'Marketing Data', period: '3 years', status: 'pending' },
  ]);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "GDPR Setting Updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">GDPR Compliance</h2>
        <p className="text-muted-foreground">
          Manage data protection and privacy controls to ensure GDPR compliance.
        </p>
      </div>

      <Tabs defaultValue="consent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="rights">Data Subject Rights</TabsTrigger>
          <TabsTrigger value="reporting">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="consent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Consent Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cookie-consent">Cookie Consent</Label>
                    <p className="text-sm text-muted-foreground">
                      Require user consent for non-essential cookies
                    </p>
                  </div>
                  <Switch
                    id="cookie-consent"
                    checked={settings.cookieConsent}
                    onCheckedChange={(checked) => handleSettingChange('cookieConsent', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-processing">Data Processing Consent</Label>
                    <p className="text-sm text-muted-foreground">
                      Explicit consent for processing personal data
                    </p>
                  </div>
                  <Switch
                    id="data-processing"
                    checked={settings.dataProcessingConsent}
                    onCheckedChange={(checked) => handleSettingChange('dataProcessingConsent', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-consent">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Consent for marketing emails and SMS
                    </p>
                  </div>
                  <Switch
                    id="marketing-consent"
                    checked={settings.marketingConsent}
                    onCheckedChange={(checked) => handleSettingChange('marketingConsent', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="consent-tracking">Consent Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Track and log all consent changes
                    </p>
                  </div>
                  <Switch
                    id="consent-tracking"
                    checked={settings.consentTracking}
                    onCheckedChange={(checked) => handleSettingChange('consentTracking', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Data Retention Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionPolicies.map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{policy.type}</div>
                      <div className="text-sm text-muted-foreground">
                        Retention period: {policy.period}
                      </div>
                    </div>
                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                      {policy.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button>Configure Retention Policies</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Subject Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="right-erasure">Right to Erasure</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to request data deletion
                    </p>
                  </div>
                  <Switch
                    id="right-erasure"
                    checked={settings.rightToErasure}
                    onCheckedChange={(checked) => handleSettingChange('rightToErasure', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-portability">Data Portability</Label>
                    <p className="text-sm text-muted-foreground">
                      Provide data export functionality
                    </p>
                  </div>
                  <Switch
                    id="data-portability"
                    checked={settings.dataPortability}
                    onCheckedChange={(checked) => handleSettingChange('dataPortability', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  Process Data Request
                </Button>
                <Button variant="outline">
                  Generate Data Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button>
                  Generate Privacy Report
                </Button>
                <Button>
                  Export Consent Log
                </Button>
                <Button>
                  Data Breach Report
                </Button>
                <Button>
                  Retention Report
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Compliance Status</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Last compliance audit: 30 days ago. Next audit due in 335 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GDPRCompliance;
