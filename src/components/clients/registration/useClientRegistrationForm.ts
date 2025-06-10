
import { useState } from 'react';
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

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
      const selectedPackage = servicePackages.find(pkg => pkg.id === formData.servicePackage);
      
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
        service_package_id: formData.servicePackage,
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
        monthlyRate: selectedPackage?.monthly_rate || 0,
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
