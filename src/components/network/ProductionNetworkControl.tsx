import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Circle, CheckCircle, XCircle, Router, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import AddSNMPDeviceDialog from '@/components/network/AddSNMPDeviceDialog';

const ProductionNetworkControl = () => {
  const [isFirewallEnabled, setIsFirewallEnabled] = useState(true);
  const [bandwidthLimit, setBandwidthLimit] = useState(50);
  const [selectedQoSProfile, setSelectedQoSProfile] = useState('premium');
  const [networkHealth, setNetworkHealth] = useState('good');
  const [activeConnections, setActiveConnections] = useState(128);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching network health and active connections
    const intervalId = setInterval(() => {
      setNetworkHealth(Math.random() > 0.2 ? 'good' : 'poor');
      setActiveConnections(Math.floor(Math.random() * 200));
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleFirewallToggle = () => {
    setIsFirewallEnabled(!isFirewallEnabled);
    toast({
      title: "Firewall Settings Updated",
      description: `Firewall is now ${isFirewallEnabled ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleBandwidthChange = (value: number[]) => {
    setBandwidthLimit(value[0]);
    toast({
      title: "Bandwidth Limit Updated",
      description: `Bandwidth limit set to ${value[0]} Mbps.`,
    });
  };

  const handleQoSProfileChange = (value: string) => {
    setSelectedQoSProfile(value);
    toast({
      title: "QoS Profile Updated",
      description: `QoS profile set to ${value}.`,
    });
  };

  const handleAddDevice = async (ip: string, community: string, version: number) => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        toast({
          title: "Device Added",
          description: `Successfully added device with IP: ${ip}`,
        });
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const handleTestConnection = async (ip: string, community?: string, version?: number) => {
    setIsLoading(true);
    return new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          toast({
            title: "Connection Successful",
            description: `Successfully connected to ${ip}`,
          });
          setIsLoading(false);
          resolve(true);
        } else {
          toast({
            title: "Connection Failed",
            description: "Could not connect to the device",
            variant: "destructive",
          });
          setIsLoading(false);
          reject(false);
        }
      }, 1000);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Production Network Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firewall">Firewall</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="firewall" checked={isFirewallEnabled} onCheckedChange={handleFirewallToggle} />
                <span>{isFirewallEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="bandwidth">Bandwidth Limit (Mbps)</Label>
              <Slider
                id="bandwidth"
                defaultValue={[bandwidthLimit]}
                max={100}
                step={1}
                onValueChange={handleBandwidthChange}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">Current limit: {bandwidthLimit} Mbps</p>
            </div>

            <div>
              <Label htmlFor="qos">QoS Profile</Label>
              <Select value={selectedQoSProfile} onValueChange={handleQoSProfileChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select QoS Profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Network Health</Label>
              <div className="mt-2">
                <Badge variant={networkHealth === 'good' ? 'outline' : 'destructive'}>
                  {networkHealth === 'good' ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Good</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      <span>Poor</span>
                    </div>
                  )}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Active Connections</Label>
              <div className="mt-2">
                <Badge variant="secondary">
                  <div className="flex items-center gap-1">
                    <Circle className="h-3 w-3" />
                    <span>{activeConnections}</span>
                  </div>
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Network Device Monitoring</CardTitle>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Monitor and manage network devices in real-time.
          </p>
          <Separator className="my-4" />
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Router className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Main Router</h4>
                  <p className="text-sm text-muted-foreground">192.168.1.1</p>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Router className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Core Switch</h4>
                  <p className="text-sm text-muted-foreground">192.168.1.2</p>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Router className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Access Point 1</h4>
                  <p className="text-sm text-muted-foreground">192.168.1.10</p>
                </div>
              </div>
              <Badge variant="destructive">Inactive</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddSNMPDeviceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddDevice={handleAddDevice}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
};

export default ProductionNetworkControl;
