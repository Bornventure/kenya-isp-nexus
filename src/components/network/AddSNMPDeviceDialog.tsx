
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wifi, TestTube } from 'lucide-react';

interface AddSNMPDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeviceAdded: (ip: string, community: string, version: number) => Promise<void>;
  onTestConnection: (ip: string, community: string, version: number) => Promise<boolean>;
  isLoading: boolean;
}

const AddSNMPDeviceDialog: React.FC<AddSNMPDeviceDialogProps> = ({
  open,
  onOpenChange,
  onDeviceAdded,
  onTestConnection,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    ip: '',
    community: 'public',
    version: '2'
  });
  const [testResult, setTestResult] = useState<{ tested: boolean; success: boolean } | null>(null);

  const handleTestConnection = async () => {
    if (!formData.ip) {
      return;
    }

    const success = await onTestConnection(
      formData.ip,
      formData.community,
      parseInt(formData.version)
    );

    setTestResult({ tested: true, success });
  };

  const handleAddDevice = async () => {
    if (!formData.ip) {
      return;
    }

    try {
      await onDeviceAdded(
        formData.ip,
        formData.community,
        parseInt(formData.version)
      );

      // Reset form and close dialog
      setFormData({ ip: '', community: 'public', version: '2' });
      setTestResult(null);
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset test result when form changes
    setTestResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Add SNMP Network Device
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Device Information</CardTitle>
              <CardDescription>
                Enter the IP address and SNMP settings for your router, switch, or access point.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ip">IP Address *</Label>
                <Input
                  id="ip"
                  placeholder="192.168.1.1"
                  value={formData.ip}
                  onChange={(e) => handleInputChange('ip', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the gateway IP or management IP of the device
                </p>
              </div>

              <div>
                <Label htmlFor="community">SNMP Community</Label>
                <Input
                  id="community"
                  placeholder="public"
                  value={formData.community}
                  onChange={(e) => handleInputChange('community', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usually 'public' for read-only access
                </p>
              </div>

              <div>
                <Label htmlFor="version">SNMP Version</Label>
                <Select
                  value={formData.version}
                  onValueChange={(value) => handleInputChange('version', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Version 1</SelectItem>
                    <SelectItem value="2">Version 2c (Recommended)</SelectItem>
                    <SelectItem value="3">Version 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {testResult && (
            <Card className={testResult.success ? "border-green-200" : "border-red-200"}>
              <CardContent className="pt-6">
                <div className={`text-sm ${testResult.success ? "text-green-700" : "text-red-700"}`}>
                  {testResult.success ? (
                    <>✅ Connection successful! Device is responding to SNMP requests.</>
                  ) : (
                    <>❌ Connection failed. Please check the IP address, SNMP community, and device configuration.</>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!formData.ip || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>

            <Button
              onClick={handleAddDevice}
              disabled={!formData.ip || isLoading || (testResult?.tested && !testResult.success)}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Add Device
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p><strong>Note:</strong> Make sure SNMP is enabled on your device and the community string is configured correctly.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSNMPDeviceDialog;
