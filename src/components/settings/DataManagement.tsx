import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Database, FileText, Upload, Download, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataManagement = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    dataRetentionDays: 365,
    enableArchiving: true,
    archiveAfterDays: 180,
    enableDuplicateDetection: true,
    enableDataValidation: true,
    maxFileSize: 10,
    allowedFileTypes: 'pdf,doc,docx,xls,xlsx,jpg,png',
  });

  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleSave = () => {
    toast({
      title: "Data Management Settings Updated",
      description: "Your data management preferences have been saved.",
    });
  };

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          toast({
            title: "Backup Complete",
            description: "System backup has been completed successfully.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleExportData = (type: string) => {
    toast({
      title: "Export Started",
      description: `${type} export has been initiated. You'll receive a download link shortly.`,
    });
  };

  const handleImportData = (type: string) => {
    toast({
      title: "Import Ready",
      description: `${type} import functionality will be implemented soon.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
        <p className="text-muted-foreground">
          Manage data backup, import/export, and integrity settings.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Backup & Recovery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup & Recovery
            </CardTitle>
            <CardDescription>
              Configure automatic backups and data recovery options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Enable scheduled system backups
                </p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  autoBackup: checked
                })}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="backupFreq">Backup Frequency</Label>
                <Select
                  value={settings.backupFrequency}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    backupFrequency: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="retention">Backup Retention (days)</Label>
                <Input
                  id="retention"
                  type="number"
                  min="7"
                  max="365"
                  value={settings.backupRetention}
                  onChange={(e) => setSettings({
                    ...settings,
                    backupRetention: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <div className="flex flex-col justify-end">
                <Button 
                  onClick={handleBackupNow}
                  disabled={isBackingUp}
                  className="w-full"
                >
                  {isBackingUp ? 'Backing Up...' : 'Backup Now'}
                </Button>
              </div>
            </div>
            
            {isBackingUp && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Backup Progress</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Import/Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Import/Export
            </CardTitle>
            <CardDescription>
              Bulk import and export data for various system entities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Export Data</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportData('Clients')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Clients
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportData('Equipment')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Equipment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportData('Invoices')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Invoices
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExportData('Payments')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Payments
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Import Data</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleImportData('Clients')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Clients
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleImportData('Equipment')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Equipment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleImportData('Service Packages')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Packages
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="maxFileSize">Max Import File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxFileSize: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="allowedTypes">Allowed File Types</Label>
                <Input
                  id="allowedTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({
                    ...settings,
                    allowedFileTypes: e.target.value
                  })}
                  placeholder="pdf,doc,xls,csv"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Integrity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Data Integrity & Validation
            </CardTitle>
            <CardDescription>
              Configure data validation and integrity checks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataRetention">Data Retention (days)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  min="30"
                  max="2555"
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    dataRetentionDays: parseInt(e.target.value)
                  })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How long to keep logs and transaction records
                </p>
              </div>
              
              <div>
                <Label htmlFor="archiveAfter">Archive After (days)</Label>
                <Input
                  id="archiveAfter"
                  type="number"
                  min="30"
                  max="365"
                  value={settings.archiveAfterDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    archiveAfterDays: parseInt(e.target.value)
                  })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Move old records to archive storage
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableArchiving">Enable Automatic Archiving</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically archive old records
                  </p>
                </div>
                <Switch
                  id="enableArchiving"
                  checked={settings.enableArchiving}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    enableArchiving: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="duplicateDetection">Duplicate Detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent duplicate client and equipment records
                  </p>
                </div>
                <Switch
                  id="duplicateDetection"
                  checked={settings.enableDuplicateDetection}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    enableDuplicateDetection: checked
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataValidation">Enhanced Data Validation</Label>
                  <p className="text-sm text-muted-foreground">
                    Strict validation rules for form inputs
                  </p>
                </div>
                <Switch
                  id="dataValidation"
                  checked={settings.enableDataValidation}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    enableDataValidation: checked
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Save Data Management Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
