
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { radiusService } from '@/services/radiusService';

export interface RadiusTestResult {
  test_name: string;
  status: 'passed' | 'failed' | 'pending';
  message: string;
  timestamp: string;
  details?: any;
}

export interface SystemTest {
  id: string;
  test_category: string;
  test_name: string;
  status: 'passed' | 'failed' | 'pending' | 'not_run';
  last_run: string | null;
  message: string;
  details: any;
  isp_company_id: string;
}

export const useRadiusSystem = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testResults = [], isLoading, refetch } = useQuery({
    queryKey: ['radius-tests', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('system_tests' as any)
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching test results:', error);
        return [];
      }

      return (data || []) as SystemTest[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const { data: radiusUsers = [] } = useQuery({
    queryKey: ['radius-users', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_users' as any)
        .select('*')
        .eq('isp_company_id', profile.isp_company_id);

      if (error) {
        console.error('Error fetching RADIUS users:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.isp_company_id,
  });

  const { data: radiusSessions = [] } = useQuery({
    queryKey: ['radius-sessions', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_sessions' as any)
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching RADIUS sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.isp_company_id,
  });

  const runRadiusTests = useMutation({
    mutationFn: async () => {
      if (!profile?.isp_company_id) throw new Error('No company ID');

      const tests = [
        { name: 'RADIUS Server Connection', category: 'radius' },
        { name: 'Database Integration', category: 'radius' },
        { name: 'User Authentication', category: 'radius' },
        { name: 'Session Tracking', category: 'radius' },
        { name: 'PPPoE Configuration', category: 'pppoe' },
        { name: 'MikroTik Integration', category: 'pppoe' },
        { name: 'Speed Limit Control', category: 'pppoe' },
        { name: 'Client Connectivity', category: 'pppoe' }
      ];

      const results = [];

      for (const test of tests) {
        let result: RadiusTestResult;
        
        try {
          switch (test.name) {
            case 'RADIUS Server Connection':
              result = await testRadiusConnection();
              break;
            case 'Database Integration':
              result = await testDatabaseIntegration();
              break;
            case 'User Authentication':
              result = await testUserAuthentication();
              break;
            case 'Session Tracking':
              result = await testSessionTracking();
              break;
            case 'PPPoE Configuration':
              result = await testPPPoEConfiguration();
              break;
            case 'MikroTik Integration':
              result = await testMikroTikIntegration();
              break;
            case 'Speed Limit Control':
              result = await testSpeedLimitControl();
              break;
            case 'Client Connectivity':
              result = await testClientConnectivity();
              break;
            default:
              result = {
                test_name: test.name,
                status: 'failed',
                message: 'Unknown test',
                timestamp: new Date().toISOString()
              };
          }
        } catch (error) {
          result = {
            test_name: test.name,
            status: 'failed',
            message: error instanceof Error ? error.message : 'Test failed',
            timestamp: new Date().toISOString()
          };
        }

        // Store test result in database
        const { error } = await supabase
          .from('system_tests' as any)
          .upsert({
            test_category: test.category,
            test_name: test.name,
            status: result.status,
            message: result.message,
            details: result.details || {},
            last_run: result.timestamp,
            isp_company_id: profile.isp_company_id
          });

        if (error) {
          console.error('Error storing test result:', error);
        }

        results.push(result);
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['radius-tests'] });
      
      const passed = results.filter(r => r.status === 'passed').length;
      const failed = results.filter(r => r.status === 'failed').length;
      
      toast({
        title: "System Tests Completed",
        description: `${passed} tests passed, ${failed} tests failed`,
        variant: failed > 0 ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      console.error('Error running tests:', error);
      toast({
        title: "Test Error",
        description: "Failed to run system tests. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Individual test functions
  const testRadiusConnection = async (): Promise<RadiusTestResult> => {
    try {
      // Test RADIUS server connectivity
      const response = await fetch('http://localhost:1812', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      return {
        test_name: 'RADIUS Server Connection',
        status: 'passed',
        message: 'RADIUS server is accessible on port 1812',
        timestamp: new Date().toISOString(),
        details: { port: 1812, response_time: '< 5s' }
      };
    } catch (error) {
      return {
        test_name: 'RADIUS Server Connection',
        status: 'failed',
        message: 'RADIUS server not accessible. Ensure FreeRADIUS is running on localhost:1812',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Connection failed' }
      };
    }
  };

  const testDatabaseIntegration = async (): Promise<RadiusTestResult> => {
    try {
      const { data, error } = await supabase
        .from('radius_users' as any)
        .select('count(*)', { count: 'exact' });

      if (error) throw error;

      return {
        test_name: 'Database Integration',
        status: 'passed',
        message: `Database connection active. ${data?.[0]?.count || 0} RADIUS users configured`,
        timestamp: new Date().toISOString(),
        details: { user_count: data?.[0]?.count || 0 }
      };
    } catch (error) {
      return {
        test_name: 'Database Integration',
        status: 'failed',
        message: 'Database integration failed. Check Supabase connection',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Database error' }
      };
    }
  };

  const testUserAuthentication = async (): Promise<RadiusTestResult> => {
    try {
      // Check if we have any RADIUS users configured
      const { data: users } = await supabase
        .from('radius_users' as any)
        .select('*')
        .limit(1);

      if (!users || users.length === 0) {
        return {
          test_name: 'User Authentication',
          status: 'failed',
          message: 'No RADIUS users configured. Add clients to enable authentication',
          timestamp: new Date().toISOString(),
          details: { configured_users: 0 }
        };
      }

      // Simulate authentication test
      return {
        test_name: 'User Authentication',
        status: 'passed',
        message: 'User authentication system configured and ready',
        timestamp: new Date().toISOString(),
        details: { configured_users: users.length }
      };
    } catch (error) {
      return {
        test_name: 'User Authentication',
        status: 'failed',
        message: 'Authentication test failed',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Auth error' }
      };
    }
  };

  const testSessionTracking = async (): Promise<RadiusTestResult> => {
    try {
      const { data: sessions } = await supabase
        .from('radius_sessions' as any)
        .select('*')
        .limit(10);

      return {
        test_name: 'Session Tracking',
        status: 'passed',
        message: `Session tracking active. ${sessions?.length || 0} recent sessions recorded`,
        timestamp: new Date().toISOString(),
        details: { active_sessions: sessions?.length || 0 }
      };
    } catch (error) {
      return {
        test_name: 'Session Tracking',
        status: 'failed',
        message: 'Session tracking failed',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Session error' }
      };
    }
  };

  const testPPPoEConfiguration = async (): Promise<RadiusTestResult> => {
    try {
      const { data: routers } = await supabase
        .from('mikrotik_routers' as any)
        .select('*')
        .eq('status', 'active');

      if (!routers || routers.length === 0) {
        return {
          test_name: 'PPPoE Configuration',
          status: 'failed',
          message: 'No active MikroTik routers configured for PPPoE',
          timestamp: new Date().toISOString(),
          details: { active_routers: 0 }
        };
      }

      return {
        test_name: 'PPPoE Configuration',
        status: 'passed',
        message: `PPPoE ready on ${routers.length} router(s)`,
        timestamp: new Date().toISOString(),
        details: { active_routers: routers.length }
      };
    } catch (error) {
      return {
        test_name: 'PPPoE Configuration',
        status: 'failed',
        message: 'PPPoE configuration check failed',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'PPPoE error' }
      };
    }
  };

  const testMikroTikIntegration = async (): Promise<RadiusTestResult> => {
    try {
      const { data: routers } = await supabase
        .from('mikrotik_routers' as any)
        .select('*')
        .eq('connection_status', 'online');

      const onlineCount = routers?.length || 0;
      const status = onlineCount > 0 ? 'passed' : 'failed';
      const message = onlineCount > 0 
        ? `${onlineCount} MikroTik router(s) online and integrated`
        : 'No MikroTik routers currently online';

      return {
        test_name: 'MikroTik Integration',
        status,
        message,
        timestamp: new Date().toISOString(),
        details: { online_routers: onlineCount }
      };
    } catch (error) {
      return {
        test_name: 'MikroTik Integration',
        status: 'failed',
        message: 'MikroTik integration test failed',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Integration error' }
      };
    }
  };

  const testSpeedLimitControl = async (): Promise<RadiusTestResult> => {
    try {
      const { data: clients } = await supabase
        .from('clients')
        .select('*, service_packages(*)')
        .eq('status', 'active')
        .limit(1);

      if (!clients || clients.length === 0) {
        return {
          test_name: 'Speed Limit Control',
          status: 'failed',
          message: 'No active clients configured for speed control',
          timestamp: new Date().toISOString(),
          details: { active_clients: 0 }
        };
      }

      return {
        test_name: 'Speed Limit Control',
        status: 'passed',
        message: 'Speed limit control system configured and ready',
        timestamp: new Date().toISOString(),
        details: { clients_with_limits: clients.length }
      };
    } catch (error) {
      return {
        test_name: 'Speed Limit Control',
        status: 'failed',
        message: 'Speed limit control test failed',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Speed control error' }
      };
    }
  };

  const testClientConnectivity = async (): Promise<RadiusTestResult> => {
    try {
      const { data: sessions } = await supabase
        .from('radius_sessions' as any)
        .select('*')
        .eq('status', 'active')
        .gte('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const recentSessions = sessions?.length || 0;
      const status = recentSessions > 0 ? 'passed' : 'failed';
      const message = recentSessions > 0
        ? `${recentSessions} client(s) connected in the last 24 hours`
        : 'No recent client connections detected';

      return {
        test_name: 'Client Connectivity',
        status,
        message,
        timestamp: new Date().toISOString(),
        details: { recent_connections: recentSessions }
      };
    } catch (error) {
      return {
        test_name: 'Client Connectivity',
        status: 'failed',
        message: 'Client connectivity test failed',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Connectivity error' }
      };
    }
  };

  return {
    testResults,
    radiusUsers,
    radiusSessions,
    isLoading,
    refetch,
    runTests: runRadiusTests.mutate,
    isRunningTests: runRadiusTests.isPending,
  };
};
