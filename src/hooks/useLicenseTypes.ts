
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LicenseType {
  id: string;
  name: string;
  display_name: string;
  client_limit: number;
  price: number;
  description?: string;
  features: any[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useLicenseTypes = () => {
  return useQuery({
    queryKey: ['license-types'],
    queryFn: async (): Promise<LicenseType[]> => {
      const { data, error } = await supabase
        .from('license_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching license types:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useAllLicenseTypes = () => {
  return useQuery({
    queryKey: ['all-license-types'],
    queryFn: async (): Promise<LicenseType[]> => {
      const { data, error } = await supabase
        .from('license_types')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching all license types:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useLicenseTypeMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createLicenseType = useMutation({
    mutationFn: async (licenseType: Omit<LicenseType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('license_types')
        .insert([licenseType])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-types'] });
      queryClient.invalidateQueries({ queryKey: ['all-license-types'] });
      toast({
        title: "Success",
        description: "License type created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create license type",
        variant: "destructive"
      });
    }
  });

  const updateLicenseType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LicenseType> & { id: string }) => {
      const { data, error } = await supabase
        .from('license_types')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-types'] });
      queryClient.invalidateQueries({ queryKey: ['all-license-types'] });
      toast({
        title: "Success",
        description: "License type updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update license type",
        variant: "destructive"
      });
    }
  });

  const deleteLicenseType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('license_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-types'] });
      queryClient.invalidateQueries({ queryKey: ['all-license-types'] });
      toast({
        title: "Success",
        description: "License type deactivated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate license type",
        variant: "destructive"
      });
    }
  });

  return {
    createLicenseType,
    updateLicenseType,
    deleteLicenseType
  };
};
