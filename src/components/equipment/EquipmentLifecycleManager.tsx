
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Wrench,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EquipmentLifecycleManager = () => {
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [maintenanceData, setMaintenanceData] = useState({
    type: '',
    description: '',
    scheduledDate: '',
    technician: '',
    estimatedDuration: ''
  });

  // Mock equipment data with lifecycle stages
  const equipmentList = [
    {
      id: 'eq-001',
      name: 'Router - Main Gateway',
      model: 'Cisco ISR4321',
      status: 'deployed',
      stage: 'production',
      health: 95,
      lastMaintenance: '2024-05-15',
      nextMaintenance: '2024-08-15',
      firmwareVersion: '16.09.05',
      location: 'Main Office',
      uptime: '99.8%'
    },
    {
      id: 'eq-002',
      name: 'Switch - Distribution A',
      model: 'Ubiquiti 24-Port',
      status: 'maintenance',
      stage: 'maintenance',
      health: 78,
      lastMaintenance: '2024-06-20',
      nextMaintenance: '2024-06-22',
      firmwareVersion: '1.11.0',
      location: 'Zone A',
      uptime: '0%'
    },
    {
      id: 'eq-003',
      name: 'Access Point - Zone B',
      model: 'UniFi AC Pro',
      status: 'end_of_life',
      stage: 'disposal',
      health: 45,
      lastMaintenance: '2024-03-10',
      nextMaintenance: 'N/A',
      firmwareVersion: '4.3.20',
      location: 'Zone B',
      uptime: '85%'
    }
  ];

  const handleScheduleMaintenance = () => {
    toast({
      title: "Maintenance Scheduled",
      description: `Maintenance scheduled for ${maintenanceData.scheduledDate}`,
    });
  };

  const handleFirmwareUpdate = (equipmentId: string) => {
    toast({
      title: "Firmware Update Initiated",
      description: `Firmware update started for equipment ${equipmentId}`,
    });
  };

  const handleRetirement = (equipmentId: string) => {
    toast({
      title: "Equipment Retirement",
      description: `Equipment ${equipmentId} marked for retirement`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'end_of_life': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'production': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-yellow-500" />;
      case 'disposal': return <Trash2 className="h-4 w-4 text-red-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Equipment Lifecycle Management</h2>
        <p className="text-muted-foreground">
          Manage equipment from purchase to disposal, including maintenance and health monitoring.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="firmware">Firmware</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            {equipmentList.map((equipment) => (
              <Card key={equipment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStageIcon(equipment.stage)}
                      <div>
                        <h4 className="font-medium">{equipment.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {equipment.model} • {equipment.location}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-white ${getStatusColor(equipment.status)}`}>
                      {equipment.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Health Score</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={equipment.health} className="flex-1" />
                        <span className="text-sm font-medium">{equipment.health}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <div className="font-medium">{equipment.uptime}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Last Maintenance</span>
                      <div className="font-medium">{equipment.lastMaintenance}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Firmware</span>
                      <div className="font-medium">{equipment.firmwareVersion}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleFirmwareUpdate(equipment.id)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Update Firmware
                    </Button>
                    {equipment.stage !== 'disposal' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedEquipment(equipment.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Maintenance
                      </Button>
                    )}
                    {equipment.stage === 'production' && equipment.health < 50 && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRetirement(equipment.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Mark for Retirement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Maintenance</CardTitle>
              <CardDescription>
                Plan and schedule maintenance activities for network equipment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipment">Equipment</Label>
                  <Select
                    value={selectedEquipment}
                    onValueChange={setSelectedEquipment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentList.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Select
                    value={maintenanceData.type}
                    onValueChange={(value) => setMaintenanceData({
                      ...maintenanceData,
                      type: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={maintenanceData.scheduledDate}
                    onChange={(e) => setMaintenanceData({
                      ...maintenanceData,
                      scheduledDate: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="technician">Assigned Technician</Label>
                  <Select
                    value={maintenanceData.technician}
                    onValueChange={(value) => setMaintenanceData({
                      ...maintenanceData,
                      technician: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech-001">John Doe</SelectItem>
                      <SelectItem value="tech-002">Jane Smith</SelectItem>
                      <SelectItem value="tech-003">Mike Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the maintenance work to be performed..."
                  value={maintenanceData.description}
                  onChange={(e) => setMaintenanceData({
                    ...maintenanceData,
                    description: e.target.value
                  })}
                />
              </div>

              <Button onClick={handleScheduleMaintenance}>
                Schedule Maintenance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firmware">
          <Card>
            <CardHeader>
              <CardTitle>Firmware Management</CardTitle>
              <CardDescription>
                Track and manage firmware updates across all equipment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipmentList.map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{equipment.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: {equipment.firmwareVersion}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Latest: 16.09.06</Badge>
                      <Button 
                        size="sm"
                        onClick={() => handleFirmwareUpdate(equipment.id)}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Equipment Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">83%</div>
                <p className="text-sm text-muted-foreground">Average health score</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Maintenance Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <p className="text-sm text-muted-foreground">Devices need maintenance</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">End of Life</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">1</div>
                <p className="text-sm text-muted-foreground">Device marked for disposal</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipmentLifecycleManager;
