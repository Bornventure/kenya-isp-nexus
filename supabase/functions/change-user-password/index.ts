
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChangePasswordRequest {
  user_id: string;
  new_password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token using the admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const currentUserId = user.id;
    console.log('Current user ID:', currentUserId);

    // Get the requesting user's profile to check permissions
    const { data: requestingUserProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, isp_company_id')
      .eq('id', currentUserId)
      .single();

    console.log('Requesting user profile:', requestingUserProfile);

    if (profileError || !requestingUserProfile) {
      console.error('Error fetching requesting user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Unable to verify user permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user has admin permissions
    const isAdmin = ['super_admin', 'isp_admin'].includes(requestingUserProfile.role);
    console.log('Is admin check:', isAdmin, 'Role:', requestingUserProfile.role);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const { user_id, new_password }: ChangePasswordRequest = await req.json();

    if (!user_id || !new_password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id and new_password' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate password length
    if (new_password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // For isp_admin, ensure they can only change passwords for users in their company
    if (requestingUserProfile.role === 'isp_admin') {
      const { data: targetUserProfile, error: targetProfileError } = await supabaseAdmin
        .from('profiles')
        .select('isp_company_id, role')
        .eq('id', user_id)
        .single();

      console.log('Target user profile:', targetUserProfile);

      if (targetProfileError || !targetUserProfile) {
        console.error('Target user not found:', targetProfileError);
        return new Response(
          JSON.stringify({ error: 'Target user not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (targetUserProfile.isp_company_id !== requestingUserProfile.isp_company_id) {
        return new Response(
          JSON.stringify({ error: 'You can only change passwords for users in your company' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Prevent isp_admin from changing other super_admin passwords
      if (targetUserProfile.role === 'super_admin') {
        return new Response(
          JSON.stringify({ error: 'ISP admins cannot change super admin passwords' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Update the user's password using admin API
    console.log('Attempting to update password for user:', user_id);
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    );

    if (error) {
      console.error('Error updating password:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Password updated successfully for user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password updated successfully',
        user_id: user_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
