
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
  step?: string;
}

function createError(code: string, message: string, details?: any, step?: string): RegistrationError {
  return { code, message, details, step };
}

function createResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    }
  );
}

async function validateClientData(clientData: any): Promise<RegistrationError | null> {
  console.log('Validating client data:', clientData);
  
  // Validate required fields
  const requiredFields = ['name', 'email', 'phone', 'id_number', 'address', 'sub_county', 'client_type', 'connection_type'];
  for (const field of requiredFields) {
    if (!clientData[field]) {
      console.log(`Missing required field: ${field}`);
      return createError('MISSING_FIELD', `Missing required field: ${field}`, null, 'validation');
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clientData.email)) {
    console.log('Invalid email format:', clientData.email);
    return createError('INVALID_EMAIL', 'Invalid email format', null, 'validation');
  }

  // Validate phone format
  const phoneRegex = /^\+254[0-9]{9}$/;
  if (!phoneRegex.test(clientData.phone)) {
    console.log('Invalid phone format:', clientData.phone);
    return createError('INVALID_PHONE', 'Phone must be in format +254XXXXXXXXX', null, 'validation');
  }

  console.log('Client data validation passed');
  return null;
}

async function checkDuplicates(supabase: any, email: string, idNumber: string): Promise<RegistrationError | null> {
  try {
    console.log(`Checking duplicates for email: ${email}, ID: ${idNumber}`);

    // Check for existing client with email
    const { data: existingClientByEmail, error: emailCheckError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Error checking email duplicates:', emailCheckError);
      return createError('DB_ERROR', 'Failed to validate email uniqueness', emailCheckError, 'duplicate_check');
    }

    if (existingClientByEmail) {
      console.log(`Client with email ${email} already exists`);
      return createError('EMAIL_EXISTS', 'A client with this email already exists', null, 'duplicate_check');
    }

    // Check for existing client with ID number
    const { data: existingClientById, error: idCheckError } = await supabase
      .from('clients')
      .select('id')
      .eq('id_number', idNumber)
      .maybeSingle();

    if (idCheckError && idCheckError.code !== 'PGRST116') {
      console.error('Error checking ID duplicates:', idCheckError);
      return createError('DB_ERROR', 'Failed to validate ID number uniqueness', idCheckError, 'duplicate_check');
    }

    if (existingClientById) {
      console.log(`Client with ID ${idNumber} already exists`);
      return createError('ID_EXISTS', 'A client with this ID number already exists', null, 'duplicate_check');
    }

    // Check for existing auth user with email using admin listUsers
    try {
      console.log('Checking for existing auth users...');
      
      let existingAuthUser = null;
      let page = 1;
      const perPage = 1000;
      
      while (true) {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
          page: page,
          perPage: perPage
        });

        if (authError) {
          console.error('Error checking auth users:', authError);
          console.log('Continuing registration without auth user validation');
          break;
        }

        if (!authData?.users || authData.users.length === 0) {
          break;
        }

        existingAuthUser = authData.users.find(user => user.email === email);
        
        if (existingAuthUser) {
          console.log(`Auth user with email ${email} already exists`);
          return createError('USER_EXISTS', 'A user account with this email already exists', null, 'duplicate_check');
        }

        if (authData.users.length < perPage) {
          break;
        }

        page++;
      }

    } catch (authError) {
      console.error('Auth check failed:', authError);
      console.log('Continuing without auth user validation due to error');
    }

    console.log('No duplicates found, proceeding with registration');
    return null;
  } catch (error) {
    console.error('Duplicate check error:', error);
    return createError('VALIDATION_ERROR', 'Failed to validate user data', error, 'duplicate_check');
  }
}

async function createUserAccount(supabase: any, clientData: any, password: string) {
  try {
    console.log(`Creating user account for: ${clientData.email}`);
    
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
      throw createError('USER_CREATION_FAILED', `Failed to create user account: ${userError.message}`, userError, 'user_creation');
    }

    console.log('User account created successfully:', userData.user.id);
    return userData.user;
  } catch (error) {
    if (error.code) throw error;
    console.error('Unexpected user creation error:', error);
    throw createError('USER_CREATION_FAILED', 'Failed to create user account', error, 'user_creation');
  }
}

async function createUserProfile(supabase: any, userId: string, clientData: any, ispCompanyId: string) {
  try {
    console.log(`Creating profile for user: ${userId}`);
    
    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profileCheckError) {
      console.error('Error checking existing profile:', profileCheckError);
    }

    if (existingProfile) {
      console.log('Profile already exists, skipping creation');
      return;
    }

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
      throw createError('PROFILE_CREATION_FAILED', `Failed to create user profile: ${profileError.message}`, profileError, 'profile_creation');
    }

    console.log('User profile created successfully');
  } catch (error) {
    if (error.code) throw error;
    console.error('Unexpected profile creation error:', error);
    throw createError('PROFILE_CREATION_FAILED', 'Failed to create user profile', error, 'profile_creation');
  }
}

