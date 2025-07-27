
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TechnicalInstallation {
  id: string;
  client_id: string;
  assigned_technician: string | null;
  installation_date: string | null;
  status: string;
  completion_notes: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
  clients?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    county: string;
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
            county
          ),
          technician:profiles!technical_installations_assigned_technician_fkey (
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

      // Handle the case where technician might be null or have query errors
      return (data || []).map(installation => ({
        ...installation,
        technician: installation.technician && typeof installation.technician === 'object' && !('error' in installation.technician)
          ? installation.technician
          : null
      })) as TechnicalInstallation[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const assignTechnician = useMutation({
    mutationFn: async ({ installationId, technicianId }: { installationId: string; technicianId: string }) => {
      const { data, error } = await supabase
        .from('technical_installations')
        .update({
          assigned_technician: technicianId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', installationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-installations'] });
      toast({
        title: "Technician Assigned",
        description: "Installation has been assigned to a technician.",
      });
    },
    onError: (error) => {
      console.error('Error assigning technician:', error);
      toast({
        title: "Error",
        description: "Failed to assign technician. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeInstallation = useMutation({
    mutationFn: async ({ installationId, notes }: { installationId: string; notes?: string }) => {
      const installation = installations.find(i => i.id === installationId);
      if (!installation) throw new Error('Installation not found');

      // Update installation status
      const { error: installationError } = await supabase
        .from('technical_installations')
        .update({
          status: 'completed',
          completion_notes: notes,
          completed_by: profile?.id,
          completed_at: new Date().toISOString(),
        })
        .eq('id', installationId);

      if (installationError) throw installationError;

      // Update client installation status
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          installation_status: 'completed',
          installation_completed_by: profile?.id,
          installation_completed_at: new Date().toISOString(),
        })
        .eq('id', installation.client_id);

      if (clientError) throw clientError;

      return { installationId, clientId: installation.client_id };
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
    assignTechnician: assignTechnician.mutate,
    completeInstallation: completeInstallation.mutate,
    isAssigning: assignTechnician.isPending,
    isCompleting: completeInstallation.isPending,
  };
};
