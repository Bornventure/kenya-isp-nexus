
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface NetworkSession {
  id: string;
  username: string;
  ipAddress: string;
  startTime: string;
  duration: number;
  bytesIn: number;
  bytesOut: number;
  status: 'active' | 'terminated';
  nasIpAddress?: string;
  sessionId?: string;
}

export interface ActiveSession {
  id: string;
  username: string;
  nas_ip_address: string;
  framed_ip_address: string;
  calling_station_id: string;
  session_start: string;
  last_update: string;
  client_id?: string;
  isp_company_id: string;
}

export interface RadiusAccounting {
  id: string;
  username: string;
  nas_ip_address: string;
  session_id: string;
  session_time: number;
  input_octets: number;
  output_octets: number;
  terminate_cause: string;
  client_id?: string;
  isp_company_id: string;
  created_at: string;
}

export const useRadiusSessions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const getActiveSessions = async (): Promise<NetworkSession[]> => {
    if (!profile?.isp_company_id) return [];

    const { data, error } = await supabase
      .from('active_sessions' as any)
      .select(`
        *,
        clients (
          name,
          email
        )
      `)
      .eq('isp_company_id', profile.isp_company_id)
      .order('session_start', { ascending: false });

    if (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.warn('No active sessions data returned');
      return [];
    }

    return data.map((session: any) => ({
      id: session.id,
      username: session.username,
      ipAddress: session.framed_ip_address || session.nas_ip_address,
      startTime: session.session_start,
      duration: Math.floor((new Date().getTime() - new Date(session.session_start).getTime()) / 1000),
      bytesIn: 0, // Will be populated from accounting data if available
      bytesOut: 0,
      status: 'active' as const,
      nasIpAddress: session.nas_ip_address,
      sessionId: session.calling_station_id
    }));
  };

  const getAllSessions = async (): Promise<NetworkSession[]> => {
    if (!profile?.isp_company_id) return [];

    const { data, error } = await supabase
      .from('radius_accounting' as any)
      .select(`
        *,
        clients (
          name,
          email
        )
      `)
      .eq('isp_company_id', profile.isp_company_id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching accounting sessions:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.warn('No accounting sessions data returned');
      return [];
    }

    return data.map((session: any) => ({
      id: session.id,
      username: session.username,
      ipAddress: session.nas_ip_address,
      startTime: session.created_at,
      duration: session.session_time || 0,
      bytesIn: session.input_octets || 0,
      bytesOut: session.output_octets || 0,
      status: 'terminated' as const,
      nasIpAddress: session.nas_ip_address,
      sessionId: session.session_id
    }));
  };

  const terminateSessionFn = async (sessionId: string): Promise<void> => {
    // Remove from active sessions
    const { error } = await supabase
      .from('active_sessions' as any)
      .delete()
      .eq('id', sessionId)
      .eq('isp_company_id', profile?.isp_company_id);

    if (error) {
      console.error('Error terminating session:', error);
      throw error;
    }
  };

  const { data: activeSessions = [], isLoading } = useQuery({
    queryKey: ['radius-sessions', 'active', profile?.isp_company_id],
    queryFn: getActiveSessions,
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000
  });

  const { data: allSessions = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['radius-sessions', 'all', profile?.isp_company_id],
    queryFn: getAllSessions,
    enabled: !!profile?.isp_company_id,
    refetchInterval: 60000
  });

  const { mutateAsync: terminateSession, isPending: isTerminating } = useMutation({
    mutationFn: terminateSessionFn,
    onSuccess: () => {
      toast({
        title: "Session Terminated",
        description: "User session has been successfully terminated.",
      });
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to terminate session. Please try again.",
        variant: "destructive",
      });
      console.error('Error terminating session:', error);
    }
  });

  return {
    activeSessions,
    allSessions,
    isLoading,
    isLoadingAll,
    terminateSession,
    isTerminating
  };
};

export default useRadiusSessions;
