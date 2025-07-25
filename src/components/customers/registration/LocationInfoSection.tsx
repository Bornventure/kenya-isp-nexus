
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { CustomerFormData } from './formValidation';
import { counties, kisumuSubCounties, kisumuLocations } from './constants';

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
  const handleLocationSelect = (locationName: string) => {
    updateFormData('location', locationName);
    
    // Auto-populate coordinates
    const selectedLocation = kisumuLocations[formData.sub_county]?.find(loc => loc.name === locationName);
    if (selectedLocation) {
      updateFormData('latitude', selectedLocation.coordinates.lat.toString());
      updateFormData('longitude', selectedLocation.coordinates.lng.toString());
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Location Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {formData.sub_county && kisumuLocations[formData.sub_county] && (
          <div>
            <Label htmlFor="location">Specific Location *</Label>
            <select
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleLocationSelect(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${errors.location ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">Select Location</option>
              {kisumuLocations[formData.sub_county].map(location => (
                <option key={location.name} value={location.name}>{location.name}</option>
              ))}
            </select>
            {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
          </div>
        )}

        <div className="md:col-span-2">
          <Label htmlFor="address">Detailed Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className={errors.address ? 'border-red-500' : ''}
            disabled={isSubmitting}
            placeholder="Building name, street, landmarks..."
          />
          {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
        </div>

        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude || ''}
            onChange={(e) => updateFormData('latitude', e.target.value)}
            disabled={isSubmitting}
            placeholder="Auto-filled when location selected"
          />
        </div>

        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude || ''}
            onChange={(e) => updateFormData('longitude', e.target.value)}
            disabled={isSubmitting}
            placeholder="Auto-filled when location selected"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationInfoSection;
