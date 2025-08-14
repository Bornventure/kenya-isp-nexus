
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clientOnboardingService } from '@/services/clientOnboardingService';

export interface Equipment {
  id: string;
  name?: string;
  type: string;
  model?: string;
  brand?: string;
  manufacturer?: string;
  serial_number?: string;
  mac_address?: string;
  status: 'available' | 'deployed' | 'damaged' | 'maintenance';
  notes?: string;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
  client_id?: string;
  ip_address?: string;
  category?: string;
  is_network_equipment?: boolean;
  assigned_customer_id?: string;
  item_id?: string;
  assignment_date?: string;
  equipment_id?: string;
  cost?: number;
  supplier?: string;
  purchase_date?: string;
  warranty_expiry_date?: string;
  item_sku?: string;
  quantity_in_stock?: number;
  reorder_level?: number;
  unit_cost?: number;
  capacity?: string;
  installation_date?: string;
  subnet_mask?: string;
}

export interface InventoryItem extends Equipment {
  // Additional inventory-specific fields
  location?: string;
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        name: item.type || item.model || 'Unknown Equipment',
        manufacturer: item.brand || item.manufacturer
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
      return data as ClientEquipment[];
    },
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
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

      try {
        const onboardingResult = await clientOnboardingService.processClientOnboarding(clientId, equipmentId);
        console.log('Client onboarding result:', onboardingResult);
      } catch (error) {
        console.error('Client onboarding failed:', error);
      }

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
        .update({
          status: 'returned',
          updated_at: new Date().toISOString()
        })
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
    createEquipment: createEquipmentMutation.mutateAsync,
    updateEquipment: updateEquipmentMutation.mutateAsync,
    deleteEquipment: deleteEquipmentMutation.mutateAsync,
    deployEquipment: deployEquipmentMutation.mutateAsync,
    returnEquipment: returnEquipmentMutation.mutateAsync,
    isCreating: createEquipmentMutation.isPending,
    isUpdating: updateEquipmentMutation.isPending,
    isDeleting: deleteEquipmentMutation.isPending,
    isDeploying: deployEquipmentMutation.isPending,
    isReturning: returnEquipmentMutation.isPending,
  };
};

// Hook implementations with both mutate and mutateAsync
export const useInventoryItems = (filter?: { status?: string }) => {
  const { equipment } = useInventory();
  const filteredEquipment = filter?.status 
    ? equipment.filter(e => e.status === filter.status)
    : equipment;
  
  return { data: filteredEquipment, isLoading: false };
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (equipmentData: any) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
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
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};

export const useUpdateInventoryItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', itemId)
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
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};

export const useDeleteInventoryItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Deleted",
        description: "Equipment has been deleted successfully.",
      });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};

export const useAssignEquipmentToClient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async ({ itemId, clientId, clientName }: { itemId: string; clientId: string; clientName: string }) => {
      const { error } = await supabase
        .from('equipment')
        .update({ 
          client_id: clientId,
          status: 'deployed',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;
      return { equipmentId: itemId, clientId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Assigned",
        description: "Equipment has been assigned to client.",
      });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};

export const useUnassignEquipmentFromClient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('equipment')
        .update({ 
          client_id: null,
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Equipment Unassigned",
        description: "Equipment has been unassigned from client.",
      });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};

export const usePromoteToNetworkEquipment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Update equipment to mark as network equipment
      const { error } = await supabase
        .from('equipment')
        .update({ 
          notes: 'Promoted to network equipment',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.itemId);

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
    isPending: mutation.isPending
  };
};
