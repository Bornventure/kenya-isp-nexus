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
  equipment_type_id: string | null;
  ip_address: string | null;
  snmp_community: string | null;
  snmp_version: number | null;
  port_number: number | null;
  vlan_id: number | null;
  location_coordinates: any | null;
  auto_discovered: boolean | null;
  approved_by: string | null;
  approved_at: string | null;
  approval_status: string | null;
  base_station_id: string | null;
  location: string | null;
  firmware_version: string | null;
  clients?: {
    name: string;
  };
  equipment_types?: {
    name: string;
    brand: string;
    model: string;
    device_type: string;
  };
  equipment_assignments?: Array<{
    equipment: {
      model: string;
      serial_number: string;
    };
  }>;
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
    mutationFn: async (equipmentData: Partial<Equipment>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      // Prepare the data with database column names
      const completeEquipmentData = {
        type: equipmentData.type || '',
        brand: equipmentData.brand || null,
        model: equipmentData.model || null,
        serial_number: equipmentData.serial_number || '',
        mac_address: equipmentData.mac_address || null,
        status: equipmentData.status || 'available',
        client_id: equipmentData.client_id || null,
        purchase_date: equipmentData.purchase_date || null,
        warranty_end_date: equipmentData.warranty_end_date || null,
        notes: equipmentData.notes || null,
        equipment_type_id: equipmentData.equipment_type_id || null,
        ip_address: equipmentData.ip_address || null,
        snmp_community: equipmentData.snmp_community || 'public',
        snmp_version: equipmentData.snmp_version || 2,
        port_number: equipmentData.port_number || null,
        vlan_id: equipmentData.vlan_id || null,
        location_coordinates: equipmentData.location_coordinates || null,
        auto_discovered: equipmentData.auto_discovered || false,
        approved_by: equipmentData.approved_by || null,
        approved_at: equipmentData.approved_at || null,
        approval_status: equipmentData.approval_status || 'pending',
        base_station_id: equipmentData.base_station_id || null,
        location: equipmentData.location || null,
        firmware_version: equipmentData.firmware_version || null,
        isp_company_id: profile.isp_company_id,
      };

      const { data, error } = await supabase
        .from('equipment')
        .insert(completeEquipmentData)
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
