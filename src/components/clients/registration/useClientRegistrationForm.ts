
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

  const validateDuplicates = async (email: string, idNumber: string): Promise<boolean> => {
    try {
      // Check for existing email in clients table
      const { data: existingEmailClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingEmailClient) {
        setErrors(prev => ({ ...prev, email: 'A client with this email already exists' }));
        return false;
      }

      // Check for existing ID number in clients table
      const { data: existingIdClient } = await supabase
        .from('clients')
        .select('id')
        .eq('id_number', idNumber)
        .maybeSingle();

      if (existingIdClient) {
        setErrors(prev => ({ ...prev, idNumber: 'A client with this ID number already exists' }));
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return true; // Allow submission if check fails
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

    try {
      // Validate duplicates before submission
      const isValid = await validateDuplicates(formData.email, formData.idNumber);
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

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

      // Call the edge function directly
      const { data: result, error: functionError } = await supabase.functions.invoke('authenticated-client-registration', {
        body: clientData,
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'Failed to register client');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to register client');
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
      
      // Handle specific error types with better messaging
      let errorMessage = error.message || "Failed to register client. Please try again.";
      
      if (error.message?.includes('duplicate key')) {
        errorMessage = "A client with this email or ID number already exists. Please check your input.";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Please enter a valid email address.";
        setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      } else if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        errorMessage = "Registration failed due to a server error. Please check your input and try again.";
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
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
