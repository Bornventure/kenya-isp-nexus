
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LicenseType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  client_limit: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useLicenseTypes = () => {
  return useQuery({
    queryKey: ['license-types'],
    queryFn: async (): Promise<LicenseType[]> => {
      // For now, return mock data since we don't have a license_types table
      // This would be replaced with actual Supabase query when the table exists
      return [
        {
          id: '1',
          name: 'starter',
          display_name: 'Starter',
          description: 'Perfect for small ISPs getting started',
          price: 15000,
          client_limit: 50,
          features: ['Basic client management', 'Email support', 'Standard reporting'],
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'professional',
          display_name: 'Professional',
          description: 'For growing ISPs with advanced needs',
          price: 45000,
          client_limit: 200,
          features: ['Advanced client management', 'Priority support', 'Advanced reporting', 'API access'],
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'enterprise',
          display_name: 'Enterprise',
          description: 'For large ISPs with custom requirements',
          price: 100000,
          client_limit: 1000,
          features: ['Full feature access', '24/7 support', 'Custom integrations', 'White labeling'],
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    },
  });
};

export const useAllLicenseTypes = () => {
  return useLicenseTypes();
};

export const useLicenseTypeMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createLicenseType = useMutation({
    mutationFn: async (licenseTypeData: Omit<LicenseType, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation - would be replaced with actual Supabase call
      console.log('Creating license type:', licenseTypeData);
      return { ...licenseTypeData, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-types'] });
      toast({
        title: "Success",
        description: "License type created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create license type",
        variant: "destructive",
      });
    },
  });

  const updateLicenseType = useMutation({
    mutationFn: async (licenseTypeData: Partial<LicenseType> & { id: string }) => {
      // Mock implementation - would be replaced with actual Supabase call
      console.log('Updating license type:', licenseTypeData);
      return licenseTypeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-types'] });
      toast({
        title: "Success",
        description: "License type updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update license type",
        variant: "destructive",
      });
    },
  });

  const deleteLicenseType = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation - would be replaced with actual Supabase call
      console.log('Deactivating license type:', id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license-types'] });
      toast({
        title: "Success",
        description: "License type deactivated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate license type",
        variant: "destructive",
      });
    },
  });

  return {
    createLicenseType,
    updateLicenseType,
    deleteLicenseType,
  };
};
