
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdminCompanies } from '@/hooks/useSuperAdminCompanies';
import type { SystemUser } from '@/types/user';

interface EditUserDialogProps {
  user: SystemUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (userData: any) => void;
  isUpdating: boolean;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUpdateUser,
  isUpdating
}) => {
  const { profile } = useAuth();
  const { data: companies = [] } = useSuperAdminCompanies();
  
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    role: user.role,
    isp_company_id: user.isp_company_id || '',
  });

  useEffect(() => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.role,
      isp_company_id: user.isp_company_id || '',
    });
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(formData);
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'isp_admin', label: 'ISP Admin' },
    { value: 'customer_support', label: 'Customer Support' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'sales_account_manager', label: 'Sales Account Manager' },
    { value: 'billing_admin', label: 'Billing Admin' },
    { value: 'billing_finance', label: 'Billing Finance' },
    { value: 'network_engineer', label: 'Network Engineer' },
    { value: 'network_operations', label: 'Network Operations' },
    { value: 'infrastructure_manager', label: 'Infrastructure Manager' },
    { value: 'infrastructure_asset', label: 'Infrastructure Asset' },
    { value: 'hotspot_admin', label: 'Hotspot Admin' },
    { value: 'technician', label: 'Technician' },
    { value: 'readonly', label: 'Read Only' },
  ];

  // Filter roles based on user permissions
  const availableRoles = roleOptions.filter(role => {
    if (profile?.role === 'super_admin') return true;
    if (profile?.role === 'isp_admin') return role.value !== 'super_admin';
    return false;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+254700000000"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as SystemUser['role'] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {profile?.role === 'super_admin' && (
            <div>
              <Label htmlFor="company">Company</Label>
              <Select value={formData.isp_company_id} onValueChange={(value) => setFormData(prev => ({ ...prev, isp_company_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
