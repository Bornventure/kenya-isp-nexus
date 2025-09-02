
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { MikrotikRouter } from '@/types/network';

export const useMikrotikRouters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: routers = [], isLoading, error } = useQuery({
    queryKey: ['mikrotik-routers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mikrotik_routers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MikrotikRouter[];
    },
  });

  const createRouter = useMutation({
    mutationFn: async (routerData: Omit<MikrotikRouter, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mikrotik_routers')
        .insert({
          ...routerData,
          isp_company_id: profile?.isp_company_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Success",
        description: "Router created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create router: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateRouter = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MikrotikRouter> }) => {
      const { data, error } = await supabase
        .from('mikrotik_routers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Success",
        description: "Router updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update router: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRouter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mikrotik_routers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Success",
        description: "Router deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete router: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    routers,
    isLoading,
    error,
    createRouter: createRouter.mutate,
    updateRouter: updateRouter.mutate,
    deleteRouter: deleteRouter.mutate,
    isCreating: createRouter.isPending,
    isUpdating: updateRouter.isPending,
    isDeleting: deleteRouter.isPending,
  };
};
