
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateUserData } from '@/types/user';

interface CreateUserDialogProps {
  onCreateUser: (userData: CreateUserData) => void;
  isCreating: boolean;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ onCreateUser, isCreating }) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'readonly',
    isp_company_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting complete user creation form');
    
    onCreateUser({
      ...newUser,
      isp_company_id: newUser.isp_company_id || profile?.isp_company_id || undefined,
    });

    setNewUser({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'readonly',
      isp_company_id: '',
    });
    setIsOpen(false);
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewUser({ ...newUser, password });
  };

  if (profile?.role !== 'super_admin') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Create New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New User Account</DialogTitle>
            <DialogDescription>
              Create a complete user account with authentication credentials and profile. The user will be able to log in immediately after creation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <p className="font-medium">Complete Integration:</p>
                <p>This creates both the authentication account and user profile in one step. The user can log in immediately after creation.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter secure password"
                  required
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+254..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="readonly">Read Only</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="isp_admin">ISP Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating Account...' : 'Create User Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
