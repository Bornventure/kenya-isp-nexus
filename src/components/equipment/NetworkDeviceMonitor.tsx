import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2, Plus, CheckCircle, XCircle, Router } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useEquipment } from '@/hooks/useEquipment';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import AddSNMPDeviceDialog from '@/components/network/AddSNMPDeviceDialog';

interface NetworkDevice {
  id: string;
  name: string;
  ipAddress: string;
  deviceType: string;
  status: 'online' | 'offline';
  cpuUsage: number;
  memoryUsage: number;
  lastUpdated: string;
}

const mockNetworkDevices: NetworkDevice[] = [
  {
    id: '1',
    name: 'Router-01',
    ipAddress: '192.168.1.1',
    deviceType: 'Router',
    status: 'online',
    cpuUsage: 65,
    memoryUsage: 40,
    lastUpdated: '2024-08-20 14:30',
  },
  {
    id: '2',
    name: 'Switch-01',
    ipAddress: '192.168.1.2',
    deviceType: 'Switch',
    status: 'online',
    cpuUsage: 30,
    memoryUsage: 25,
    lastUpdated: '2024-08-20 14:32',
  },
  {
    id: '3',
    name: 'AP-01',
    ipAddress: '192.168.1.3',
    deviceType: 'Access Point',
    status: 'offline',
    cpuUsage: 0,
    memoryUsage: 0,
    lastUpdated: '2024-08-20 14:28',
  },
];

const NetworkDeviceMonitor: React.FC = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>(mockNetworkDevices);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    ipAddress: '',
    deviceType: '',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { equipment, updateEquipment } = useEquipment();

  useEffect(() => {
    // Simulate fetching devices from an API or database
    // In a real application, you would use a useEffect hook to fetch data
    // and update the devices state.
  }, []);

  const handleDeviceSelect = (device: NetworkDevice) => {
    setSelectedDevice(device);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (selectedDevice) {
      setIsEditing(true);
      setEditFormData({
        name: selectedDevice.name,
        ipAddress: selectedDevice.ipAddress,
        deviceType: selectedDevice.deviceType,
      });
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateDevice = () => {
    if (selectedDevice) {
      const updatedDevice = {
        ...selectedDevice,
        name: editFormData.name,
        ipAddress: editFormData.ipAddress,
        deviceType: editFormData.deviceType,
      };
      setDevices(
        devices.map((device) => (device.id === selectedDevice.id ? updatedDevice : device))
      );
      setSelectedDevice(updatedDevice);
      setIsEditing(false);
      toast({
        title: "Device Updated",
        description: "Network device has been updated successfully.",
      });
    }
  };

  const handleDeleteDevice = () => {
    if (selectedDevice) {
      setDevices(devices.filter((device) => device.id !== selectedDevice.id));
      setSelectedDevice(null);
      setIsEditing(false);
      toast({
        title: "Device Deleted",
        description: "Network device has been removed.",
      });
    }
  };

  const handleAddDevice = async (ip: string, community: string, version: number) => {
    setIsLoading(true);
    try {
      // Simulate adding a device
      const newDevice: NetworkDevice = {
        id: String(devices.length + 1),
        name: `New Device ${devices.length + 1}`,
        ipAddress: ip,
        deviceType: 'Unknown',
        status: 'offline',
        cpuUsage: 0,
        memoryUsage: 0,
        lastUpdated: new Date().toISOString(),
      };
      setDevices([...devices, newDevice]);
      toast({
        title: "Device Added",
        description: `Successfully added device with IP ${ip}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add the device",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowAddDialog(false);
    }
  };

  const handleTestConnection = async (ip: string, community: string, version: number) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Simulate a successful connection
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${ip}`,
        });
        resolve(true);
      }, 1500);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Network Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow
                    key={device.id}
                    onClick={() => handleDeviceSelect(device)}
                    className={`cursor-pointer ${selectedDevice?.id === device.id ? 'bg-muted' : ''
                      }`}
                  >
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{device.deviceType}</TableCell>
                    <TableCell>
                      <Badge variant={device.status === 'online' ? 'outline' : 'secondary'}>
                        {device.status === 'online' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {device.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <div className="p-4">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Device Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDevice ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{selectedDevice.name}</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleEditClick} disabled={isEditing}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteDevice}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                        <Router className="h-4 w-4 mr-2" />
                        View in Network Diagram
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator />

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-ip">IP Address</Label>
                    <Input
                      type="text"
                      id="edit-ip"
                      name="ipAddress"
                      value={editFormData.ipAddress}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-type">Device Type</Label>
                    <Select
                      value={editFormData.deviceType}
                      onValueChange={(value) =>
                        handleEditFormChange({
                          target: { name: 'deviceType', value } as any,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a device type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Router">Router</SelectItem>
                        <SelectItem value="Switch">Switch</SelectItem>
                        <SelectItem value="Access Point">Access Point</SelectItem>
                        <SelectItem value="Firewall">Firewall</SelectItem>
                        <SelectItem value="Load Balancer">Load Balancer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleUpdateDevice}>Update Device</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>IP Address</Label>
                      <Input type="text" value={selectedDevice.ipAddress} readOnly />
                    </div>
                    <div>
                      <Label>Device Type</Label>
                      <Input type="text" value={selectedDevice.deviceType} readOnly />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium">Performance</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cpu-usage">CPU Usage</Label>
                        <span>{selectedDevice.cpuUsage}%</span>
                      </div>
                      <Progress id="cpu-usage" value={selectedDevice.cpuUsage} />
                      <div className="flex items-center justify-between">
                        <Label htmlFor="memory-usage">Memory Usage</Label>
                        <span>{selectedDevice.memoryUsage}%</span>
                      </div>
                      <Progress id="memory-usage" value={selectedDevice.memoryUsage} />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <Label>Status</Label>
                        <Badge variant={selectedDevice.status === 'online' ? 'outline' : 'secondary'}>
                          {selectedDevice.status === 'online' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {selectedDevice.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Last Updated</Label>
                        <span>{selectedDevice.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Router className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No Device Selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a network device from the list to view details
              </p>
            </div>
          )}
        </CardContent>

        <AddSNMPDeviceDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAddDevice={handleAddDevice}
          onTestConnection={handleTestConnection}
        />
      </div>
    </div>
  );
};

export default NetworkDeviceMonitor;
