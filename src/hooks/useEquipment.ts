
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Equipment } from '@/types/equipment';
import { useEquipmentTypes } from './useEquipmentTypes';

export const useEquipment = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: equipmentTypes = [], isLoading: typesLoading } = useEquipmentTypes();

  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['equipment', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_types (
            name
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        serial_number: item.serial_number,
        model: item.model,
        type: item.type || item.equipment_types?.name || 'Unknown',
        brand: item.brand,
        status: item.status as Equipment['status'],
        purchase_date: item.purchase_date,
        warranty_end_date: item.warranty_end_date,
        mac_address: item.mac_address,
        location: item.location,
        notes: item.notes,
        equipment_type_id: item.equipment_type_id,
        equipment_types: item.equipment_types,
        isp_company_id: item.isp_company_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        client_id: item.client_id,
        ip_address: item.ip_address,
        approval_status: item.approval_status,
        approved_at: item.approved_at,
        approved_by: item.approved_by,
        auto_discovered: item.auto_discovered,
        base_station_id: item.base_station_id,
        firmware_version: item.firmware_version,
        port_number: item.port_number,
        snmp_community: item.snmp_community,
        snmp_version: item.snmp_version,
        vlan_id: item.vlan_id,
        location_coordinates: item.location_coordinates
      })) as Equipment[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: Partial<Equipment>) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert({
          ...equipmentData,
          isp_company_id: profile?.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Equipment created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create equipment",
        variant: "destructive",
      });
      console.error('Error creating equipment:', error);
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
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  return {
    equipment,
    equipmentTypes,
    isLoading,
    typesLoading,
    error,
    createEquipment: createEquipmentMutation.mutate,
    updateEquipment: updateEquipmentMutation.mutate,
    deleteEquipment: deleteEquipmentMutation.mutate,
    addEquipment: createEquipmentMutation,
    isCreating: createEquipmentMutation.isPending,
    isUpdating: updateEquipmentMutation.isPending,
    isDeleting: deleteEquipmentMutation.isPending,
  };
};
