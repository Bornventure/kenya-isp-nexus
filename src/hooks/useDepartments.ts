
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Department[];
    },
  });
};

export const useDepartmentMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createDepartment = useMutation({
    mutationFn: async (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('departments')
        .insert(department)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
      console.error('Error creating department:', error);
    },
  });

  const updateDepartment = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Department> }) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
      console.error('Error updating department:', error);
    },
  });

  return { createDepartment, updateDepartment };
};
