
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wrench } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EquipmentActionsProps {
  clientId?: string;
  onEquipmentAdded?: () => void;
  onMaintenanceScheduled?: () => void;
}

const EquipmentActions: React.FC<EquipmentActionsProps> = ({
  clientId,
  onEquipmentAdded,
  onMaintenanceScheduled
}) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [equipmentForm, setEquipmentForm] = useState({
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    notes: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    equipment_id: '',
    scheduled_date: '',
    maintenance_type: '',
    notes: ''
  });

  const handleAddEquipment = async () => {
    if (!equipmentForm.type || !equipmentForm.serial_number) {
      toast({
        title: "Validation Error",
        description: "Equipment type and serial number are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate equipment addition
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Equipment Added",
        description: "Equipment has been successfully added to the system.",
      });
      
      setEquipmentForm({
        type: '',
        brand: '',
        model: '',
        serial_number: '',
        mac_address: '',
        notes: ''
      });
      
      setAddDialogOpen(false);
      if (onEquipmentAdded) onEquipmentAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleMaintenance = async () => {
    if (!maintenanceForm.scheduled_date || !maintenanceForm.maintenance_type) {
      toast({
        title: "Validation Error",
        description: "Scheduled date and maintenance type are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate maintenance scheduling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Maintenance Scheduled",
        description: "Maintenance has been successfully scheduled.",
      });
      
      setMaintenanceForm({
        equipment_id: '',
        scheduled_date: '',
        maintenance_type: '',
        notes: ''
      });
      
      setMaintenanceDialogOpen(false);
      if (onMaintenanceScheduled) onMaintenanceScheduled();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Equipment Type *</Label>
              <Select value={equipmentForm.type} onValueChange={(value) => 
                setEquipmentForm(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="router">Router</SelectItem>
                  <SelectItem value="modem">Modem</SelectItem>
                  <SelectItem value="antenna">Antenna</SelectItem>
                  <SelectItem value="cable">Cable</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="access_point">Access Point</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={equipmentForm.brand}
                onChange={(e) => setEquipmentForm(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Equipment brand"
              />
            </div>
            
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={equipmentForm.model}
                onChange={(e) => setEquipmentForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Equipment model"
              />
            </div>
            
            <div>
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input
                id="serial_number"
                value={equipmentForm.serial_number}
                onChange={(e) => setEquipmentForm(prev => ({ ...prev, serial_number: e.target.value }))}
                placeholder="Serial number"
              />
            </div>
            
            <div>
              <Label htmlFor="mac_address">MAC Address</Label>
              <Input
                id="mac_address"
                value={equipmentForm.mac_address}
                onChange={(e) => setEquipmentForm(prev => ({ ...prev, mac_address: e.target.value }))}
                placeholder="XX:XX:XX:XX:XX:XX"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={equipmentForm.notes}
                onChange={(e) => setEquipmentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEquipment} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Equipment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Wrench className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scheduled_date">Scheduled Date *</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={maintenanceForm.scheduled_date}
                onChange={(e) => setMaintenanceForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="maintenance_type">Maintenance Type *</Label>
              <Select value={maintenanceForm.maintenance_type} onValueChange={(value) => 
                setMaintenanceForm(prev => ({ ...prev, maintenance_type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="maintenance_notes">Notes</Label>
              <Textarea
                id="maintenance_notes"
                value={maintenanceForm.notes}
                onChange={(e) => setMaintenanceForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Maintenance details and notes"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMaintenanceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleMaintenance} disabled={isLoading}>
                {isLoading ? 'Scheduling...' : 'Schedule Maintenance'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentActions;
