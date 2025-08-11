
import React from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { usePersistedFormState } from '@/hooks/usePersistedFormState';
import type { SystemUser } from '@/types/user';

interface ChangePasswordDialogProps {
  user: SystemUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ 
  user, 
  open, 
  onOpenChange 
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isChanging, setIsChanging] = React.useState(false);
  const { toast } = useToast();

  const initialFormData = {
    newPassword: '',
    confirmPassword: '',
  };

  const {
    formData,
    updateFormData,
    handleSubmitSuccess,
    clearPersistedData,
  } = usePersistedFormState({
    key: `changePassword_${user?.id || 'unknown'}`,
    initialState: initialFormData,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (formData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsChanging(true);

    try {
      // Use the edge function to update the user's password
      const { data, error } = await supabase.functions.invoke('change-user-password', {
        body: {
          user_id: user.id,
          new_password: formData.newPassword,
        },
      });

      if (error) {
        console.error('Error changing password:', error);
        throw new Error(error.message || 'Failed to change password');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to change password');
      }

      toast({
        title: "Password Changed",
        description: `Password has been updated for ${user.first_name} ${user.last_name}.`,
      });

      // Clear form and close dialog
      handleSubmitSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Password Change Failed",
        description: error instanceof Error ? error.message : "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  const generateStrongPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    updateFormData('newPassword', password);
    updateFormData('confirmPassword', password);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Don't clear data on cancel - user might want to continue later
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Update the password for {user.first_name} {user.last_name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => updateFormData('newPassword', e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateStrongPassword}
              className="text-xs"
            >
              Generate Strong Password
            </Button>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => clearPersistedData()}
              disabled={isChanging}
              className="text-sm"
            >
              Clear Form
            </Button>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isChanging}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isChanging}
              >
                {isChanging ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
