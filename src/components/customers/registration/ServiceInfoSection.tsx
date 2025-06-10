
import React from 'react';
import { Label } from '@/components/ui/label';
import { Wifi } from 'lucide-react';
import { CustomerFormData } from './formValidation';
import { connectionTypes } from './constants';

interface ServiceInfoSectionProps {
  formData: CustomerFormData;
  isSubmitting: boolean;
  updateFormData: (field: string, value: string) => void;
}

const ServiceInfoSection: React.FC<ServiceInfoSectionProps> = ({
  formData,
  isSubmitting,
  updateFormData
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Wifi className="h-5 w-5" />
        Service Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="connection_type">Connection Type</Label>
          <select
            id="connection_type"
            value={formData.connection_type}
            onChange={(e) => updateFormData('connection_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          >
            {connectionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoSection;
