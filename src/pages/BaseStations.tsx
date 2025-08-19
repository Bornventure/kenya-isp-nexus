
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Radio, MapPin, Activity, AlertTriangle, Edit, Settings } from 'lucide-react';
import { useNetworkEquipment } from '@/hooks/useNetworkEquipment';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const BaseStations = () => {
  const { equipment, isLoading, refetch } = useNetworkEquipment();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter equipment to show base stations, routers, and access points
  const baseStationEquipment = equipment.filter(item => 
    ['base_station', 'router', 'access_point', 'wireless_router', 'antenna'].includes(item.type.toLowerCase()) ||
    item.type.toLowerCase().includes('station') ||
    item.type.toLowerCase().includes('router') ||
    item.equipment_types?.name?.toLowerCase().includes('base') ||
    item.equipment_types?.name?.toLowerCase().includes('router')
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'deployed':
      case 'active': 
        return 'bg-green-500';
      case 'maintenance':
      case 'assigned': 
        return 'bg-yellow-500';
      case 'available':
        return 'bg-blue-500';
      case 'faulty':
      case 'offline': 
        return 'bg-red-500';
      default: 
        return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'deployed':
      case 'active': 
        return 'default';
      case 'maintenance':
      case 'assigned': 
        return 'secondary';
      case 'faulty':
      case 'offline': 
        return 'destructive';
      default: 
        return 'secondary';
    }
  };

  const handleConfigure = (equipment: any) => {
    toast({
      title: "Configuration",
      description: `Opening configuration for ${equipment.brand} ${equipment.model}`,
    });
    // Here you would implement the actual configuration logic
  };

  const handleMonitor = (equipment: any) => {
    toast({
      title: "Monitoring",
      description: `Starting monitoring for ${equipment.brand} ${equipment.model}`,
    });
    // Here you would implement the actual monitoring logic
  };

  const handleCreateStation = () => {
    toast({
      title: "Create Base Station",
      description: "This would open the equipment creation form",
    });
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading base stations...</div>;
  }

  const onlineStations = baseStationEquipment.filter(s => ['deployed', 'active'].includes(s.status.toLowerCase()));
  const warningStations = baseStationEquipment.filter(s => ['maintenance', 'assigned'].includes(s.status.toLowerCase()));
  const offlineStations = baseStationEquipment.filter(s => ['faulty', 'offline'].includes(s.status.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base Stations</h1>
          <p className="text-muted-foreground">Monitor and manage your network base stations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Station
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Base Station</DialogTitle>
              <DialogDescription>Register a new base station or network equipment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To add a new base station, please use the Equipment Management section to register new network equipment.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Close</Button>
                <Button onClick={handleCreateStation}>Go to Equipment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Radio className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onlineStations.length}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warningStations.length}</p>
                <p className="text-sm text-muted-foreground">Warning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offlineStations.length}</p>
                <p className="text-sm text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Radio className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{baseStationEquipment.length}</p>
                <p className="text-sm text-muted-foreground">Total Stations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {baseStationEquipment.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No base stations found</h3>
            <p className="text-muted-foreground">
              Register network equipment in the Equipment Management section to see them here.
            </p>
          </div>
        ) : (
          baseStationEquipment.map((station) => (
            <Card key={station.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(station.status)} text-white`}>
                      <Radio className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {station.brand && station.model ? `${station.brand} ${station.model}` : station.type}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {station.location || 'Location not specified'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(station.status)}>
                    {station.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">IP Address</p>
                      <p className="font-semibold">{station.ip_address || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Serial Number</p>
                      <p className="font-semibold">{station.serial_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-semibold">{station.equipment_types?.name || station.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">MAC Address</p>
                      <p className="font-semibold">{station.mac_address || 'Not specified'}</p>
                    </div>
                  </div>

                  {station.notes && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Notes</p>
                      <p className="text-sm bg-muted p-2 rounded">{station.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConfigure(station)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleMonitor(station)}
                    >
                      <Activity className="h-4 w-4 mr-1" />
                      Monitor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BaseStations;
