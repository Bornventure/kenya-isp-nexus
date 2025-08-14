
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@/types/client';

const clientRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  id_number: z.string().min(5, 'ID number is required'),
  kra_pin_number: z.string().optional(),
  mpesa_number: z.string().min(10, 'M-Pesa number is required'),
  address: z.string().min(5, 'Address is required'),
  county: z.string().min(2, 'County is required'),
  sub_county: z.string().min(2, 'Sub County is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  client_type: z.enum(['individual', 'business', 'corporate', 'government']),
  connection_type: z.enum(['fiber', 'wireless', 'satellite', 'dsl']),
  service_package_id: z.string().min(1, 'Service package is required'),
  installation_date: z.string().optional(),
});

export type ClientRegistrationData = z.infer<typeof clientRegistrationSchema>;

export const useClientRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const form = useForm<ClientRegistrationData>({
    resolver: zodResolver(clientRegistrationSchema),
    defaultValues: {
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
      installation_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: ClientRegistrationData) => {
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
      const { data: servicePackage, error: packageError } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', data.service_package_id)
        .single();

      if (packageError || !servicePackage) {
        throw new Error('Service package not found');
      }

      // Prepare client data
      const clientData: Partial<Client> = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
        id_number: data.id_number,
        kra_pin_number: data.kra_pin_number || undefined,
        mpesa_number: data.mpesa_number,
        address: data.address,
        county: data.county,
        sub_county: data.sub_county,
        latitude: data.latitude,
        longitude: data.longitude,
        client_type: data.client_type,
        connection_type: data.connection_type,
        service_package_id: data.service_package_id,
        monthly_rate: servicePackage.monthly_rate,
        status: 'pending',
        balance: 0,
        wallet_balance: 0,
        is_active: false,
        installation_date: data.installation_date,
        installation_status: 'pending',
        submitted_by: profile.id,
        isp_company_id: profile.isp_company_id,
        // Add computed fields for backward compatibility
        location: {
          address: data.address,
          county: data.county,
          subCounty: data.sub_county,
          coordinates: data.latitude && data.longitude ? {
            lat: data.latitude,
            lng: data.longitude
          } : undefined
        },
        servicePackage: servicePackage.name,
        connectionType: data.connection_type,
        clientType: data.client_type,
        monthlyRate: servicePackage.monthly_rate,
        installationDate: data.installation_date || new Date().toISOString(),
        mpesaNumber: data.mpesa_number,
        idNumber: data.id_number,
        kraPinNumber: data.kra_pin_number,
        equipment: {
          router: undefined,
          modem: undefined,
          serialNumbers: []
        },
        service_packages: {
          id: servicePackage.id,
          name: servicePackage.name,
          speed: servicePackage.speed,
          monthly_rate: servicePackage.monthly_rate
        }
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
          service_package_id: data.service_package_id,
          assigned_at: new Date().toISOString(),
          is_active: false,
          notes: 'Initial service assignment'
        });

      if (assignmentError) {
        console.warn('Service assignment creation failed:', assignmentError);
      }

      toast({
        title: "Success",
        description: "Client registered successfully. Awaiting approval.",
      });

      form.reset();
      return newClient;

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
    form,
    onSubmit,
    isSubmitting,
  };
};
