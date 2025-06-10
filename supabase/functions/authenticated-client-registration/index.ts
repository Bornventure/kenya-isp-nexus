
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

interface RegistrationError {
  code: string;
  message: string;
  details?: any;
}

function createError(code: string, message: string, details?: any): RegistrationError {
  return { code, message, details };
}

async function validateClientData(clientData: any): Promise<RegistrationError | null> {
  // Validate required fields
  const requiredFields = ['name', 'email', 'phone', 'id_number', 'address', 'sub_county', 'client_type', 'connection_type'];
  for (const field of requiredFields) {
    if (!clientData[field]) {
      return createError('MISSING_FIELD', `Missing required field: ${field}`);
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clientData.email)) {
    return createError('INVALID_EMAIL', 'Invalid email format');
  }

  // Validate phone format
  const phoneRegex = /^\+254[0-9]{9}$/;
  if (!phoneRegex.test(clientData.phone)) {
    return createError('INVALID_PHONE', 'Phone must be in format +254XXXXXXXXX');
  }

  return null;
}

async function checkDuplicates(supabase: any, email: string, idNumber: string): Promise<RegistrationError | null> {
  try {
    // Check for existing client with email
    const { data: existingClientByEmail, error: emailCheckError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Error checking email duplicates:', emailCheckError);
      return createError('DB_ERROR', 'Failed to validate email uniqueness');
    }

    if (existingClientByEmail) {
      return createError('EMAIL_EXISTS', 'A client with this email already exists');
    }

    // Check for existing client with ID number
    const { data: existingClientById, error: idCheckError } = await supabase
      .from('clients')
      .select('id')
      .eq('id_number', idNumber)
      .maybeSingle();

    if (idCheckError && idCheckError.code !== 'PGRST116') {
      console.error('Error checking ID duplicates:', idCheckError);
      return createError('DB_ERROR', 'Failed to validate ID number uniqueness');
    }

    if (existingClientById) {
      return createError('ID_EXISTS', 'A client with this ID number already exists');
    }

    // Check for existing auth user with email (more efficient than listUsers)
    const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (authCheckError && authCheckError.status !== 404) {
      console.error('Error checking auth user:', authCheckError);
      return createError('AUTH_ERROR', 'Failed to validate user email');
    }

    if (authUser?.user) {
      return createError('USER_EXISTS', 'A user account with this email already exists');
    }

    return null;
  } catch (error) {
    console.error('Duplicate check error:', error);
    return createError('VALIDATION_ERROR', 'Failed to validate user data');
  }
}

async function createUserAccount(supabase: any, clientData: any, password: string) {
  try {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: clientData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: clientData.name.split(' ')[0],
        last_name: clientData.name.split(' ').slice(1).join(' ') || '',
        user_type: 'client'
      }
    });

    if (userError) {
      console.error('User creation error:', userError);
      throw createError('USER_CREATION_FAILED', `Failed to create user account: ${userError.message}`, userError);
    }

    console.log('User account created successfully:', userData.user.id);
    return userData.user;
  } catch (error) {
    if (error.code) throw error;
    console.error('Unexpected user creation error:', error);
    throw createError('USER_CREATION_FAILED', 'Failed to create user account');
  }
}

async function createUserProfile(supabase: any, userId: string, clientData: any, ispCompanyId: string) {
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: clientData.name.split(' ')[0],
        last_name: clientData.name.split(' ').slice(1).join(' ') || '',
        role: 'readonly',
        isp_company_id: ispCompanyId,
        is_active: true
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw createError('PROFILE_CREATION_FAILED', `Failed to create user profile: ${profileError.message}`, profileError);
    }

    console.log('User profile created successfully');
  } catch (error) {
    if (error.code) throw error;
    console.error('Unexpected profile creation error:', error);
    throw createError('PROFILE_CREATION_FAILED', 'Failed to create user profile');
  }
}

async function createClientRecord(supabase: any, userId: string, clientData: any, ispCompanyId: string) {
  try {
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        id: userId,
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
        isp_company_id: ispCompanyId,
        monthly_rate: clientData.monthly_rate || 0,
        status: 'pending'
      })
      .select()
      .single();

    if (clientError) {
      console.error('Client creation error:', clientError);
      throw createError('CLIENT_CREATION_FAILED', `Failed to create client profile: ${clientError.message}`, clientError);
    }

    console.log('Client profile created successfully:', client);
    return client;
  } catch (error) {
    if (error.code) throw error;
    console.error('Unexpected client creation error:', error);
    throw createError('CLIENT_CREATION_FAILED', 'Failed to create client profile');
  }
}

