
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ServicePackage {
  id: string;
  name: string;
  speed: string;
  monthly_rate: number;
  connection_types: ('fiber' | 'wireless' | 'satellite' | 'dsl')[];
  description: string | null;
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export const useServicePackages = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servicePackages = [], isLoading, error } = useQuery({
    queryKey: ['service-packages', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('is_active', true)
        .order('monthly_rate', { ascending: true });

      if (error) {
        console.error('Error fetching service packages:', error);
        throw error;
      }

      return data as ServicePackage[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createPackageMutation = useMutation({
    mutationFn: async (packageData: Omit<ServicePackage, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('service_packages')
        .insert({
          ...packageData,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-packages'] });
      toast({
        title: "Service Package Created",
        description: "New service package has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Error creating service package:', error);
      toast({
        title: "Error",
        description: "Failed to create service package. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<ServicePackage, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>> }) => {
      const { data, error } = await supabase
        .from('service_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-packages'] });
      toast({
        title: "Service Package Updated",
        description: "Service package has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating service package:', error);
      toast({
        title: "Error",
        description: "Failed to update service package. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    servicePackages,
    isLoading,
    error,
    createPackage: createPackageMutation.mutate,
    updatePackage: updatePackageMutation.mutate,
    isCreating: createPackageMutation.isPending,
    isUpdating: updatePackageMutation.isPending,
  };
};
