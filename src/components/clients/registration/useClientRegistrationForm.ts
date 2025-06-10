
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useServicePackages } from '@/hooks/useServicePackages';
import { supabase } from '@/integrations/supabase/client';
import { registerClientAuthenticated } from '@/services/customerPortalApi';
import { Client } from '@/types/client';
import { FormData, validateForm } from './formValidation';

interface UseClientRegistrationFormProps {
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

export const useClientRegistrationForm = ({ onClose, onSave }: UseClientRegistrationFormProps) => {
  const { user } = useAuth();
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

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register clients.",
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
        monthly_rate: selectedPackage?.monthly_rate || 0,
      };

      console.log('Client data being sent:', clientData);

      // Fix: Properly await the session promise and extract access_token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('No valid session found');
      }

      const result = await registerClientAuthenticated(clientData, sessionData.session.access_token);

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
