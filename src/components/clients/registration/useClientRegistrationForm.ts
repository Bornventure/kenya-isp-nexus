
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { DatabaseClient } from '@/types/database';

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  mpesa_number: string;
  id_number: string;
  kra_pin_number: string;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  address: string;
  county: string;
  sub_county: string;
  service_package_id: string;
  monthly_rate: number;
  installation_date: string;
  subscription_start_date: string;
  subscription_end_date: string;
  subscription_type: string;
}

export const useClientRegistrationForm = () => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    mpesa_number: '',
    id_number: '',
    kra_pin_number: '',
    client_type: 'individual',
    connection_type: 'fiber',
    address: '',
    county: '',
    sub_county: '',
    service_package_id: '',
    monthly_rate: 0,
    installation_date: '',
    subscription_start_date: '',
    subscription_end_date: '',
    subscription_type: 'monthly',
  });

  const { createClient, isCreating } = useClients();
  const { toast } = useToast();

  const updateFormData = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (): Promise<DatabaseClient | null> => {
    try {
      console.log('Submitting client registration form:', formData);

      const clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'> = {
        ...formData,
        status: 'pending',
        balance: 0,
        wallet_balance: 0,
        isp_company_id: '', // This should be set based on the current user's company
        approved_at: '',
        approved_by: '',
        notes: null,
        rejection_reason: null,
        rejected_at: null,
        rejected_by: null,
      };

      const newClient = await createClient(clientData);
      
      toast({
        title: 'Success',
        description: 'Client registered successfully',
      });

      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        mpesa_number: '',
        id_number: '',
        kra_pin_number: '',
        client_type: 'individual',
        connection_type: 'fiber',
        address: '',
        county: '',
        sub_county: '',
        service_package_id: '',
        monthly_rate: 0,
        installation_date: '',
        subscription_start_date: '',
        subscription_end_date: '',
        subscription_type: 'monthly',
      });

      return newClient;
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to register client. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    formData,
    updateFormData,
    handleSubmit,
    isSubmitting: isCreating,
  };
};
