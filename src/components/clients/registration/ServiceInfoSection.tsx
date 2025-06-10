
import React from 'react';
import { Label } from '@/components/ui/label';
import { Wifi } from 'lucide-react';
import { FormData } from './formValidation';
import { connectionTypes } from './formConstants';
import { ServicePackage } from '@/hooks/useServicePackages';

interface ServiceInfoSectionProps {
  formData: FormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  servicePackages: ServicePackage[];
  packagesLoading: boolean;
  updateFormData: (field: string, value: string) => void;
}

const ServiceInfoSection: React.FC<ServiceInfoSectionProps> = ({
  formData,
  errors,
  isSubmitting,
  servicePackages,
  packagesLoading,
  updateFormData,
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Wifi className="h-5 w-5" />
        Service Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="connectionType">Connection Type</Label>
          <select
            id="connectionType"
            value={formData.connectionType}
            onChange={(e) => updateFormData('connectionType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          >
            {connectionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="servicePackage">Service Package *</Label>
          <select
            id="servicePackage"
            value={formData.servicePackage}
            onChange={(e) => updateFormData('servicePackage', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md ${errors.servicePackage ? 'border-red-500' : ''}`}
            disabled={isSubmitting || packagesLoading}
          >
            <option value="">
              {packagesLoading ? 'Loading packages...' : 'Select Package'}
            </option>
            {servicePackages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} - {pkg.speed} (KES {pkg.monthly_rate.toLocaleString()}/month)
              </option>
            ))}
          </select>
          {errors.servicePackage && <p className="text-sm text-red-500 mt-1">{errors.servicePackage}</p>}
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoSection;
