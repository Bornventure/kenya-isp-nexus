
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients } from '@/hooks/useClients';

interface EquipmentDetailsFormProps {
  formData: any;
  setFormData: (data: any) => void;
  selectedType: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isCreating: boolean;
  canSubmit: boolean;
}

const EquipmentDetailsForm: React.FC<EquipmentDetailsFormProps> = ({
  formData,
  setFormData,
  selectedType,
  onSubmit,
  onCancel,
  isCreating,
  canSubmit
}) => {
  const { clients = [] } = useClients();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Barcode Display */}
      {formData?.barcode && (
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
            value={formData?.serial_number || ''}
            onChange={(e) => handleInputChange('serial_number', e.target.value)}
            required
            placeholder="Enter serial number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            value={formData?.barcode || ''}
            onChange={(e) => handleInputChange('barcode', e.target.value)}
            placeholder="Barcode (scan or enter manually)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mac_address">MAC Address</Label>
        <Input
          id="mac_address"
          value={formData?.mac_address || ''}
          onChange={(e) => handleInputChange('mac_address', e.target.value)}
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
                value={formData?.ip_address || ''}
                onChange={(e) => handleInputChange('ip_address', e.target.value)}
                placeholder="192.168.1.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snmp_community">SNMP Community</Label>
              <Input
                id="snmp_community"
                value={formData?.snmp_community || 'public'}
                onChange={(e) => handleInputChange('snmp_community', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="snmp_version">SNMP Version</Label>
              <Select 
                value={formData?.snmp_version || '2'} 
                onValueChange={(value) => handleInputChange('snmp_version', value)}
              >
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
                value={formData?.port_number || ''}
                onChange={(e) => handleInputChange('port_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vlan_id">VLAN ID</Label>
              <Input
                id="vlan_id"
                type="number"
                value={formData?.vlan_id || ''}
                onChange={(e) => handleInputChange('vlan_id', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Assignment */}
      <div className="space-y-2">
        <Label htmlFor="client_id">Assign to Client (Optional)</Label>
        <Select 
          value={formData?.client_id || ''} 
          onValueChange={(value) => handleInputChange('client_id', value)}
        >
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
          value={formData?.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this equipment..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating || !canSubmit}>
          {isCreating ? 'Adding...' : 'Add Equipment'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentDetailsForm;
