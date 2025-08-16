
import { useState } from 'react';
import { useServicePackages } from '@/hooks/useServicePackages';
import { useClients, DatabaseClient } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  id_number: string;
  kra_pin_number: string;
  mpesa_number: string;
  address: string;
  county: string;
  sub_county: string;
  latitude: number | null;
  longitude: number | null;
  service_package_id: string;
  monthly_rate: number;
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  installation_date: string;
}

interface UseClientRegistrationFormProps {
  onClose: () => void;
  onSave: (client: Partial<DatabaseClient>) => void;
}

export const useClientRegistrationForm = ({ onClose, onSave }: UseClientRegistrationFormProps) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    address: '',
    county: '',
    sub_county: '',
    latitude: null,
    longitude: null,
    service_package_id: '',
    monthly_rate: 0,
    connection_type: 'fiber',
    client_type: 'individual',
    installation_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const { createClient } = useClients();
  const { toast } = useToast();

  const updateFormData = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.id_number.trim()) newErrors.id_number = 'ID number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';
    if (!formData.sub_county.trim()) newErrors.sub_county = 'Sub county is required';
    if (!formData.service_package_id) newErrors.service_package_id = 'Service package is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<DatabaseClient> => {
    if (!validateForm()) {
      throw new Error('Please fix validation errors');
    }

    setIsSubmitting(true);
    try {
      const clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'> = {
        ...formData,
        status: 'pending',
        balance: 0,
        wallet_balance: 0,
        subscription_start_date: '',
        subscription_end_date: '',
        subscription_type: 'monthly',
        approved_at: '',
        approved_by: '',
        isp_company_id: '',
        notes: null,
        rejection_reason: null,
        rejected_at: null,
        rejected_by: null,
        installation_status: 'pending',
        submitted_by: 'sales'
      };

      const result = await createClient(clientData);
      
      toast({
        title: "Client Registered",
        description: "Client has been successfully registered",
      });

      onSave(result);
      onClose();
      return result;
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register client. Please try again.",
        variant: "destructive",
      });
      throw error;
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
