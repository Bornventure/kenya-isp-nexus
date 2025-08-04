import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useEquipment } from '@/hooks/useEquipment';
import { useClients } from '@/hooks/useClients';
import BarcodeScanner from '@/components/common/BarcodeScanner';

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
  const { clients } = useClients();

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

  const canSubmit = selectedType && formData.serial_number.trim();

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
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Equipment Type Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment-type">Equipment Type *</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Router">Router</SelectItem>
                        <SelectItem value="Switch">Switch</SelectItem>
                        <SelectItem value="Access Point">Access Point</SelectItem>
                        <SelectItem value="Modem">Modem</SelectItem>
                        <SelectItem value="Antenna">Antenna</SelectItem>
                        <SelectItem value="Radio">Radio</SelectItem>
                        <SelectItem value="Cable">Cable</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cisco">Cisco</SelectItem>
                        <SelectItem value="MikroTik">MikroTik</SelectItem>
                        <SelectItem value="Ubiquiti">Ubiquiti</SelectItem>
                        <SelectItem value="TP-Link">TP-Link</SelectItem>
                        <SelectItem value="Netgear">Netgear</SelectItem>
                        <SelectItem value="Huawei">Huawei</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      placeholder="Enter model"
                    />
                  </div>
                </div>

                {selectedType && (
                  <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                    <p className="text-sm text-green-800">
                      Selected: {selectedType} {selectedBrand && `- ${selectedBrand}`} {selectedModel && `- ${selectedModel}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Barcode Display */}
              {formData.barcode && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-800">Scanned Barcode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-green-700 font-mono">{formData.barcode}</code>
                  </CardContent>
                </Card>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number *</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                    required
                    placeholder="Enter serial number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="Barcode (scan or enter manually)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mac_address">MAC Address</Label>
                <Input
                  id="mac_address"
                  value={formData.mac_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, mac_address: e.target.value }))}
                  placeholder="00:00:00:00:00:00"
                />
              </div>

              {/* Network Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Network Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ip_address">IP Address</Label>
                      <Input
                        id="ip_address"
                        value={formData.ip_address}
                        onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                        placeholder="192.168.1.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="snmp_community">SNMP Community</Label>
                      <Input
                        id="snmp_community"
                        value={formData.snmp_community}
                        onChange={(e) => setFormData(prev => ({ ...prev, snmp_community: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="snmp_version">SNMP Version</Label>
                      <Select value={formData.snmp_version} onValueChange={(value) => setFormData(prev => ({ ...prev, snmp_version: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">v1</SelectItem>
                          <SelectItem value="2">v2c</SelectItem>
                          <SelectItem value="3">v3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port_number">Port Number</Label>
                      <Input
                        id="port_number"
                        type="number"
                        value={formData.port_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, port_number: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vlan_id">VLAN ID</Label>
                      <Input
                        id="vlan_id"
                        type="number"
                        value={formData.vlan_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, vlan_id: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Assignment */}
              <div className="space-y-2">
                <Label htmlFor="client_id">Assign to Client (Optional)</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this equipment..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !canSubmit}>
                  {isCreating ? 'Adding...' : 'Add Equipment'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;
