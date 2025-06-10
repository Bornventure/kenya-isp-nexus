
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerClient } from '@/services/customerPortalApi';
import { supabase } from '@/integrations/supabase/client';
import { X, Save, Loader2 } from 'lucide-react';
import { CustomerFormData, validateCustomerForm } from './registration/formValidation';
import PersonalInfoSection from './registration/PersonalInfoSection';
import LocationInfoSection from './registration/LocationInfoSection';
import ServiceInfoSection from './registration/ServiceInfoSection';
import FormHeader from './registration/FormHeader';

interface CustomerRegistrationFormProps {
  onClose: () => void;
  onSuccess?: (client: any) => void;
}

const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    mpesa_number: '',
    id_number: '',
    kra_pin_number: '',
    client_type: 'individual',
    connection_type: 'fiber',
    address: '',
    county: 'Kisumu',
    sub_county: '',
    service_package_id: '',
    isp_company_id: 'default-isp-company'
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
    
    const validationErrors = validateCustomerForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting customer registration form with data:', formData);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('No valid session found. Please log in first.');
      }

      const result = await registerClient(formData, sessionData.session.access_token);
      console.log('Registration successful:', result);
      
      toast({
        title: "Registration Successful",
        description: result.message || "Your application has been submitted successfully. You will receive login credentials via email.",
      });
      
      if (onSuccess) {
        onSuccess(result.client);
      }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Register for Internet Service</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <FormHeader />

          <form onSubmit={handleSubmit} className="space-y-6">
            <PersonalInfoSection 
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              updateFormData={updateFormData}
            />

            <LocationInfoSection 
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              updateFormData={updateFormData}
            />

            <ServiceInfoSection 
              formData={formData}
              isSubmitting={isSubmitting}
              updateFormData={updateFormData}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Registering...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegistrationForm;
