import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Router, Trash2, Edit, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
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
import { useEquipment } from '@/hooks/useEquipment';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AddSNMPDeviceDialog from '@/components/network/AddSNMPDeviceDialog';

interface NetworkDevice {
  id: string;
  name: string;
  ipAddress: string;
  type: string;
  status: 'active' | 'inactive' | 'pending';
  lastSeen: string;
}

const RealNetworkInfrastructureManager = () => {
  const { toast } = useToast();
  const [devices, setDevices] = useState<NetworkDevice[]>([
    {
      id: '1',
      name: 'Main Router',
      ipAddress: '192.168.1.1',
      type: 'Router',
      status: 'active',
      lastSeen: '2024-03-15 10:00'
    },
    {
      id: '2',
      name: 'Core Switch',
      ipAddress: '192.168.1.10',
      type: 'Switch',
      status: 'active',
      lastSeen: '2024-03-15 10:05'
    },
    {
      id: '3',
      name: 'Access Point 1',
      ipAddress: '192.168.1.20',
      type: 'Access Point',
      status: 'inactive',
      lastSeen: '2024-03-14 22:00'
    }
  ]);
  const [newDevice, setNewDevice] = useState({
    name: '',
    ipAddress: '',
    type: 'Router'
  });
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    ipAddress: '',
    type: ''
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<{ [ip: string]: boolean }>({});
  const { equipment, createEquipment, updateEquipment } = useEquipment();

  useEffect(() => {
    if (selectedDevice && isEditing) {
      const deviceToEdit = devices.find(device => device.id === selectedDevice);
      if (deviceToEdit) {
        setEditFormData({
          name: deviceToEdit.name,
          ipAddress: deviceToEdit.ipAddress,
          type: deviceToEdit.type
        });
      }
    }
  }, [selectedDevice, isEditing, devices]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewDevice({ ...newDevice, [e.target.name]: e.target.value });
  };

  const handleAddDevice = async (ip: string, community: string, version: number) => {
    setIsLoading(true);
    try {
      // Simulate adding a device
      const newDeviceId = Math.random().toString(36).substring(7);
      const newDeviceEntry = {
        id: newDeviceId,
        name: `SNMP Device @ ${ip}`,
        ipAddress: ip,
        type: 'SNMP Device',
        status: 'pending',
        lastSeen: new Date().toISOString()
      };
      setDevices([...devices, newDeviceEntry]);

      // Simulate success
      toast({
        title: "Device Added",
        description: `SNMP Device at ${ip} added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add device.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowAddDialog(false);
    }
  };

  const handleTestConnection = async (ip: string, community?: string, version?: number): Promise<boolean> => {
    setIsTestingConnection(true);
    try {
      // Simulate testing the connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestResults(prevResults => ({ ...prevResults, [ip]: true }));
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${ip}`,
      });
      return true;
    } catch (error) {
      setTestResults(prevResults => ({ ...prevResults, [ip]: false }));
      toast({
        title: "Connection Failed",
        description: `Could not connect to the device at ${ip}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleEditClick = (id: string) => {
    setSelectedDevice(id);
    setIsEditing(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateDevice = () => {
    if (!selectedDevice) return;

    const updatedDevices = devices.map(device =>
      device.id === selectedDevice ? { ...device, ...editFormData } : device
    );
    setDevices(updatedDevices);
    setIsEditing(false);
    setSelectedDevice(null);
    toast({
      title: "Device Updated",
      description: "Device information has been updated successfully.",
    });
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter(device => device.id !== id));
    toast({
      title: "Device Deleted",
      description: "Device has been removed from the infrastructure.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Router className="h-5 w-5" />
              Real Network Infrastructure
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{device.ipAddress}</TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell>
                      <Badge variant={device.status === 'active' ? 'default' : device.status === 'pending' ? 'secondary' : 'destructive'}>
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{device.lastSeen}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(device.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the device
                                from your infrastructure.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDevice(device.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedDevice && isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Device</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ipAddress" className="text-right">
                  IP Address
                </Label>
                <Input
                  id="ipAddress"
                  name="ipAddress"
                  value={editFormData.ipAddress}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Input
                  id="type"
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setSelectedDevice(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDevice}>
                Update Device
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AddSNMPDeviceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddDevice={handleAddDevice}
        onTestConnection={handleTestConnection}
      />
    </div>
  );
};

export default RealNetworkInfrastructureManager;
