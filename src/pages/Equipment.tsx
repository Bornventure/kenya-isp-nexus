import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useEquipment, Equipment } from '@/hooks/useEquipment';
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Equipment = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const { equipment, isLoading, error, createEquipment, updateEquipment, approveEquipment, rejectEquipment } = useEquipment();
  const { toast } = useToast();
  const [isApprovingEquipment, setIsApprovingEquipment] = useState(false);
  const [isRejectingEquipment, setIsRejectingEquipment] = useState(false);
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const handleAddEquipment = async (equipmentData: any) => {
    try {
      // Prepare data with correct database field names
      const dbEquipmentData = {
        type: equipmentData.equipment_type || equipmentData.type,
        brand: equipmentData.brand,
        model: equipmentData.model,
        serial_number: equipmentData.serial_number,
        mac_address: equipmentData.mac_address,
        status: equipmentData.status || 'available',
        location: equipmentData.location,
        notes: equipmentData.notes,
        purchase_date: equipmentData.purchase_date,
        warranty_end_date: equipmentData.warranty_expiry || equipmentData.warranty_end_date,
        equipment_type_id: equipmentData.equipment_type_id,
      };

      createEquipment(dbEquipmentData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowEditModal(true);
  };

  const handleUpdateEquipment = async (equipmentData: any) => {
    if (!selectedEquipment) return;

    try {
      await updateEquipment({ id: selectedEquipment.id, updates: equipmentData });
      setShowEditModal(false);
      setSelectedEquipment(null);
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  const handleApproveEquipment = async (equipmentId: string) => {
    setIsApprovingEquipment(true);
    try {
      await approveEquipment({ id: equipmentId });
      toast({
        title: "Equipment Approved",
        description: "Equipment has been approved successfully.",
      });
    } catch (error) {
      console.error('Error approving equipment:', error);
      toast({
        title: "Error",
        description: "Failed to approve equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApprovingEquipment(false);
    }
  };

  const handleRejectEquipment = async (equipmentId: string, rejectionNotes: string) => {
    setIsRejectingEquipment(true);
    try {
      await rejectEquipment({ id: equipmentId, notes: rejectionNotes });
      toast({
        title: "Equipment Rejected",
        description: "Equipment has been rejected successfully.",
      });
    } catch (error) {
      console.error('Error rejecting equipment:', error);
      toast({
        title: "Error",
        description: "Failed to reject equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRejectingEquipment(false);
    }
  };

  if (isLoading) return <div>Loading equipment...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Equipment Management</CardTitle>
          <CardDescription>Manage and monitor your network equipment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell>{equipment.equipment_types?.name || equipment.type}</TableCell>
                  <TableCell>{equipment.equipment_types?.brand || equipment.brand || 'N/A'}</TableCell>
                  <TableCell>{equipment.equipment_types?.model || equipment.model || 'N/A'}</TableCell>
                  <TableCell>{equipment.serial_number}</TableCell>
                  <TableCell>{equipment.mac_address || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{equipment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditEquipment(equipment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Equipment Details</DialogTitle>
                            <DialogDescription>
                              View detailed information about this equipment.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="type" className="text-right">
                                Type
                              </Label>
                              <Input type="text" id="type" value={equipment.type} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="brand" className="text-right">
                                Brand
                              </Label>
                              <Input type="text" id="brand" value={equipment.brand || 'N/A'} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="model" className="text-right">
                                Model
                              </Label>
                              <Input type="text" id="model" value={equipment.model || 'N/A'} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="serial" className="text-right">
                                Serial Number
                              </Label>
                              <Input type="text" id="serial" value={equipment.serial_number} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="mac" className="text-right">
                                MAC Address
                              </Label>
                              <Input type="text" id="mac" value={equipment.mac_address || 'N/A'} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="status" className="text-right">
                                Status
                              </Label>
                              <Input type="text" id="status" value={equipment.status} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="notes" className="text-right">
                                Notes
                              </Label>
                              <Textarea id="notes" value={equipment.notes || 'N/A'} className="col-span-3" readOnly />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {equipment.approval_status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveEquipment(equipment.id)}
                            disabled={isApprovingEquipment}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Reject Equipment</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to reject this equipment? Please provide a reason.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="rejectionNotes" className="text-right">
                                    Rejection Notes
                                  </Label>
                                  <Textarea id="rejectionNotes" className="col-span-3" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => {
                                  const rejectionNotes = (document.getElementById('rejectionNotes') as HTMLTextAreaElement).value;
                                  handleRejectEquipment(equipment.id, rejectionNotes);
                                }}>
                                  Reject
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Equipment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Equipment</DialogTitle>
            <DialogDescription>
              Add new equipment to the inventory.
            </DialogDescription>
          </DialogHeader>
          <AddEquipmentForm onSubmit={handleAddEquipment} onClose={() => setShowAddModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Edit the details of the selected equipment.
            </DialogDescription>
          </DialogHeader>
          <EditEquipmentForm
            equipment={selectedEquipment}
            onSubmit={handleUpdateEquipment}
            onClose={() => {
              setShowEditModal(false);
              setSelectedEquipment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface AddEquipmentFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({ onSubmit, onClose }) => {
  const [equipmentType, setEquipmentType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [status, setStatus] = useState('available');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [purchaseDate, setPurchaseDate] = React.useState<Date | undefined>(new Date());
  const [warrantyExpiry, setWarrantyExpiry] = React.useState<Date | undefined>(new Date());
  const [equipmentTypeId, setEquipmentTypeId] = useState('');
  const { profile } = useAuth();
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchEquipmentTypes = async () => {
      if (!profile?.isp_company_id) {
        toast({
          title: "Error",
          description: "Company information not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id);

      if (error) {
        console.error('Error fetching equipment types:', error);
        return;
      }

      setEquipmentTypes(data);
    };

    fetchEquipmentTypes();
  }, [profile?.isp_company_id, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      equipment_type: equipmentType,
      brand,
      model,
      serial_number: serialNumber,
      mac_address: macAddress,
      status,
      location,
      notes,
      purchase_date: purchaseDate?.toISOString(),
      warranty_expiry: warrantyExpiry?.toISOString(),
      equipment_type_id: equipmentTypeId,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="equipmentType" className="text-right">
          Equipment Type
        </Label>
        <Input
          type="text"
          id="equipmentType"
          className="col-span-3"
          value={equipmentType}
          onChange={(e) => setEquipmentType(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="brand" className="text-right">
          Brand
        </Label>
        <Input
          type="text"
          id="brand"
          className="col-span-3"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="model" className="text-right">
          Model
        </Label>
        <Input
          type="text"
          id="model"
          className="col-span-3"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="serialNumber" className="text-right">
          Serial Number
        </Label>
        <Input
          type="text"
          id="serialNumber"
          className="col-span-3"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="macAddress" className="text-right">
          MAC Address
        </Label>
        <Input
          type="text"
          id="macAddress"
          className="col-span-3"
          value={macAddress}
          onChange={(e) => setMacAddress(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="damaged">Damaged</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="stolen">Stolen</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">
          Location
        </Label>
        <Input
          type="text"
          id="location"
          className="col-span-3"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="notes" className="text-right">
          Notes
        </Label>
        <Textarea
          id="notes"
          className="col-span-3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="purchaseDate" className="text-right">
          Purchase Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !purchaseDate && "text-muted-foreground"
              )}
            >
              {purchaseDate ? format(purchaseDate, "PPP") : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DatePicker
              mode="single"
              selected={purchaseDate}
              onSelect={setPurchaseDate}
              disabled={(date) =>
                date > new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="warrantyExpiry" className="text-right">
          Warranty Expiry
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !warrantyExpiry && "text-muted-foreground"
              )}
            >
              {warrantyExpiry ? format(warrantyExpiry, "PPP") : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DatePicker
              mode="single"
              selected={warrantyExpiry}
              onSelect={setWarrantyExpiry}
              disabled={(date) =>
                date < new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="equipmentTypeId" className="text-right">
          Equipment Type ID
        </Label>
        <Select value={equipmentTypeId} onValueChange={setEquipmentTypeId}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select an equipment type" />
          </SelectTrigger>
          <SelectContent>
            {equipmentTypes.map((type: any) => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add Equipment</Button>
      </DialogFooter>
    </form>
  );
};

interface EditEquipmentFormProps {
  equipment: Equipment | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const EditEquipmentForm: React.FC<EditEquipmentFormProps> = ({ equipment, onSubmit, onClose }) => {
  const [type, setType] = useState(equipment?.type || '');
  const [brand, setBrand] = useState(equipment?.brand || '');
  const [model, setModel] = useState(equipment?.model || '');
  const [serialNumber, setSerialNumber] = useState(equipment?.serial_number || '');
  const [macAddress, setMacAddress] = useState(equipment?.mac_address || '');
  const [status, setStatus] = useState(equipment?.status || 'available');
  const [location, setLocation] = useState(equipment?.location || '');
  const [notes, setNotes] = useState(equipment?.notes || '');
  const [purchaseDate, setPurchaseDate] = React.useState<Date | undefined>(equipment?.purchase_date ? new Date(equipment.purchase_date) : undefined);
  const [warrantyExpiry, setWarrantyExpiry] = React.useState<Date | undefined>(equipment?.warranty_end_date ? new Date(equipment.warranty_end_date) : undefined);
  const [equipmentTypeId, setEquipmentTypeId] = useState(equipment?.equipment_type_id || '');
  const { profile } = useAuth();
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchEquipmentTypes = async () => {
      if (!profile?.isp_company_id) {
        toast({
          title: "Error",
          description: "Company information not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id);

      if (error) {
        console.error('Error fetching equipment types:', error);
        return;
      }

      setEquipmentTypes(data);
    };

    fetchEquipmentTypes();
  }, [profile?.isp_company_id, toast]);

  React.useEffect(() => {
    if (equipment) {
      setType(equipment.type || '');
      setBrand(equipment.brand || '');
      setModel(equipment.model || '');
      setSerialNumber(equipment.serial_number || '');
      setMacAddress(equipment.mac_address || '');
      setStatus(equipment.status || 'available');
      setLocation(equipment.location || '');
      setNotes(equipment.notes || '');
      setPurchaseDate(equipment.purchase_date ? new Date(equipment.purchase_date) : undefined);
      setWarrantyExpiry(equipment.warranty_end_date ? new Date(equipment.warranty_end_date) : undefined);
      setEquipmentTypeId(equipment.equipment_type_id || '');
    }
  }, [equipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      brand,
      model,
      serial_number: serialNumber,
      mac_address: macAddress,
      status,
      location,
      notes,
      purchase_date: purchaseDate?.toISOString(),
      warranty_end_date: warrantyExpiry?.toISOString(),
      equipment_type_id: equipmentTypeId,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="type" className="text-right">
          Type
        </Label>
        <Input
          type="text"
          id="type"
          className="col-span-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="brand" className="text-right">
          Brand
        </Label>
        <Input
          type="text"
          id="brand"
          className="col-span-3"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="model" className="text-right">
          Model
        </Label>
        <Input
          type="text"
          id="model"
          className="col-span-3"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="serialNumber" className="text-right">
          Serial Number
        </Label>
        <Input
          type="text"
          id="serialNumber"
          className="col-span-3"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="macAddress" className="text-right">
          MAC Address
        </Label>
        <Input
          type="text"
          id="macAddress"
          className="col-span-3"
          value={macAddress}
          onChange={(e) => setMacAddress(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="damaged">Damaged</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="stolen">Stolen</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">
          Location
        </Label>
        <Input
          type="text"
          id="location"
          className="col-span-3"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="notes" className="text-right">
          Notes
        </Label>
        <Textarea
          id="notes"
          className="col-span-3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="purchaseDate" className="text-right">
          Purchase Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !purchaseDate && "text-muted-foreground"
              )}
            >
              {purchaseDate ? format(purchaseDate, "PPP") : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DatePicker
              mode="single"
              selected={purchaseDate}
              onSelect={setPurchaseDate}
              disabled={(date) =>
                date > new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="warrantyExpiry" className="text-right">
          Warranty Expiry
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !warrantyExpiry && "text-muted-foreground"
              )}
            >
              {warrantyExpiry ? format(warrantyExpiry, "PPP") : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DatePicker
              mode="single"
              selected={warrantyExpiry}
              onSelect={setWarrantyExpiry}
              disabled={(date) =>
                date < new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="equipmentTypeId" className="text-right">
          Equipment Type ID
        </Label>
        <Select value={equipmentTypeId} onValueChange={setEquipmentTypeId}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select an equipment type" />
          </SelectTrigger>
          <SelectContent>
            {equipmentTypes.map((type: any) => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update Equipment</Button>
      </DialogFooter>
    </form>
  );
};

export default Equipment;
