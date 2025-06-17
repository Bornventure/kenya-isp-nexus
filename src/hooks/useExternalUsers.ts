
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExternalUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'external_technician' | 'external_contractor';
  is_active: boolean;
  company_name?: string;
  specializations: string[];
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

export const useExternalUsers = () => {
  return useQuery({
    queryKey: ['external-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_users' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExternalUser[];
    },
  });
};

export const useExternalUserMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createExternalUser = useMutation({
    mutationFn: async (userData: Omit<ExternalUser, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('external_users' as any)
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-users'] });
      toast({
        title: "Success",
        description: "External user created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create external user",
        variant: "destructive",
      });
      console.error('Error creating external user:', error);
    },
  });

  const updateExternalUser = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExternalUser> }) => {
      const { data, error } = await supabase
        .from('external_users' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-users'] });
      toast({
        title: "Success",
        description: "External user updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update external user",
        variant: "destructive",
      });
      console.error('Error updating external user:', error);
    },
  });

  return { createExternalUser, updateExternalUser };
};
