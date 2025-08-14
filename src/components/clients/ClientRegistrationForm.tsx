
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';
import { X, Save, Mail, Loader2 } from 'lucide-react';
import { useClientRegistrationForm } from './registration/useClientRegistrationForm';
import PersonalInfoSection from './registration/PersonalInfoSection';
import LocationInfoSection from './registration/LocationInfoSection';
import ServiceInfoSection from './registration/ServiceInfoSection';

interface ClientRegistrationFormProps {
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({ onClose, onSave }) => {
  const {
    formData,
    errors,
    isSubmitting,
    servicePackages,
    packagesLoading,
    updateFormData,
    handleSubmit,
  } = useClientRegistrationForm({ onClose, onSave });

  // Transform database format to component format for backward compatibility
  const transformedFormData = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    idNumber: formData.id_number,
    kraPinNumber: formData.kra_pin_number,
    mpesaNumber: formData.mpesa_number,
    address: formData.address,
    county: formData.county,
    subCounty: formData.sub_county,
    latitude: formData.latitude,
    longitude: formData.longitude,
    servicePackage: formData.service_package_id,
    monthlyRate: formData.monthly_rate,
    connectionType: formData.connection_type,
    clientType: formData.client_type,
    installationDate: formData.installation_date,
  };

  const transformedUpdateFormData = (field: string, value: any) => {
    // Transform component format back to database format
    const fieldMap: Record<string, string> = {
      idNumber: 'id_number',
      kraPinNumber: 'kra_pin_number',
      mpesaNumber: 'mpesa_number',
      subCounty: 'sub_county',
      servicePackage: 'service_package_id',
      monthlyRate: 'monthly_rate',
      connectionType: 'connection_type',
      clientType: 'client_type',
      installationDate: 'installation_date',
    };
    
    const dbField = fieldMap[field] || field;
    updateFormData(dbField, value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Register New Client</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Client Registration</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Fill out all required fields to register a new client in the system.
            </p>
          </div>

          {/* Show validation errors if any */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside text-sm text-red-600">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{String(message)}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <PersonalInfoSection
              formData={transformedFormData}
              errors={errors}
              isSubmitting={isSubmitting}
              updateFormData={transformedUpdateFormData}
            />

            <LocationInfoSection
              formData={transformedFormData}
              errors={errors}
              isSubmitting={isSubmitting}
              updateFormData={transformedUpdateFormData}
            />

            <ServiceInfoSection
              formData={transformedFormData}
              errors={errors}
              isSubmitting={isSubmitting}
              servicePackages={servicePackages}
              packagesLoading={packagesLoading}
              updateFormData={transformedUpdateFormData}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gap-2" 
                disabled={isSubmitting || packagesLoading}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Registering...' : 'Register Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRegistrationForm;
