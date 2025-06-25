
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserSelectorProps {
  selectedUser: string;
  onSelectUser: (userId: string) => void;
}

type UserRole = 'super_admin' | 'isp_admin' | 'manager' | 'technician' | 'support' | 'billing' | 'readonly' | 'customer_support' | 'sales_manager' | 'billing_admin' | 'network_engineer' | 'infrastructure_manager' | 'hotspot_admin';

const UserSelector: React.FC<UserSelectorProps> = ({ selectedUser, onSelectUser }) => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<UserRole | ''>('');

  // Get all departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .neq('id', profile?.id) // Exclude current user
        .eq('isp_company_id', profile?.isp_company_id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }

      // Get unique roles/departments
      const uniqueRoles = [...new Set(data.map(p => p.role as UserRole))];
      return uniqueRoles.map(role => ({
        value: role,
        label: role.replace('_', ' ').split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }));
    },
    enabled: !!profile?.isp_company_id,
  });

  // Get users in selected department
  const { data: users } = useQuery({
    queryKey: ['department-users', selectedDepartment],
    queryFn: async () => {
      if (!selectedDepartment) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', selectedDepartment)
        .neq('id', profile?.id) // Exclude current user
        .eq('isp_company_id', profile?.isp_company_id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      return data;
    },
    enabled: !!selectedDepartment && !!profile?.isp_company_id,
  });

  const selectedUserData = users?.find(user => user.id === selectedUser);

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value as UserRole);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Select Department</Label>
        <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a department..." />
          </SelectTrigger>
          <SelectContent>
            {departments?.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {dept.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDepartment && (
        <div className="space-y-2">
          <Label>Select User</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedUserData ? (
                  <div className="flex items-center gap-2">
                    <span>{selectedUserData.first_name} {selectedUserData.last_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedUserData.role.replace('_', ' ')}
                    </Badge>
                  </div>
                ) : (
                  "Select user..."
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search users..." />
                <CommandList>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {users?.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.first_name} ${user.last_name}`}
                        onSelect={() => {
                          onSelectUser(user.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{user.first_name} {user.last_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