async function createClientRecord(supabase: any, userId: string, clientData: any, ispCompanyId: string) {
  try {
    console.log(`Creating client record for user: ${userId}`);
    
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
      throw createError('CLIENT_CREATION_FAILED', `Failed to create client profile: ${clientError.message}`, clientError, 'client_creation');
    }

    console.log('Client profile created successfully:', client);
    return client;
  } catch (error) {
    if (error.code) throw error;
    console.error('Unexpected client creation error:', error);
    throw createError('CLIENT_CREATION_FAILED', 'Failed to create client profile', error, 'client_creation');
  }
}

async function sendWelcomeEmail(clientData: any, password: string) {
  try {
    console.log(`Sending welcome email to: ${clientData.email}`);
    
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
  }
}

async function cleanupOnFailure(supabase: any, userId: string | null, step: string) {
  if (!userId) return;

  console.log(`Cleaning up after failure at step: ${step}`);
  
  try {
    await supabase.from('clients').delete().eq('id', userId);
    console.log('Cleaned up client record');
    
    await supabase.from('profiles').delete().eq('id', userId);
    console.log('Cleaned up profile record');
    
    await supabase.auth.admin.deleteUser(userId);
    console.log('Cleaned up user account');
    
    console.log('Cleanup completed successfully');
  } catch (cleanupError) {
    console.error('Cleanup failed:', cleanupError);
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
    console.log('=== Client Registration Request Started ===');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method !== 'POST') {
      return createResponse({
        success: false,
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }, 405);
    }

    currentStep = 'authentication';
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return createResponse({
        success: false,
        error: 'No authorization header provided',
        code: 'NO_AUTH'
      }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return createResponse({
        success: false,
        error: 'Invalid or expired token',
        code: 'UNAUTHORIZED'
      }, 401);
    }

    console.log(`Request authenticated for user: ${user.email}`);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, isp_company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return createResponse({
        success: false,
        error: 'User profile not found',
        code: 'PROFILE_NOT_FOUND'
      }, 403);
    }

    const allowedRoles = ['super_admin', 'isp_admin', 'technician']
    if (!allowedRoles.includes(profile.role)) {
      return createResponse({
        success: false,
        error: 'Insufficient permissions to register clients',
        code: 'INSUFFICIENT_PERMISSIONS'
      }, 403);
    }

    console.log(`User has role: ${profile.role}, Company: ${profile.isp_company_id}`);

    currentStep = 'data_parsing';
    const clientData = await req.json();
    console.log('Received client registration data:', clientData);

    currentStep = 'validation';
    const validationError = await validateClientData(clientData);
    if (validationError) {
      return createResponse({
        success: false,
        error: validationError.message,
        code: validationError.code,
        step: validationError.step
      }, 422);
    }

    currentStep = 'duplicate_check';
    const duplicateError = await checkDuplicates(supabase, clientData.email, clientData.id_number);
    if (duplicateError) {
      return createResponse({
        success: false,
        error: duplicateError.message,
        code: duplicateError.code,
        step: duplicateError.step
      }, 409);
    }

    currentStep = 'password_generation';
    const password = generateSecurePassword();
    console.log('Generated secure password for user');

    currentStep = 'user_creation';
    const newUser = await createUserAccount(supabase, clientData, password);
    userId = newUser.id;

    currentStep = 'profile_creation';
    await createUserProfile(supabase, userId, clientData, profile.isp_company_id);

    currentStep = 'client_creation';
    const client = await createClientRecord(supabase, userId, clientData, profile.isp_company_id);

    currentStep = 'email_sending';
    await sendWelcomeEmail(clientData, password);

    console.log('=== Client Registration Completed Successfully ===');

    return createResponse({
      success: true,
      message: 'Client registered successfully! Login credentials have been sent to their email address.',
      client: client,
      user_id: userId
    });

  } catch (error: any) {
    console.error(`=== Registration Error at step ${currentStep} ===`);
    console.error('Error details:', error);
    
    if (userId && currentStep !== 'user_creation') {
      await cleanupOnFailure(supabase, userId, currentStep);
    }
    
    let statusCode = 500;
    let errorResponse = {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      step: currentStep
    };
    
    if (error.code) {
      errorResponse = {
        success: false,
        error: error.message,
        code: error.code,
        step: error.step || currentStep
      };
      
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
          statusCode = 409;
          break;
        case 'INVALID_EMAIL':
        case 'INVALID_PHONE':
        case 'MISSING_FIELD':
          statusCode = 422;
          break;
        default:
          statusCode = 500;
      }
    }
    
    return createResponse(errorResponse, statusCode);
  }
})
