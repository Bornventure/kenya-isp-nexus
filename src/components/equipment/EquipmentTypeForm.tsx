
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EquipmentTypeFormProps {
  selectedType: string;
  selectedBrand: string;
  selectedModel: string;
  onTypeChange: (type: string) => void;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
}

const EquipmentTypeForm: React.FC<EquipmentTypeFormProps> = ({
  selectedType,
  selectedBrand,
  selectedModel,
  onTypeChange,
  onBrandChange,
  onModelChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Equipment Type Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="equipment-type">Equipment Type *</Label>
            <Select value={selectedType} onValueChange={onTypeChange}>
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
            <Select value={selectedBrand} onValueChange={onBrandChange}>
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
              onChange={(e) => onModelChange(e.target.value)}
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
  );
};

export default EquipmentTypeForm;
