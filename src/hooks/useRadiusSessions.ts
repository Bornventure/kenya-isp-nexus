
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useRadiusSessions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Since network_sessions table doesn't exist yet, we'll use demo data
  const getActiveSessions = async (): Promise<NetworkSession[]> => {
    // Demo data for now
    return [
      {
        id: '1',
        username: 'user1@example.com',
        ipAddress: '192.168.1.100',
        startTime: new Date().toISOString(),
        duration: 3600,
        bytesIn: 1024000,
        bytesOut: 512000,
        status: 'active',
        nasIpAddress: '192.168.1.1',
        sessionId: 'sess_001'
      }
    ];
  };

  const getAllSessions = async (): Promise<NetworkSession[]> => {
    // Demo data for now
    return [
      {
        id: '1',
        username: 'user1@example.com',
        ipAddress: '192.168.1.100',
        startTime: new Date().toISOString(),
        duration: 3600,
        bytesIn: 1024000,
        bytesOut: 512000,
        status: 'active',
        nasIpAddress: '192.168.1.1',
        sessionId: 'sess_001'
      },
      {
        id: '2',
        username: 'user2@example.com',
        ipAddress: '192.168.1.101',
        startTime: new Date(Date.now() - 7200000).toISOString(),
        duration: 7200,
        bytesIn: 2048000,
        bytesOut: 1024000,
        status: 'terminated',
        nasIpAddress: '192.168.1.1',
        sessionId: 'sess_002'
      }
    ];
  };

  const terminateSessionFn = async (sessionId: string): Promise<void> => {
    // This would integrate with RADIUS server to terminate the session
    console.log('Terminating session:', sessionId);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  };

  const { data: activeSessions = [], isLoading } = useQuery({
    queryKey: ['radius-sessions', 'active'],
    queryFn: getActiveSessions,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: allSessions = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['radius-sessions', 'all'],
    queryFn: getAllSessions,
    refetchInterval: 60000 // Refresh every minute
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
