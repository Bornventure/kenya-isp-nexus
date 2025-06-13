
import { LoginCredentials, ApiResponse, User } from '@/types';
import { customerLogin } from '@/services/customerPortalApi';
import { clientToUser } from '../authUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class AuthService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async loginClient(credentials: { email: string; id_number: string }): Promise<ApiResponse<any>> {
    console.log('Authenticating client with credentials:', {
      email: credentials.email,
      id_number: credentials.id_number.replace(/(.{3}).*(.{3})/, '$1*****$2')
    });

    try {
      const result = await customerLogin({
        email: credentials.email,
        idNumber: credentials.id_number
      });

      console.log('Customer login result:', result);

      if (result.success && result.client) {
        console.log('Client data from API:', result.client);
        console.log('Client status from API:', result.client.status);
        
        return {
          success: true,
          data: result.client,
          message: 'Authentication successful'
        };
      }

      return {
        success: false,
        error: 'Authentication failed',
        code: 'INVALID_CREDENTIALS'
      };
    } catch (error: any) {
      console.error('Client authentication error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
        code: 'AUTHENTICATION_ERROR'
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log('Starting login process...');

    // Temporary super-admin login for testing - using proper UUID format
    if (credentials.email === 'admin@datadefender.com' && credentials.password === 'admin123') {
      console.log('Super admin login detected');
      const superAdminUser: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@datadefender.com',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+254700000000',
        accountType: 'software',
        role: 'super-admin',
        isVerified: true,
      };
      
      const mockToken = 'mock-jwt-token-for-super-admin';
      localStorage.setItem('token', mockToken);
      
      return {
        success: true,
        data: {
          user: superAdminUser,
          token: mockToken,
        },
        message: 'Super admin login successful',
      };
    }

    // Try client login using email and ID number
    console.log('Attempting client authentication...');
    
    try {
      const result = await this.loginClient({
        email: credentials.email,
        id_number: credentials.password, // Using password field to store ID number
      });
      
      console.log('Client authentication result:', result);
      
      if (result.success && result.data) {
        const clientData = result.data;
        
        console.log('Client data received:', clientData);
        console.log('Client status:', clientData.status);
        
        // Check if client account is active - only allow 'active' status
        if (!clientData.status || clientData.status !== 'active') {
          console.log('Client account not active, status:', clientData.status);
          
          // Provide specific error messages based on status
          let errorMessage = 'Please contact support for account status information.';
          if (clientData.status === 'pending') {
            errorMessage = 'Your account is pending activation. Please contact support to have your account activated.';
          } else if (clientData.status === 'suspended') {
            errorMessage = 'Your account is suspended. Please contact support or make payment to reactivate.';
          } else if (clientData.status === 'disconnected') {
            errorMessage = 'Your account is disconnected. Please contact support for reconnection.';
          }
          
          return {
            success: false,
            error: errorMessage,
          };
        }

        // Convert client data to user format
        const user = clientToUser(clientData);
        
        console.log('Converted user:', user);
        
        // Create a mock token for the session
        const token = `client-token-${clientData.id}`;
        localStorage.setItem('token', token);
        localStorage.setItem('clientData', JSON.stringify(clientData));
        
        return {
          success: true,
          data: { user, token },
          message: 'Login successful',
        };
      }

      // Provide more specific error messages based on error codes
      let errorMessage = result.error || 'Invalid credentials';
      
      if (result.code === 'ENDPOINT_NOT_FOUND' || result.code === 'ALL_ENDPOINTS_FAILED') {
        errorMessage = 'Authentication service is currently unavailable. Please contact support.';
      } else if (result.code === 'NETWORK_ERROR') {
        errorMessage = 'Unable to connect to authentication service. Please check your internet connection and try again.';
      } else if (result.code === 'INVALID_RESPONSE_FORMAT') {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    } catch (error) {
      console.error('Client login error:', error);
      return {
        success: false,
        error: 'Login failed due to a technical error. Please try again later.',
      };
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    localStorage.removeItem('token');
    localStorage.removeItem('clientData');
    localStorage.removeItem('authUser');
    localStorage.removeItem('mockPaymentMethods');
    return { success: true, data: null };
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    // For now, just return the existing token
    const token = localStorage.getItem('token');
    if (token) {
      return { success: true, data: { token } };
    }
    return { success: false, error: 'No token found' };
  }

  async verifyToken(): Promise<User> {
    const token = localStorage.getItem('token');
    
    // Handle super-admin mock token
    if (token === 'mock-jwt-token-for-super-admin') {
      return {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@datadefender.com',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+254700000000',
        accountType: 'software',
        role: 'super-admin',
        isVerified: true,
      };
    }

    // Handle client tokens
    if (token && token.startsWith('client-token-')) {
      const clientData = localStorage.getItem('clientData');
      if (clientData) {
        try {
          const client = JSON.parse(clientData);
          return clientToUser(client);
        } catch (error) {
          console.error('Error parsing client data:', error);
        }
      }
    }

    throw new Error('Invalid token');
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    // For ISP system, password reset would need to be handled differently
    return {
      success: false,
      error: 'Password reset not available. Please contact support for assistance with your ID number.',
    };
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return {
      success: false,
      error: 'Password reset not available. Please contact support for assistance.',
    };
  }
}

export const authService = new AuthService();
