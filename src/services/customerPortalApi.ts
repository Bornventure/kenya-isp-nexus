
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = 'https://main.qorioninnovations.com/functions/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  console.log('Making API request to:', url);
  console.log('Request options:', options);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        ...options.headers,
      },
      ...options,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    if (!response.ok) {
      console.error('API Error:', response.status, responseData);
      throw new Error(responseData.error || `HTTP ${response.status}: ${responseText}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// For public customer registration (customer portal)
export const registerClient = (clientData: any) => {
  console.log('Registering client with data:', clientData);
  return apiRequest('/client-registration', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
};

// For authenticated admin registration with user creation and email
export const registerClientAuthenticated = async (clientData: any, authToken: string) => {
  console.log('Registering client with authentication:', clientData);
  
  try {
    // Use Supabase client to invoke the edge function
    const { data, error } = await supabase.functions.invoke('authenticated-client-registration', {
      body: clientData,
      headers: {
        'authorization': `Bearer ${authToken}`
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to register client');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginClient = (credentials: any) => {
  console.log('Logging in client with credentials:', credentials);
  return apiRequest('/client-auth', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const getServicePackages = (ispCompanyId: string) => {
  console.log('Getting service packages for ISP:', ispCompanyId);
  return apiRequest(`/service-packages?isp_company_id=${ispCompanyId}`);
};
