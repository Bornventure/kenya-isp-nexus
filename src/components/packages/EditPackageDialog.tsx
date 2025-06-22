
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useServicePackages, ServicePackage } from '@/hooks/useServicePackages';

interface EditPackageDialogProps {
  package: ServicePackage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPackageDialog: React.FC<EditPackageDialogProps> = ({
  package: pkg,
  open,
  onOpenChange,
}) => {
  const { updatePackage, isUpdating } = useServicePackages();
  const [formData, set FormData] = useState({
    name: '',
    speed: '',
    monthly_rate: '',
    description: '',
    connection_types: [] as ('fiber' | 'wireless' | 'satellite' | 'dsl')[],
    is_active: true,
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        speed: pkg.speed,
        monthly_rate: pkg.monthly_rate.toString(),
        description: pkg.description || '',
        connection_types: pkg.connection_types,
        is_active: pkg.is_active,
      });
    }
  }, [pkg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updatePackage({
        id: pkg.id,
        updates: {
          name: formData.name,
          speed: formData.speed,
          monthly_rate: parseFloat(formData.monthly_rate),
          description: formData.description || null,
          connection_types: formData.connection_types,
          is_active: formData.is_active,
        }
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  const handleConnectionTypeChange = (type: 'fiber' | 'wireless' | 'satellite' | 'dsl', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      connection_types: checked
        ? [...prev.connection_types, type]
        : prev.connection_types.filter(t => t !== type)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Service Package</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Speed</Label>
              <Input
                id="speed"
                value={formData.speed}
                onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_rate">Monthly Rate (KES)</Label>
            <Input
              id="monthly_rate"
              type="number"
              step="0.01"
              value={formData.monthly_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_rate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Connection Types</Label>
            <div className="grid grid-cols-2 gap-4">
              {(['fiber', 'wireless', 'satellite', 'dsl'] as const).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.connection_types.includes(type)}
                    onCheckedChange={(checked) => handleConnectionTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={type} className="capitalize">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked as boolean }))}
            />
            <Label htmlFor="is_active">Package is active</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPackageDialog;
