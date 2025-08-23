
import { supabase } from '@/integrations/supabase/client';

interface RadiusDebugInfo {
  databaseConnectivity: boolean;
  radiusUsers: any[];
  recentSessions: any[];
  systemHealth: {
    userCount: number;
    activeSessionCount: number;
    lastUserCreated: string | null;
  };
}

class RadiusDebugService {
  async performFullDiagnostic(clientId?: string): Promise<RadiusDebugInfo> {
    console.log('Starting RADIUS diagnostic...', clientId ? `for client: ${clientId}` : 'system-wide');
    
    try {
      // Test basic database connectivity
      const { data: healthCheck, error: healthError } = await supabase
        .from('radius_users' as any)
        .select('count')
        .limit(1);

      const databaseConnectivity = !healthError;
      console.log('Database connectivity:', databaseConnectivity ? 'OK' : 'FAILED', healthError);

      // Get RADIUS users
      let radiusUsersQuery = supabase.from('radius_users' as any).select('*');
      if (clientId) {
        radiusUsersQuery = radiusUsersQuery.eq('client_id', clientId);
      }
      
      const { data: radiusUsers, error: usersError } = await radiusUsersQuery;
      console.log('RADIUS users query result:', { users: radiusUsers, error: usersError });

      // Get recent sessions
      const { data: recentSessions, error: sessionsError } = await supabase
        .from('active_sessions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      console.log('Recent sessions query result:', { sessions: recentSessions, error: sessionsError });

      // Calculate system health metrics
      const userCount = radiusUsers?.length || 0;
      const activeSessionCount = recentSessions?.length || 0;
      
      // Cast radiusUsers to any[] to avoid TypeScript errors when accessing properties
      const users = (radiusUsers || []) as any[];
      const lastUserCreated = users.length > 0 
        ? users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at
        : null;

      const diagnostic: RadiusDebugInfo = {
        databaseConnectivity,
        radiusUsers: users,
        recentSessions: (recentSessions || []) as any[],
        systemHealth: {
          userCount,
          activeSessionCount,
          lastUserCreated
        }
      };

      console.log('RADIUS diagnostic complete:', diagnostic);
      return diagnostic;

    } catch (error) {
      console.error('RADIUS diagnostic failed:', error);
      throw error;
    }
  }

  async testRadiusUserCreation(testData: {
    username: string;
    password: string;
    clientId: string;
    companyId: string;
  }) {
    console.log('Testing RADIUS user creation with data:', testData);
    
    try {
      const { data, error } = await supabase
        .from('radius_users' as any)
        .insert({
          username: testData.username,
          password: testData.password,
          group_name: 'test_group',
          is_active: true,
          client_id: testData.clientId,
          isp_company_id: testData.companyId,
          max_download: '5120',
          max_upload: '512',
          expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('RADIUS user creation failed:', error);
        return { success: false, error: error.message, data: null };
      }

      console.log('RADIUS user created successfully:', data);
      return { success: true, error: null, data };

    } catch (error) {
      console.error('RADIUS user creation exception:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: null };
    }
  }

  async verifyUserInDatabase(username: string) {
    console.log('Verifying user in database:', username);
    
    try {
      const { data, error } = await supabase
        .from('radius_users' as any)
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('User verification failed:', error);
        return { found: false, error: error.message, user: null };
      }

      console.log('User found in database:', data);
      return { found: true, error: null, user: data };

    } catch (error) {
      console.error('User verification exception:', error);
      return { found: false, error: error instanceof Error ? error.message : 'Unknown error', user: null };
    }
  }

  generateTroubleshootingReport(diagnostic: RadiusDebugInfo, clientId?: string): string[] {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Database connectivity issues
    if (!diagnostic.databaseConnectivity) {
      issues.push('❌ Database connectivity failed');
      recommendations.push('1. Check Supabase connection and credentials');
      recommendations.push('2. Verify EC2 instance can connect to Supabase database');
    } else {
      recommendations.push('✅ Database connectivity is working');
    }

    // User creation issues
    if (clientId && diagnostic.radiusUsers.length === 0) {
      issues.push('❌ No RADIUS user found for this client');
      recommendations.push('3. Check if user creation process completed successfully');
      recommendations.push('4. Verify client activation workflow');
    } else if (diagnostic.radiusUsers.length > 0) {
      recommendations.push(`✅ Found ${diagnostic.radiusUsers.length} RADIUS user(s)`);
    }

    // Session issues
    if (diagnostic.recentSessions.length === 0) {
      issues.push('❌ No active sessions found');
      recommendations.push('5. Check RADIUS server logs for authentication attempts');
      recommendations.push('6. Verify MikroTik router RADIUS configuration');
      recommendations.push('7. Test RADIUS authentication manually');
    }

    // EC2 and network recommendations
    recommendations.push('');
    recommendations.push('🔧 EC2 RADIUS Server Checks:');
    recommendations.push('   sudo systemctl status freeradius');
    recommendations.push('   sudo tail -f /var/log/freeradius/radius.log');
    recommendations.push('   radtest username password localhost 1812 0 testing123');
    
    recommendations.push('');
    recommendations.push('🔧 MikroTik Router Checks:');
    recommendations.push('   /radius print');
    recommendations.push('   /log print where topics~"radius"');
    recommendations.push('   /ppp active print');

    recommendations.push('');
    recommendations.push('🔧 Network Connectivity:');
    recommendations.push('   Check EC2 security groups (ports 1812, 1813)');
    recommendations.push('   Verify MikroTik can reach 13.48.30.47:1812');
    recommendations.push('   Test UDP connectivity between components');

    return [...issues, '', ...recommendations];
  }
}

export const radiusDebugService = new RadiusDebugService();
