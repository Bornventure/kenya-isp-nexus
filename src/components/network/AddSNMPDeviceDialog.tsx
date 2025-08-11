
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddSNMPDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDevice: (ip: string, community: string, version: number) => Promise<void>;
  onTestConnection: (ip: string, community: string, version: number) => Promise<boolean>;
}

const AddSNMPDeviceDialog: React.FC<AddSNMPDeviceDialogProps> = ({
  open,
  onOpenChange,
  onAddDevice,
  onTestConnection
}) => {
  const [ip, setIp] = useState('');
  const [community, setCommunity] = useState('public');
  const [version, setVersion] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    if (!ip) {
      toast({
        title: "Error",
        description: "Please enter an IP address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await onTestConnection(ip, community, version);
      if (success) {
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${ip}`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to the device",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!ip) {
      toast({
        title: "Error",
        description: "Please enter an IP address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAddDevice(ip, community, version);
      setIp('');
      setCommunity('public');
      setVersion(2);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add SNMP Device</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ip" className="text-right">
              IP Address
            </Label>
            <Input
              id="ip"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="community" className="text-right">
              Community
            </Label>
            <Input
              id="community"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              placeholder="public"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="version" className="text-right">
              Version
            </Label>
            <Select value={version.toString()} onValueChange={(value) => setVersion(parseInt(value))}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">SNMP v1</SelectItem>
                <SelectItem value="2">SNMP v2c</SelectItem>
                <SelectItem value="3">SNMP v3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            Test Connection
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDevice} disabled={isLoading}>
              Add Device
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSNMPDeviceDialog;
