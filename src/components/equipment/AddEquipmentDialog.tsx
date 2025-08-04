
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useEquipment } from '@/hooks/useEquipment';
import BarcodeScanner from '@/components/common/BarcodeScanner';
import EquipmentTypeForm from './EquipmentTypeForm';
import EquipmentDetailsForm from './EquipmentDetailsForm';

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddEquipmentDialog: React.FC<AddEquipmentDialogProps> = ({ open, onOpenChange }) => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [formData, setFormData] = useState({
    serial_number: '',
    barcode: '',
    mac_address: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: '2',
    port_number: '',
    vlan_id: '',
    client_id: '',
    notes: '',
  });

  const { toast } = useToast();
  const { createEquipment, isCreating } = useEquipment();

  const handleBarcodeScanned = (scannedBarcode: string) => {
    setFormData(prev => ({ ...prev, barcode: scannedBarcode }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !formData.serial_number) {
      toast({
        title: "Missing Required Fields",
        description: "Please select equipment type and enter serial number.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEquipment({
        type: selectedType,
        brand: selectedBrand || null,
        model: selectedModel || null,
        serial_number: formData.serial_number,
        mac_address: formData.mac_address || null,
        ip_address: formData.ip_address || null,
        snmp_community: formData.snmp_community,
        snmp_version: parseInt(formData.snmp_version),
        port_number: formData.port_number ? parseInt(formData.port_number) : null,
        vlan_id: formData.vlan_id ? parseInt(formData.vlan_id) : null,
        client_id: formData.client_id || null,
        notes: formData.notes || null,
        status: 'pending',
        approval_status: 'pending',
      });

      toast({
        title: "Equipment Added",
        description: "Equipment has been added and is pending approval.",
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedType('');
    setSelectedBrand('');
    setSelectedModel('');
    setFormData({
      serial_number: '',
      barcode: '',
      mac_address: '',
      ip_address: '',
      snmp_community: 'public',
      snmp_version: '2',
      port_number: '',
      vlan_id: '',
      client_id: '',
      notes: '',
    });
  };

  const canSubmit = selectedType && formData.serial_number?.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="barcode" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="barcode">Barcode Scanner</TabsTrigger>
            <TabsTrigger value="type">Equipment Type</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="barcode">
            <BarcodeScanner
              onBarcodeScanned={handleBarcodeScanned}
              placeholder="Scan equipment barcode..."
              label="Equipment Barcode Scanner"
            />
          </TabsContent>

          <TabsContent value="type">
            <EquipmentTypeForm
              selectedType={selectedType}
              selectedBrand={selectedBrand}
              selectedModel={selectedModel}
              onTypeChange={setSelectedType}
              onBrandChange={setSelectedBrand}
              onModelChange={setSelectedModel}
            />
          </TabsContent>

          <TabsContent value="details">
            <EquipmentDetailsForm
              formData={formData}
              setFormData={setFormData}
              selectedType={selectedType}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isCreating={isCreating}
              canSubmit={canSubmit}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;
