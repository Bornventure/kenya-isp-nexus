
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface RadiusClientStatus {
  client_id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  username: string;
  password: string;
  bandwidth_profile: string;
  download_speed_kbps: number;
  upload_speed_kbps: number;
  session_timeout: number;
  idle_timeout: number;
  sync_status: string;
  last_synced: string;
  needs_sync: boolean;
  subscription_end_date: string;
  wallet_balance: number;
  monthly_rate: number;
  scheduled_for_disconnection: boolean;
  action: 'ensure_connected' | 'disconnect';
  last_updated: string;
}

export const useRadiusAutomation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  // Fetch RADIUS client status
  const { data: radiusStatus, isLoading: statusLoading, refetch } = useQuery({
    queryKey: ['radius-client-status', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return null;

      const { data, error } = await supabase.functions.invoke('radius-client-status', {
        body: { company_id: profile.isp_company_id }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.data;
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Generate RADIUS credentials
  const generateCredentialsMutation = useMutation({
    mutationFn: async ({ client_id, bulk_generate = false }: { client_id?: string; bulk_generate?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('generate-radius-credentials', {
        body: { client_id, bulk_generate }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['radius-client-status'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: "RADIUS Credentials Generated",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Generate Credentials",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  // Send webhook notification to EC2
  const sendWebhookMutation = useMutation({
    mutationFn: async ({ 
      client_id, 
      status, 
      action, 
      ec2_endpoint 
    }: { 
      client_id: string; 
      status: string; 
      action: string; 
      ec2_endpoint?: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('radius-status-webhook', {
        body: { client_id, status, action, ec2_endpoint }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Webhook Sent",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Webhook Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  // Process billing automation manually
  const runBillingAutomationMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('billing-automation');

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['radius-client-status'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Billing Automation Complete",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Billing Automation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    radiusStatus,
    statusLoading,
    
    // Actions
    generateCredentials: generateCredentialsMutation.mutate,
    sendWebhook: sendWebhookMutation.mutate,
    runBillingAutomation: runBillingAutomationMutation.mutate,
    refetchStatus: refetch,
    
    // Loading states
    isGeneratingCredentials: generateCredentialsMutation.isPending,
    isSendingWebhook: sendWebhookMutation.isPending,
    isRunningBillingAutomation: runBillingAutomationMutation.isPending,
  };
};
