
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatabaseClient } from '@/hooks/useClients';
import { X, Save, Loader2, MapPin } from 'lucide-react';
import { kisumuSubCounties, kisumuLocations } from '@/components/clients/registration/kisumuLocations';

interface ClientEditFormProps {
  client: DatabaseClient;
  onClose: () => void;
  onSave: (clientData: Partial<DatabaseClient>) => void;
}

const ClientEditForm: React.FC<ClientEditFormProps> = ({ client, onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email || '',
    phone: client.phone,
    address: client.address,
    sub_county: client.sub_county,
    location: '',
    latitude: client.latitude || '',
    longitude: client.longitude || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-populate coordinates when location is selected
    if (field === 'location' && value) {
      const selectedLocation = kisumuLocations[formData.sub_county]?.find(loc => loc.name === value);
      if (selectedLocation) {
        setFormData(prev => ({
          ...prev,
          latitude: selectedLocation.coordinates.lat.toString(),
          longitude: selectedLocation.coordinates.lng.toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const updates: Partial<DatabaseClient> = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone,
        address: formData.address,
        sub_county: formData.sub_county,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      onSave(updates);
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Edit Client</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="sub_county">Sub-County</Label>
                <select
                  id="sub_county"
                  value={formData.sub_county}
                  onChange={(e) => updateFormData('sub_county', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isSubmitting}
                >
                  {kisumuSubCounties.map(subCounty => (
                    <option key={subCounty} value={subCounty}>{subCounty}</option>
                  ))}
                </select>
              </div>

              {formData.sub_county && kisumuLocations[formData.sub_county] && (
                <div>
                  <Label htmlFor="location">Specific Location</Label>
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="">Select Location</option>
                    {kisumuLocations[formData.sub_county].map(location => (
                      <option key={location.name} value={location.name}>{location.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  className={errors.address ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                  rows={2}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => updateFormData('latitude', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g., -0.0917"
                />
              </div>

              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => updateFormData('longitude', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g., 34.7680"
                />
              </div>
            </div>

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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientEditForm;
