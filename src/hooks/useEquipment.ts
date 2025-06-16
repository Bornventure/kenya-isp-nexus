
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Equipment {
  id: string;
  type: string;
  brand: string | null;
  model: string | null;
  serial_number: string;
  mac_address: string | null;
  status: string;
  client_id: string | null;
  purchase_date: string | null;
  warranty_end_date: string | null;
  notes: string | null;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
  };
}

export const useEquipment = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['equipment', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          clients (
            name
          ),
          equipment_types (
            name,
            brand,
            model,
            device_type
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }

      return data as Equipment[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at' | 'isp_company_id' | 'clients'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('equipment')
        .insert({
          ...equipmentData,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Added",
        description: "New equipment has been successfully added and is pending approval.",
      });
    },
    onError: (error) => {
      console.error('Error creating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Equipment> }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Updated",
        description: "Equipment has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to update equipment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveEquipmentMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          approval_status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          status: 'active',
          notes: notes || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const rejectEquipmentMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          approval_status: 'rejected',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          status: 'inactive',
          notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  return {
    equipment,
    isLoading,
    error,
    createEquipment: createEquipmentMutation.mutate,
    updateEquipment: updateEquipmentMutation.mutate,
    approveEquipment: approveEquipmentMutation.mutate,
    rejectEquipment: rejectEquipmentMutation.mutate,
    isCreating: createEquipmentMutation.isPending,
    isUpdating: updateEquipmentMutation.isPending,
    isApproving: approveEquipmentMutation.isPending,
    isRejecting: rejectEquipmentMutation.isPending,
  };
};