async function sendWelcomeEmail(clientData: any, password: string) {
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
}

async function cleanupOnFailure(supabase: any, userId: string | null, step: string) {
  if (!userId) return;

  console.log(`Cleaning up after failure at step: ${step}`);
  
  try {
    // Clean up in reverse order
    await supabase.from('clients').delete().eq('id', userId);
    console.log('Cleaned up client record');
    
    await supabase.from('profiles').delete().eq('id', userId);
    console.log('Cleaned up profile record');
    
    await supabase.auth.admin.deleteUser(userId);
    console.log('Cleaned up user account');
    
    console.log('Cleanup completed successfully');
  } catch (cleanupError) {
    console.error('Cleanup failed:', cleanupError);
    // Log but don't throw - we've already failed
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let userId: string | null = null;
  let currentStep = 'initialization';

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method !== 'POST') {
      throw createError('METHOD_NOT_ALLOWED', 'Method not allowed');
    }

    currentStep = 'authentication';
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw createError('NO_AUTH', 'No authorization header provided');
    }

    // Verify the user making the request
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw createError('UNAUTHORIZED', 'Invalid or expired token');
    }

    // Get user profile to check permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, isp_company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw createError('PROFILE_NOT_FOUND', 'User profile not found');
    }

    // Check if user has permission to register clients
    const allowedRoles = ['super_admin', 'isp_admin', 'technician']
    if (!allowedRoles.includes(profile.role)) {
      throw createError('INSUFFICIENT_PERMISSIONS', 'Insufficient permissions to register clients');
    }

    currentStep = 'data_parsing';
    const clientData = await req.json();
    console.log('Received authenticated client registration data:', clientData);

    currentStep = 'validation';
    // Validate client data
    const validationError = await validateClientData(clientData);
    if (validationError) {
      throw validationError;
    }

    currentStep = 'duplicate_check';
    // Check for duplicates
    const duplicateError = await checkDuplicates(supabase, clientData.email, clientData.id_number);
    if (duplicateError) {
      throw duplicateError;
    }

    currentStep = 'password_generation';
    // Generate secure password
    const password = generateSecurePassword();

    currentStep = 'user_creation';
    // Create user account
    const newUser = await createUserAccount(supabase, clientData, password);
    userId = newUser.id;

    currentStep = 'profile_creation';
    // Create user profile
    await createUserProfile(supabase, userId, clientData, profile.isp_company_id);

    currentStep = 'client_creation';
    // Create client profile
    const client = await createClientRecord(supabase, userId, clientData, profile.isp_company_id);

    currentStep = 'email_sending';
    // Send welcome email (don't fail if this fails)
    await sendWelcomeEmail(clientData, password);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client registered successfully! Login credentials have been sent to their email address.',
        client: client,
        user_id: userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error(`Registration error at step ${currentStep}:`, error);
    
    // Clean up if we created a user but failed later
    if (userId && currentStep !== 'user_creation') {
      await cleanupOnFailure(supabase, userId, currentStep);
    }
    
    // Determine appropriate error response
    let statusCode = 400;
    let errorMessage = error.message || 'Registration failed';
    
    if (error.code) {
      switch (error.code) {
        case 'UNAUTHORIZED':
        case 'NO_AUTH':
          statusCode = 401;
          break;
        case 'INSUFFICIENT_PERMISSIONS':
          statusCode = 403;
          break;
        case 'METHOD_NOT_ALLOWED':
          statusCode = 405;
          break;
        case 'EMAIL_EXISTS':
        case 'ID_EXISTS':
        case 'USER_EXISTS':
          statusCode = 409; // Conflict
          break;
        case 'INVALID_EMAIL':
        case 'INVALID_PHONE':
        case 'MISSING_FIELD':
          statusCode = 422; // Unprocessable Entity
          break;
        default:
          statusCode = 500;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        code: error.code || 'UNKNOWN_ERROR',
        step: currentStep
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
})
