
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useServicePackages } from '@/hooks/useServicePackages';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { FormData, validateForm } from './formValidation';

interface UseClientRegistrationFormProps {
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

interface RegistrationError {
  code: string;
  message: string;
  step?: string;
}

export const useClientRegistrationForm = ({ onClose, onSave }: UseClientRegistrationFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    mpesaNumber: '',
    idNumber: '',
    kraPinNumber: '',
    clientType: 'individual',
    connectionType: 'fiber',
    servicePackage: '',
    address: '',
    county: 'Kisumu',
    subCounty: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Memoize the selected package for performance
  const selectedPackage = useMemo(() => {
    return servicePackages.find(pkg => pkg.id === formData.servicePackage);
  }, [servicePackages, formData.servicePackage]);

  const updateFormData = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const getErrorMessage = (error: RegistrationError): string => {
    switch (error.code) {
      case 'EMAIL_EXISTS':
        return 'A client with this email already exists. Please use a different email address.';
      case 'ID_EXISTS':
        return 'A client with this ID number already exists. Please check the ID number.';
      case 'USER_EXISTS':
        return 'A user account with this email already exists. Please use a different email.';
      case 'INVALID_EMAIL':
        return 'Please enter a valid email address.';
      case 'INVALID_PHONE':
        return 'Phone number must be in format +254XXXXXXXXX.';
      case 'MISSING_FIELD':
        return `Missing required field: ${error.message.split(': ')[1] || 'unknown'}`;
      case 'UNAUTHORIZED':
        return 'You are not authorized to register clients. Please log in again.';
      case 'INSUFFICIENT_PERMISSIONS':
        return 'You do not have permission to register clients. Contact your administrator.';
      case 'PROFILE_NOT_FOUND':
        return 'Your profile could not be found. Please contact support.';
      default:
        return error.message || 'Registration failed. Please try again.';
    }
  };

  const setFieldError = (error: RegistrationError) => {
    switch (error.code) {
      case 'EMAIL_EXISTS':
      case 'USER_EXISTS':
      case 'INVALID_EMAIL':
        setErrors(prev => ({ ...prev, email: getErrorMessage(error) }));
        break;
      case 'ID_EXISTS':
        setErrors(prev => ({ ...prev, idNumber: getErrorMessage(error) }));
        break;
      case 'INVALID_PHONE':
        setErrors(prev => ({ ...prev, phone: getErrorMessage(error) }));
        break;
      default:
        // Don't set field-specific errors for general errors
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!user || !profile?.isp_company_id) {
      toast({
        title: "Error",
        description: "You must be logged in and have a valid company to register clients.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear any previous errors

    try {
      // Calculate monthly rate from selected package
      const monthlyRate = selectedPackage?.monthly_rate || 0;

      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        mpesa_number: formData.mpesaNumber || formData.phone,
        id_number: formData.idNumber,
        kra_pin_number: formData.kraPinNumber || null,
        client_type: formData.clientType,
        connection_type: formData.connectionType,
        address: formData.address,
        county: formData.county,
        sub_county: formData.subCounty,
        service_package_id: formData.servicePackage || null,
        monthly_rate: monthlyRate,
        isp_company_id: profile.isp_company_id,
      };

      console.log('Client data being sent:', clientData);

      // Get the session and access token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        throw new Error('No valid session found');
      }

      // Call the edge function
      const { data: result, error: functionError } = await supabase.functions.invoke('authenticated-client-registration', {
        body: clientData,
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        
        // Handle HTTP errors with proper error parsing
        if (functionError.context && typeof functionError.context === 'object') {
          const errorData = functionError.context as any;
          
          if (errorData.code) {
            const errorDetails: RegistrationError = {
              code: errorData.code,
              message: errorData.error || errorData.message || 'Registration failed',
              step: errorData.step
            };
            
            setFieldError(errorDetails);
            throw new Error(getErrorMessage(errorDetails));
          }
        }
        
        // Fallback error handling
        throw new Error(functionError.message || 'Registration failed');
      }

      if (!result?.success) {
        const errorDetails: RegistrationError = {
          code: result?.code || 'REGISTRATION_FAILED',
          message: result?.error || 'Failed to register client',
          step: result?.step
        };
        
        setFieldError(errorDetails);
        throw new Error(getErrorMessage(errorDetails));
      }

      toast({
        title: "Success",
        description: result.message || "Client registered successfully! Login credentials have been sent to their email.",
      });

      const newClient: Partial<Client> = {
        id: result.user_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        mpesaNumber: formData.mpesaNumber || formData.phone,
        idNumber: formData.idNumber,
        kraPinNumber: formData.kraPinNumber || undefined,
        clientType: formData.clientType,
        status: 'pending',
        connectionType: formData.connectionType,
        servicePackage: selectedPackage?.name || '',
        monthlyRate: monthlyRate,
        installationDate: new Date().toISOString().split('T')[0],
        location: {
          address: formData.address,
          county: formData.county,
          subCounty: formData.subCounty
        },
        balance: 0
      };

      onSave(newClient);
      onClose();

    } catch (error: any) {
      console.error('Registration failed:', error);
      
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    servicePackages,
    packagesLoading,
    updateFormData,
    handleSubmit,
  };
};
