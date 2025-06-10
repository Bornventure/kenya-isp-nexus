
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

function generateSecurePassword(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    // Verify the user making the request
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized: Invalid token')
    }

    // Get user profile to check permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, isp_company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('User profile not found')
    }

    // Check if user has permission to register clients
    const allowedRoles = ['super_admin', 'isp_admin', 'technician']
    if (!allowedRoles.includes(profile.role)) {
      throw new Error('Insufficient permissions to register clients')
    }

    const clientData = await req.json();
    console.log('Received authenticated client registration data:', clientData);

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'id_number', 'address', 'sub_county', 'client_type', 'connection_type'];
    for (const field of requiredFields) {
      if (!clientData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
      throw new Error('Invalid email format');
    }

    // Check for existing user with this email first (comprehensive check)
    const { data: existingUsers, error: listUsersError } = await supabase.auth.admin.listUsers()
    if (listUsersError) {
      console.error('Error checking existing users:', listUsersError)
      throw new Error('Failed to validate user uniqueness')
    }

    const emailExists = existingUsers.users.some(u => u.email === clientData.email)
    if (emailExists) {
      throw new Error('A user with this email already exists')
    }

    // Check if email already exists in clients table
    const { data: existingClientByEmail } = await supabase
      .from('clients')
      .select('id')
      .eq('email', clientData.email)
      .maybeSingle()

    if (existingClientByEmail) {
      throw new Error('A client with this email already exists')
    }

    // Check if ID number already exists in clients table
    const { data: existingClientById } = await supabase
      .from('clients')
      .select('id')
      .eq('id_number', clientData.id_number)
      .maybeSingle()

    if (existingClientById) {
      throw new Error('A client with this ID number already exists')
    }

    // Generate secure password
    const password = generateSecurePassword()

    let newUser = null
    let clientCreated = false
    let profileCreated = false

    try {
      // Create user account with appropriate metadata
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: clientData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: clientData.name.split(' ')[0],
          last_name: clientData.name.split(' ').slice(1).join(' ') || '',
          user_type: 'client'
        }
      })

      if (userError) {
        console.error('User creation error:', userError);
        throw new Error(`Failed to create user account: ${userError.message}`);
      }

      newUser = userData.user
      console.log('User account created successfully:', newUser.id);

      // Create user profile with 'readonly' role first
      const { error: profileCreationError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.id,
          first_name: clientData.name.split(' ')[0],
          last_name: clientData.name.split(' ').slice(1).join(' ') || '',
          role: 'readonly',
          isp_company_id: profile.isp_company_id,
          is_active: true
        })

      if (profileCreationError) {
        console.error('Profile creation error:', profileCreationError);
        throw new Error(`Failed to create user profile: ${profileCreationError.message}`);
      }

      profileCreated = true
      console.log('User profile created successfully');

      // Create client profile
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          id: newUser.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          mpesa_number: clientData.mpesa_number || clientData.phone,
          id_number: clientData.id_number,
          kra_pin_number: clientData.kra_pin_number || null,
          client_type: clientData.client_type,
          connection_type: clientData.connection_type,
          address: clientData.address,
          county: clientData.county || 'Kisumu',
          sub_county: clientData.sub_county,
          service_package_id: clientData.service_package_id || null,
          isp_company_id: profile.isp_company_id,
          monthly_rate: clientData.monthly_rate || 0,
          status: 'pending'
        })
        .select()
        .single();

      if (clientError) {
        console.error('Client creation error:', clientError);
        throw new Error(`Failed to create client profile: ${clientError.message}`);
      }

      clientCreated = true
      console.log('Client profile created successfully:', client);

      // Send welcome email with login credentials
      try {
        const emailResponse = await resend.emails.send({
          from: 'ISP Portal <noreply@qorioninnovations.com>',
          to: [clientData.email],
          subject: 'Welcome to Our ISP Service - Your Account Details',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Welcome to Our ISP Service!</h2>
              <p>Dear ${clientData.name},</p>
              
              <p>Your internet service account has been successfully created. Below are your login credentials for accessing our customer portal:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Login Details:</h3>
                <p><strong>Email:</strong> ${clientData.email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Portal URL:</strong> https://main.qorioninnovations.com/customer-portal</p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
              </div>
              
              <h3>Service Details:</h3>
              <ul>
                <li><strong>Service Type:</strong> ${clientData.connection_type}</li>
                <li><strong>Location:</strong> ${clientData.address}, ${clientData.sub_county}</li>
                <li><strong>Phone:</strong> ${clientData.phone}</li>
                ${clientData.monthly_rate ? `<li><strong>Monthly Rate:</strong> KES ${clientData.monthly_rate}</li>` : ''}
              </ul>
              
              <p>Our technical team will contact you within 24 hours to schedule the installation of your internet service.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Thank you for choosing our services!</p>
              
              <p>Best regards,<br>
              Qorion Innovations Technical Support Team</p>
            </div>
          `,
        });

        console.log('Welcome email sent successfully:', emailResponse);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the entire operation if email fails
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Client registered successfully! Login credentials have been sent to their email address.',
          client: client,
          user_id: newUser.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (operationError) {
      console.error('Operation failed, cleaning up...', operationError);
      
      // Clean up in reverse order if any step failed
      if (newUser) {
        try {
          if (clientCreated) {
            console.log('Cleaning up client record...');
            await supabase.from('clients').delete().eq('id', newUser.id);
          }
          
          if (profileCreated) {
            console.log('Cleaning up profile record...');
            await supabase.from('profiles').delete().eq('id', newUser.id);
          }
          
          console.log('Cleaning up user account...');
          await supabase.auth.admin.deleteUser(newUser.id);
          console.log('Cleanup completed');
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
          // Log but don't throw cleanup errors
        }
      }
      
      throw operationError;
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to register client'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
})
