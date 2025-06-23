
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserRoleUpdate } from '@/hooks/useUserRoleUpdate';
import { useUserMutations } from '@/hooks/useUserMutations';
import type { SystemUser } from '@/types/user';

interface EditUserDialogProps {
  user: SystemUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    role: user?.role || 'readonly' as SystemUser['role']
  });

  const { updateUserRole, isUpdatingRole } = useUserRoleUpdate();
  const { updateUser, isUpdatingUser } = useUserMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Update basic user info
      await updateUser({
        id: user.id,
        updates: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
        }
      });

      // Update role if changed
      if (formData.role !== user.role) {
        updateUserRole({ userId: user.id, newRole: formData.role });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'isp_admin', label: 'ISP Admin' },
    { value: 'customer_support', label: 'Customer Support' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'billing_admin', label: 'Billing Admin' },
    { value: 'network_engineer', label: 'Network Engineer' },
    { value: 'infrastructure_manager', label: 'Infrastructure Manager' },
    { value: 'hotspot_admin', label: 'Hotspot Admin' },
    { value: 'technician', label: 'Technician' },
    { value: 'readonly', label: 'Read Only' },
  ];

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as SystemUser['role'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdatingUser || isUpdatingRole}
            >
              {(isUpdatingUser || isUpdatingRole) ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
