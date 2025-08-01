
import { useState } from 'react';
import { useServicePackages } from '@/hooks/useServicePackages';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLicenseLimitCheck } from './useLicenseLimitCheck';
import type { Client } from '@/types/client';

interface UseClientRegistrationFormProps {
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

export const useClientRegistrationForm = ({ onClose, onSave }: UseClientRegistrationFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const { checkCanAddClient } = useLicenseLimitCheck();

  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    
    // Location Information
    address: '',
    county: '',
    sub_county: '',
    latitude: null as number | null,
    longitude: null as number | null,
    
    // Service Information
    service_package_id: '',
    monthly_rate: 0,
    connection_type: 'fiber' as any,
    client_type: 'individual' as any,
    installation_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: string, value: any) => {
    console.log('Updating form field:', field, 'with value:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-fill monthly rate when service package is selected
    if (field === 'service_package_id' && value) {
      const selectedPackage = servicePackages.find(pkg => pkg.id === value);
      if (selectedPackage) {
        setFormData(prev => ({ ...prev, monthly_rate: selectedPackage.monthly_rate }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    console.log('Validating form with data:', formData);

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.id_number.trim()) newErrors.id_number = 'ID Number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';
    if (!formData.sub_county.trim()) newErrors.sub_county = 'Sub County is required';
    if (!formData.service_package_id) newErrors.service_package_id = 'Service package is required';
    if (!formData.connection_type) newErrors.connection_type = 'Connection type is required';
    if (!formData.client_type) newErrors.client_type = 'Client type is required';

    // Email validation (if provided)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
    }

    // M-Pesa number validation (if provided)
    if (formData.mpesa_number && !/^(\+254|0)[17]\d{8}$/.test(formData.mpesa_number.replace(/\s/g, ''))) {
      newErrors.mpesa_number = 'Please enter a valid M-Pesa number';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    // Check if user profile exists
    if (!profile) {
      console.error('No user profile found');
      toast({
        title: "Error",
        description: "User profile not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    console.log('User profile:', profile);
    
    // Check license limits first
    if (!checkCanAddClient()) {
      console.log('License limit check failed');
      return;
    }
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare client data
      const clientData = {
        ...formData,
        isp_company_id: profile?.isp_company_id,
        status: 'pending' as const,
        balance: 0,
        wallet_balance: 0,
        is_active: true,
        installation_date: formData.installation_date || null,
        mpesa_number: formData.mpesa_number || formData.phone,
        submitted_by: profile?.id,
      };

      console.log('Submitting client data:', clientData);

      // Validate required fields one more time
      if (!clientData.isp_company_id) {
        throw new Error('No ISP company ID found in user profile');
      }

      // Create client record
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        throw clientError;
      }

      console.log('Client created successfully:', client);

      toast({
        title: "Success",
        description: "Client registered successfully!",
      });

      onSave(client);
      onClose();
    } catch (error) {
      console.error('Error during client registration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to register client. Please try again.';
      toast({
        title: "Error",
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
