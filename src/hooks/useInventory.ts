
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Equipment {
  id: string;
  name?: string;
  type: string;
  model?: string;
  brand?: string;
  serial_number?: string;
  mac_address?: string;
  status: 'available' | 'deployed' | 'damaged' | 'maintenance';
  notes?: string;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
  client_id?: string;
  ip_address?: string;
  location?: string;
  clients?: {
    name: string;
    phone?: string;
  };
}

export interface InventoryItem extends Equipment {
  barcode?: string;
  length_meters?: number;
  location_start_lat?: number;
  location_start_lng?: number;
  location_end_lat?: number;
  location_end_lng?: number;
  last_maintenance_date?: string;
  assigned_device_id?: string;
}

export interface ClientEquipment {
  id: string;
  client_id: string;
  equipment_id: string;
  deployed_date: string;
  return_date?: string;
  status: 'active' | 'returned' | 'pending_return';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useInventory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          clients:client_id (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        name: item.type || item.model || 'Unknown Equipment',
        location: item.location || 'Not specified'
      })) as Equipment[];
    },
  });

  const { data: clientEquipment = [], isLoading: clientEquipmentLoading } = useQuery({
    queryKey: ['client-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        deployed_date: item.assigned_at,
        status: 'active' as const,
        updated_at: item.created_at,
        return_date: null,
        notes: null
      })) as ClientEquipment[];
    },
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: Partial<Equipment>) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert({
          type: equipmentData.type || '',
          brand: equipmentData.brand || null,
          model: equipmentData.model || null,
          serial_number: equipmentData.serial_number || '',
          mac_address: equipmentData.mac_address || null,
          status: equipmentData.status || 'available',
          notes: equipmentData.notes || null,
          location: equipmentData.location || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Created",
        description: "New equipment has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Equipment",
        description: error.message || 'Unknown error occurred',
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
    onError: (error: any) => {
      toast({
        title: "Failed to Update Equipment",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Deleted",
        description: "Equipment has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Equipment",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const deployEquipmentMutation = useMutation({
    mutationFn: async ({ equipmentId, clientId }: { equipmentId: string; clientId: string }) => {
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ 
          status: 'deployed',
          client_id: clientId,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId);

      if (equipmentError) throw equipmentError;

      const { error: clientEquipError } = await supabase
        .from('client_equipment')
        .insert({
          client_id: clientId,
          equipment_id: equipmentId,
          assigned_at: new Date().toISOString(),
          is_primary: true
        });

      if (clientEquipError) throw clientEquipError;

      return { equipmentId, clientId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['client-equipment'] });
      toast({
        title: "Equipment Deployed",
        description: "Equipment has been successfully deployed to client.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy equipment",
        variant: "destructive",
      });
    },
  });

  const returnEquipmentMutation = useMutation({
    mutationFn: async (clientEquipmentId: string) => {
      const { error } = await supabase
        .from('client_equipment')
        .delete()
        .eq('id', clientEquipmentId);

      if (error) throw error;
      return clientEquipmentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-equipment'] });
      toast({
        title: "Equipment Returned",
        description: "Equipment has been successfully returned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Return Failed",
        description: error.message || "Failed to return equipment",
        variant: "destructive",
      });
    },
  });

  return {
    equipment,
    clientEquipment,
    equipmentLoading,
    clientEquipmentLoading,
    createEquipment: {
      mutate: createEquipmentMutation.mutate,
      mutateAsync: createEquipmentMutation.mutateAsync,
      isPending: createEquipmentMutation.isPending,
    },
    updateEquipment: {
      mutate: updateEquipmentMutation.mutate,
      mutateAsync: updateEquipmentMutation.mutateAsync,
      isPending: updateEquipmentMutation.isPending,
    },
    deleteEquipment: {
      mutate: deleteEquipmentMutation.mutate,
      mutateAsync: deleteEquipmentMutation.mutateAsync,
      isPending: deleteEquipmentMutation.isPending,
    },
    deployEquipment: {
      mutate: deployEquipmentMutation.mutate,
      mutateAsync: deployEquipmentMutation.mutateAsync,
      isPending: deployEquipmentMutation.isPending,
    },
    returnEquipment: {
      mutate: returnEquipmentMutation.mutate,
      mutateAsync: returnEquipmentMutation.mutateAsync,
      isPending: returnEquipmentMutation.isPending,
    },
  };
};

// Hook implementations
export const useInventoryItems = (filter?: { status?: string }) => {
  const { equipment, equipmentLoading } = useInventory();
  const filteredEquipment = filter?.status 
    ? equipment.filter(e => e.status === filter.status)
    : equipment;
  
  return { data: filteredEquipment, isLoading: equipmentLoading };
};

export const useInventoryStats = () => {
  const { equipment } = useInventory();
  return {
    data: {
      totalItems: equipment.length,
      inStock: equipment.filter(e => e.status === 'available').length,
      deployed: equipment.filter(e => e.status === 'deployed').length,
      maintenance: equipment.filter(e => e.status === 'maintenance').length,
    },
    isLoading: false
  };
};

export const useInventoryItem = (id: string) => {
  const { equipment } = useInventory();
  return {
    data: equipment.find(e => e.id === id),
    isLoading: false
  };
};

export const useCreateInventoryItem = () => {
  const { createEquipment } = useInventory();
  return createEquipment;
};

export const useUpdateInventoryItem = () => {
  const { updateEquipment } = useInventory();
  return updateEquipment;
};

export const useDeleteInventoryItem = () => {
  const { deleteEquipment } = useInventory();
  return deleteEquipment;
};

export const useAssignEquipmentToClient = () => {
  const { deployEquipment } = useInventory();
  return deployEquipment;
};

export const useUnassignEquipmentFromClient = () => {
  const { returnEquipment } = useInventory();
  return returnEquipment;
};

export const usePromoteToNetworkEquipment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('equipment')
        .update({ 
          notes: 'Promoted to network equipment',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.equipmentId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Promoted",
        description: "Item has been promoted to network equipment.",
      });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
