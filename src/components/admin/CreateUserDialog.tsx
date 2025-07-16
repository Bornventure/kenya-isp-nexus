
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdminCompanies } from '@/hooks/useSuperAdminCompanies';
import type { CreateUserData, SystemUser } from '@/types/user';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (userData: CreateUserData) => void;
  isCreating: boolean;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onCreateUser,
  isCreating,
}) => {
  const { profile } = useAuth();
  const { data: companies } = useSuperAdminCompanies();
  
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'readonly',
    isp_company_id: profile?.role === 'isp_admin' ? profile?.isp_company_id || '' : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateUser(formData);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'readonly',
      isp_company_id: profile?.role === 'isp_admin' ? profile?.isp_company_id || '' : '',
    });
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Both super_admin and isp_admin can create users
  if (profile?.role !== 'super_admin' && profile?.role !== 'isp_admin') {
    return null;
  }

  // Define available roles based on user type
  const getAvailableRoles = (): { value: SystemUser['role']; label: string }[] => {
    const baseRoles = [
      { value: 'readonly', label: 'Read Only' },
      { value: 'technician', label: 'Technician' },
      { value: 'customer_support', label: 'Customer Support' },
      { value: 'sales_manager', label: 'Sales Manager' },
      { value: 'billing_admin', label: 'Billing Admin' },
      { value: 'network_engineer', label: 'Network Engineer' },
      { value: 'infrastructure_manager', label: 'Infrastructure Manager' },
      { value: 'hotspot_admin', label: 'Hotspot Admin' },
    ] as { value: SystemUser['role']; label: string }[];

    // Only super_admin can create isp_admin and super_admin users
    if (profile?.role === 'super_admin') {
      baseRoles.push({ value: 'isp_admin', label: 'ISP Admin' });
      // Note: super_admin creation should be done carefully, not included in regular UI
    }

    return baseRoles;
  };

  const availableRoles = getAvailableRoles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="254700000000"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
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
              <Select value={formData.isp_company_id} onValueChange={(value) => handleInputChange('isp_company_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {profile?.role === 'isp_admin' && (
            <div className="text-sm text-gray-600">
              Users will be created for your company: <strong>{profile?.isp_companies?.name || 'Your Company'}</strong>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
