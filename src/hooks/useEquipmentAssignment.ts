
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EquipmentAssignment {
  id: string;
  client_id: string;
  equipment_id: string;
  assigned_by: string;
  assigned_at: string;
  installation_notes?: string;
  status: string;
  equipment?: {
    id: string;
    type: string;
    brand?: string;
    model?: string;
    serial_number: string;
    status: string;
  };
  clients?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const useEquipmentAssignment = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['equipment-assignments', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('client_equipment_assignments')
        .select(`
          *,
          equipment (
            id,
            type,
            brand,
            model,
            serial_number,
            status
          ),
          clients (
            id,
            name,
            phone
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as EquipmentAssignment[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const assignEquipment = useMutation({
    mutationFn: async ({
      clientId,
      equipmentId,
      installationNotes
    }: {
      clientId: string;
      equipmentId: string;
      installationNotes?: string;
    }) => {
      const { error } = await supabase
        .from('client_equipment_assignments')
        .insert({
          client_id: clientId,
          equipment_id: equipmentId,
          assigned_by: profile?.id,
          installation_notes: installationNotes,
          isp_company_id: profile?.isp_company_id,
        });

      if (error) throw error;

      // Update equipment status to assigned
      await supabase
        .from('equipment')
        .update({ status: 'assigned' })
        .eq('id', equipmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      toast({
        title: "Equipment Assigned",
        description: "Equipment has been successfully assigned to client.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign equipment to client.",
        variant: "destructive",
      });
    },
  });

  const updateAssignmentStatus = useMutation({
    mutationFn: async ({
      assignmentId,
      status,
      notes
    }: {
      assignmentId: string;
      status: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('client_equipment_assignments')
        .update({
          status,
          installation_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
      toast({
        title: "Assignment Updated",
        description: "Equipment assignment status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update assignment status.",
        variant: "destructive",
      });
    },
  });

  return {
    assignments,
    isLoading,
    assignEquipment: assignEquipment.mutate,
    isAssigningEquipment: assignEquipment.isPending,
    updateAssignmentStatus: updateAssignmentStatus.mutate,
    isUpdatingStatus: updateAssignmentStatus.isPending,
  };
};
