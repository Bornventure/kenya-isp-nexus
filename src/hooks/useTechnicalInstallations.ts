
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TechnicalInstallation {
  id: string;
  client_id: string;
  assigned_technician?: string;
  installation_date?: string;
  status: string;
  completion_notes?: string;
  completed_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
  clients?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    county: string;
    sub_county: string;
  };
  technician?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export const useTechnicalInstallations = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: installations = [], isLoading, error } = useQuery({
    queryKey: ['technical-installations', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('technical_installations')
        .select(`
          *,
          clients (
            name,
            email,
            phone,
            address,
            county,
            sub_county
          ),
          technician:profiles!assigned_technician (
            first_name,
            last_name,
            email
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching technical installations:', error);
        throw error;
      }

      // Process the data to handle potential null technician
      const processedData = data.map(installation => ({
        ...installation,
        technician: installation.technician || null
      }));

      return processedData as TechnicalInstallation[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createTechnicalInstallation = useMutation({
    mutationFn: async (installationData: {
      client_id: string;
      assigned_technician?: string;
      installation_date?: string;
    }) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('technical_installations')
        .insert({
          client_id: installationData.client_id,
          assigned_technician: installationData.assigned_technician,
          installation_date: installationData.installation_date,
          status: 'pending',
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-installations'] });
      toast({
        title: "Installation Assignment Created",
        description: "Technical installation has been assigned successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating technical installation:', error);
      toast({
        title: "Error",
        description: "Failed to create technical installation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTechnicalInstallation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TechnicalInstallation> }) => {
      const { data, error } = await supabase
        .from('technical_installations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-installations'] });
      toast({
        title: "Installation Updated",
        description: "Technical installation has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating technical installation:', error);
      toast({
        title: "Error",
        description: "Failed to update technical installation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeInstallation = useMutation({
    mutationFn: async ({ id, completion_notes }: { id: string; completion_notes?: string }) => {
      const { data, error } = await supabase
        .from('technical_installations')
        .update({
          status: 'completed',
          completed_by: profile?.id,
          completed_at: new Date().toISOString(),
          completion_notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update client installation status
      const installation = data as TechnicalInstallation;
      await supabase
        .from('clients')
        .update({
          installation_status: 'completed',
          installation_completed_by: profile?.id,
          installation_completed_at: new Date().toISOString(),
        })
        .eq('id', installation.client_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-installations'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Installation Completed",
        description: "Installation has been marked as completed and service package invoice generated.",
      });
    },
    onError: (error) => {
      console.error('Error completing installation:', error);
      toast({
        title: "Error",
        description: "Failed to complete installation. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    installations,
    isLoading,
    error,
    createTechnicalInstallation: createTechnicalInstallation.mutate,
    updateTechnicalInstallation: updateTechnicalInstallation.mutate,
    completeInstallation: completeInstallation.mutate,
    isCreating: createTechnicalInstallation.isPending,
    isUpdating: updateTechnicalInstallation.isPending,
    isCompleting: completeInstallation.isPending,
  };
};
