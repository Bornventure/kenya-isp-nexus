
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X } from 'lucide-react';
import { useExternalUserMutations } from '@/hooks/useExternalUsers';

const ExternalUserDialog: React.FC = () => {
  const { createExternalUser } = useExternalUserMutations();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'external_technician' as 'external_technician' | 'external_contractor',
    company_name: '',
    hourly_rate: '',
    specializations: [] as string[],
  });
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleSubmit = async () => {
    if (!formData.email || !formData.first_name || !formData.last_name) return;

    await createExternalUser.mutateAsync({
      ...formData,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      is_active: true,
    });

    setOpen(false);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'external_technician',
      company_name: '',
      hourly_rate: '',
      specializations: [],
    });
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add External User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add External User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+254..."
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: 'external_technician' | 'external_contractor') => 
              setFormData(prev => ({ ...prev, role: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external_technician">External Technician</SelectItem>
                <SelectItem value="external_contractor">External Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Tech Solutions Ltd"
            />
          </div>

          <div>
            <Label htmlFor="hourly_rate">Hourly Rate (KES)</Label>
            <Input
              id="hourly_rate"
              type="number"
              value={formData.hourly_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
              placeholder="1500"
            />
          </div>

          <div>
            <Label>Specializations</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Add specialization"
                onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
              />
              <Button type="button" onClick={addSpecialization} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((spec) => (
                <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                  {spec}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSpecialization(spec)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.email || !formData.first_name || !formData.last_name || createExternalUser.isPending}
            >
              {createExternalUser.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalUserDialog;
