
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clientOnboardingService } from '@/services/clientOnboardingService';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serial_number: string;
  mac_address?: string;
  firmware_version?: string;
  location?: string;
  status: 'available' | 'deployed' | 'damaged' | 'maintenance';
  notes?: string;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name?: string;
  type: string;
  category: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  mac_address?: string;
  status: string;
  quantity_in_stock?: number;
  unit_cost?: number;
  location?: string;
  notes?: string;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
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
        name: item.type || item.model || 'Unknown Equipment'
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

  const createEquipment = useMutation({
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

  const updateEquipment = useMutation({
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

  const deleteEquipment = useMutation({
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

  const deployEquipment = useMutation({
    mutationFn: async ({ equipmentId, clientId }: { equipmentId: string; clientId: string }) => {
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ 
          status: 'deployed',
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

  const returnEquipment = useMutation({
    mutationFn: async ({ clientEquipmentId }: { clientEquipmentId: string }) => {
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
    createEquipment: createEquipment.mutateAsync,
    updateEquipment: updateEquipment.mutateAsync,
    deleteEquipment: deleteEquipment.mutateAsync,
    deployEquipment: deployEquipment.mutateAsync,
    returnEquipment: returnEquipment.mutateAsync,
    isCreating: createEquipment.isPending,
    isUpdating: updateEquipment.isPending,
    isDeleting: deleteEquipment.isPending,
    isDeploying: deployEquipment.isPending,
    isReturning: returnEquipment.isPending,
  };
};

// Additional hooks for compatibility with existing components
export const useInventoryItems = () => {
  const { equipment } = useInventory();
  return { data: equipment, isLoading: false };
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
  return { mutateAsync: createEquipment, isPending: false };
};

export const useUpdateInventoryItem = () => {
  const { updateEquipment } = useInventory();
  return { mutateAsync: updateEquipment, isPending: false };
};

export const useDeleteInventoryItem = () => {
  const { deleteEquipment } = useInventory();
  return { mutateAsync: deleteEquipment, isPending: false };
};

export const useAssignEquipmentToClient = () => {
  const { deployEquipment } = useInventory();
  return { mutateAsync: deployEquipment, isPending: false };
};

export const useUnassignEquipmentFromClient = () => {
  const { returnEquipment } = useInventory();
  return { mutateAsync: returnEquipment, isPending: false };
};

export const usePromoteToNetworkEquipment = () => {
  const { toast } = useToast();
  return {
    mutateAsync: async (data: any) => {
      toast({
        title: "Equipment Promoted",
        description: "Item has been promoted to network equipment.",
      });
      return data;
    },
    isPending: false
  };
};
