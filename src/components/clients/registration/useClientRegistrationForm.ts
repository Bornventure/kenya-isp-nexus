
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Client, ClientType, ConnectionType, ClientStatus } from '@/types/client';

export interface FormData {
  name: string;
  email: string;
  phone: string;
  id_number: string;
  kra_pin_number: string;
  mpesa_number: string;
  address: string;
  county: string;
  sub_county: string;
  latitude?: number;
  longitude?: number;
  client_type: ClientType;
  connection_type: ConnectionType;
  service_package_id: string;
  monthly_rate: number;
  installation_date?: string;
}

export const useClientRegistrationForm = ({ onClose, onSave }: { onClose: () => void; onSave: (client: Partial<Client>) => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { profile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    address: '',
    county: '',
    sub_county: '',
    client_type: 'individual',
    connection_type: 'fiber',
    service_package_id: '',
    monthly_rate: 0,
    installation_date: new Date().toISOString().split('T')[0],
  });

  // Fetch service packages
  const { data: servicePackages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['service_packages', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('is_active', true)
        .order('monthly_rate');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.isp_company_id,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.id_number.trim()) newErrors.id_number = 'ID number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';
    if (!formData.sub_county.trim()) newErrors.sub_county = 'Sub county is required';
    if (!formData.service_package_id) newErrors.service_package_id = 'Service package is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!profile?.isp_company_id) {
      toast({
        title: "Error",
        description: "Company information not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get service package details
      const selectedPackage = servicePackages.find(pkg => pkg.id === formData.service_package_id);
      if (!selectedPackage) {
        throw new Error('Service package not found');
      }

      // Prepare client data for database
      const clientData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        id_number: formData.id_number,
        kra_pin_number: formData.kra_pin_number || undefined,
        mpesa_number: formData.mpesa_number,
        address: formData.address,
        county: formData.county,
        sub_county: formData.sub_county,
        latitude: formData.latitude,
        longitude: formData.longitude,
        client_type: formData.client_type,
        connection_type: formData.connection_type,
        service_package_id: formData.service_package_id,
        monthly_rate: selectedPackage.monthly_rate,
        status: 'pending' as ClientStatus,
        balance: 0,
        wallet_balance: 0,
        is_active: false,
        installation_date: formData.installation_date,
        installation_status: 'pending',
        submitted_by: profile.id,
        isp_company_id: profile.isp_company_id,
      };

      // Insert client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (clientError) {
        throw clientError;
      }

      // Create service assignment
      const { error: assignmentError } = await supabase
        .from('client_service_assignments')
        .insert({
          client_id: newClient.id,
          service_package_id: formData.service_package_id,
          assigned_at: new Date().toISOString(),
          is_active: false,
          notes: 'Initial service assignment',
          isp_company_id: profile.isp_company_id,
        });

      if (assignmentError) {
        console.warn('Service assignment creation failed:', assignmentError);
      }

      toast({
        title: "Success",
        description: "Client registered successfully. Awaiting approval.",
      });

      onSave(newClient);
      onClose();

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
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
