
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
              <span className="font-medium">Account Creation</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              A user account will be automatically created and login credentials will be sent to the client's email address.
            </p>
          </div>

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
              errors={errors}
              isSubmitting={isSubmitting}
              servicePackages={servicePackages}
              packagesLoading={packagesLoading}
              updateFormData={updateFormData}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isSubmitting || packagesLoading}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Creating Account...' : 'Register Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRegistrationForm;
