
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Router, Server, Wifi, Cable, Radio } from 'lucide-react';
import { useEquipmentTypes, EquipmentType } from '@/hooks/useEquipmentTypes';

interface EquipmentTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (equipmentType: EquipmentType) => void;
}

const deviceIcons = {
  router: Router,
  switch: Server,
  access_point: Wifi,
  modem: Cable,
  antenna: Radio,
  cable: Cable,
};

const EquipmentTypeSelector: React.FC<EquipmentTypeSelectorProps> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { equipmentTypes, isLoading } = useEquipmentTypes();

  const filteredTypes = equipmentTypes.filter(
    type =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (equipmentType: EquipmentType) => {
    onSelect(equipmentType);
    onOpenChange(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Select Equipment Type</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="col-span-full text-center py-8">Loading equipment types...</div>
            ) : filteredTypes.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No equipment types found
              </div>
            ) : (
              filteredTypes.map((type) => {
                const IconComponent = deviceIcons[type.device_type as keyof typeof deviceIcons] || Server;
                return (
                  <Card
                    key={type.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelect(type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-8 w-8 text-blue-600 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{type.name}</h3>
                          <p className="text-xs text-muted-foreground">{type.brand} {type.model}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {type.device_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentTypeSelector;
