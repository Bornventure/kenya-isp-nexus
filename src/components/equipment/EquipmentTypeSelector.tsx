
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEquipmentTypes, EquipmentType } from '@/hooks/useEquipmentTypes';

interface EquipmentTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: EquipmentType) => void;
}

const EquipmentTypeSelector: React.FC<EquipmentTypeSelectorProps> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  const { data: equipmentTypes = [], isLoading } = useEquipmentTypes();

  const handleSelect = (type: EquipmentType) => {
    onSelect(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Equipment Type</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading equipment types...</div>
          ) : equipmentTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No equipment types available. Please add some equipment types first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipmentTypes.map((type) => (
                <Card key={type.id} className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{type.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Brand:</span> {type.brand}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Model:</span> {type.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Type:</span> {type.device_type}
                      </p>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleSelect(type)}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentTypeSelector;
