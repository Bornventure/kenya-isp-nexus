
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { CustomerFormData } from './formValidation';
import { counties, kisumuSubCounties } from './constants';

interface LocationInfoSectionProps {
  formData: CustomerFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  updateFormData: (field: string, value: string) => void;
}

const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({
  formData,
  errors,
  isSubmitting,
  updateFormData
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Location Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className={errors.address ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
        </div>
        <div>
          <Label htmlFor="county">County</Label>
          <select
            id="county"
            value={formData.county}
            onChange={(e) => updateFormData('county', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          >
            {counties.map(county => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="sub_county">Sub-County *</Label>
          <select
            id="sub_county"
            value={formData.sub_county}
            onChange={(e) => updateFormData('sub_county', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md ${errors.sub_county ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          >
            <option value="">Select Sub-County</option>
            {kisumuSubCounties.map(subCounty => (
              <option key={subCounty} value={subCounty}>{subCounty}</option>
            ))}
          </select>
          {errors.sub_county && <p className="text-sm text-red-500 mt-1">{errors.sub_county}</p>}
        </div>
      </div>
    </div>
  );
};

export default LocationInfoSection;
