
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface LocationInfoSectionProps {
  formData: any;
  errors: Record<string, string>;
  isSubmitting: boolean;
  updateFormData: (field: string, value: any) => void;
}

const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({
  formData,
  errors,
  isSubmitting,
  updateFormData,
}) => {
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateFormData('latitude', position.coords.latitude);
          updateFormData('longitude', position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Location Information</h3>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          disabled={isSubmitting}
          required
          placeholder="Enter full address"
        />
        {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="county">County *</Label>
          <Input
            id="county"
            value={formData.county}
            onChange={(e) => updateFormData('county', e.target.value)}
            disabled={isSubmitting}
            required
          />
          {errors.county && <p className="text-sm text-red-600">{errors.county}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sub_county">Sub County *</Label>
          <Input
            id="sub_county"
            value={formData.sub_county}
            onChange={(e) => updateFormData('sub_county', e.target.value)}
            disabled={isSubmitting}
            required
          />
          {errors.sub_county && <p className="text-sm text-red-600">{errors.sub_county}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>GPS Coordinates (Optional)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isSubmitting}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Get Current Location
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude || ''}
              onChange={(e) => updateFormData('latitude', parseFloat(e.target.value) || null)}
              disabled={isSubmitting}
              placeholder="e.g., -0.0917"
            />
            {errors.latitude && <p className="text-sm text-red-600">{errors.latitude}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude || ''}
              onChange={(e) => updateFormData('longitude', parseFloat(e.target.value) || null)}
              disabled={isSubmitting}
              placeholder="e.g., 34.7680"
            />
            {errors.longitude && <p className="text-sm text-red-600">{errors.longitude}</p>}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          GPS coordinates help show the client's location on the network map. Click "Get Current Location" to automatically fill these fields.
        </p>
      </div>
    </div>
  );
};

export default LocationInfoSection;
