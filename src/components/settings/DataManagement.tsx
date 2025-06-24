
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Database, Shield, Trash2, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataManagement = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    dataRetentionDays: 365,
    autoCleanup: true,
    anonymizeData: true,
    backupBeforeCleanup: true,
    compressionEnabled: true,
    encryptionEnabled: true,
  });

  const handleDataValidation = () => {
    toast({
      title: "Data Validation Started",
      description: "Running comprehensive data validation checks...",
    });
  };

  const handleDataExport = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be ready for download shortly.",
    });
  };

  const handleDataCleanup = () => {
    toast({
      title: "Data Cleanup Initiated",
      description: "Old records are being archived and cleaned up.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Data Management Settings Updated",
      description: "Your data management settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Retention Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="retentionDays">Data Retention Period (days)</Label>
            <Input
              id="retentionDays"
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => setSettings({...settings, dataRetentionDays: parseInt(e.target.value)})}
              min="30"
              max="3650"
            />
            <p className="text-sm text-muted-foreground mt-1">
              How long to keep historical data before archiving
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoCleanup">Automatic Cleanup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically remove old data based on retention policies
                </p>
              </div>
              <Switch
                id="autoCleanup"
                checked={settings.autoCleanup}
                onCheckedChange={(checked) => setSettings({...settings, autoCleanup: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="anonymizeData">Anonymize Before Deletion</Label>
                <p className="text-sm text-muted-foreground">
                  Remove personal identifiers before cleanup
                </p>
              </div>
              <Switch
                id="anonymizeData"
                checked={settings.anonymizeData}
                onCheckedChange={(checked) => setSettings({...settings, anonymizeData: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backupBeforeCleanup">Backup Before Cleanup</Label>
                <p className="text-sm text-muted-foreground">
                  Create backup before removing data
                </p>
              </div>
              <Switch
                id="backupBeforeCleanup"
                checked={settings.backupBeforeCleanup}
                onCheckedChange={(checked) => setSettings({...settings, backupBeforeCleanup: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compression">Data Compression</Label>
              <p className="text-sm text-muted-foreground">
                Compress stored data to save space
              </p>
            </div>
            <Switch
              id="compression"
              checked={settings.compressionEnabled}
              onCheckedChange={(checked) => setSettings({...settings, compressionEnabled: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="encryption">Data Encryption</Label>
              <p className="text-sm text-muted-foreground">
                Encrypt sensitive data at rest
              </p>
            </div>
            <Switch
              id="encryption"
              checked={settings.encryptionEnabled}
              onCheckedChange={(checked) => setSettings({...settings, encryptionEnabled: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Data Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleDataValidation} variant="outline" className="h-20 flex flex-col gap-2">
              <Database className="h-6 w-6" />
              <span>Validate Data</span>
            </Button>

            <Button onClick={handleDataExport} variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Export Data</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-20 flex flex-col gap-2 border-red-200 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-6 w-6" />
                  <span>Cleanup Old Data</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Data Cleanup</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove old data based on your retention policies. 
                    Are you sure you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDataCleanup}>
                    Proceed with Cleanup
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Data Management Settings</Button>
      </div>
    </div>
  );
};

export default DataManagement;
