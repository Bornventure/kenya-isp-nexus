
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TestTube, Plus } from 'lucide-react';

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
  const [ip, setIp] = useState('');
  const [community, setCommunity] = useState('public');
  const [version, setVersion] = useState(2);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    if (!ip.trim()) return;
    
    setIsTestingConnection(true);
    try {
      await onTestConnection(ip, community, version);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAddDevice = async () => {
    if (!ip.trim()) return;
    
    try {
      await onDeviceAdded(ip, community, version);
      // Reset form
      setIp('');
      setCommunity('public');
      setVersion(2);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add SNMP Network Device</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ip">Device IP Address</Label>
            <Input
              id="ip"
              placeholder="192.168.1.1"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the IP address of your router, switch, or access point
            </p>
          </div>

          <div>
            <Label htmlFor="community">SNMP Community String</Label>
            <Input
              id="community"
              placeholder="public"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
            />
          </div>

          <div>
            <Label>SNMP Version</Label>
            <Select value={version.toString()} onValueChange={(value) => setVersion(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">SNMP v1</SelectItem>
                <SelectItem value="2">SNMP v2c</SelectItem>
                <SelectItem value="3">SNMP v3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!ip.trim() || isTestingConnection || isLoading}
              className="flex-1"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button
              onClick={handleAddDevice}
              disabled={!ip.trim() || isLoading || isTestingConnection}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSNMPDeviceDialog;
