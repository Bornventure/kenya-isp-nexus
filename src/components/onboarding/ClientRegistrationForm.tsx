
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useServicePackages } from '@/hooks/useServicePackages';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation } from 'lucide-react';
import { KENYAN_COUNTIES } from '@/utils/kenyanValidation';

interface ClientRegistrationFormData {
  name: string;
  email: string;
  phone: string;
  id_number: string;
  kra_pin_number?: string;
  address: string;
  county: string;
  sub_county: string;
  latitude?: number;
  longitude?: number;
  client_type: 'individual' | 'business';
  connection_type: 'fiber' | 'wireless' | 'satellite';
  service_package_id: string;
  monthly_rate: number;
  notes?: string;
}

const ClientRegistrationForm = () => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ClientRegistrationFormData>();
  const { createClient } = useClients();
  const { servicePackages } = useServicePackages();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const watchedPackageId = watch('service_package_id');
  const selectedPackage = servicePackages.find(pkg => pkg.id === watchedPackageId);

  // Update monthly rate when package changes
  React.useEffect(() => {
    if (selectedPackage) {
      setValue('monthly_rate', selectedPackage.monthly_rate);
    }
  }, [selectedPackage, setValue]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setValue('latitude', latitude);
          setValue('longitude', longitude);
          toast({
            title: "Location Captured",
            description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Unable to get current location. Please enter coordinates manually.",
            variant: "destructive",
          });
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setIsGettingLocation(false);
    }
  };

  const onSubmit = async (data: ClientRegistrationFormData) => {
    setIsSubmitting(true);
    
    try {
      // Ensure coordinates are saved
      const clientData = {
        ...data,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      };

      console.log('Submitting client with coordinates:', {
        latitude: clientData.latitude,
        longitude: clientData.longitude
      });

      await createClient(clientData);
      
      toast({
        title: "Client Registered",
        description: "Client has been registered successfully and is pending approval.",
      });
      
      reset();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubCounties = (county: string) => {
    const countyData = KENYAN_COUNTIES.find(c => c.name === county);
    return countyData?.subCounties || [];
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Client Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^(\+254|0)[17]\d{8}$/,
                      message: 'Please enter a valid Kenyan phone number'
                    }
                  })}
                  placeholder="0712345678 or +254712345678"
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <Label htmlFor="id_number">ID Number *</Label>
                <Input
                  {...register('id_number', { 
                    required: 'ID number is required',
                    pattern: {
                      value: /^\d{7,8}$/,
                      message: 'Please enter a valid ID number (7-8 digits)'
                    }
                  })}
                  placeholder="12345678"
                />
                {errors.id_number && <p className="text-sm text-red-600">{errors.id_number.message}</p>}
              </div>

              <div>
                <Label htmlFor="kra_pin_number">KRA PIN</Label>
                <Input
                  {...register('kra_pin_number')}
                  placeholder="A001234567Z (optional)"
                />
              </div>

              <div>
                <Label htmlFor="client_type">Client Type *</Label>
                <Select onValueChange={(value) => setValue('client_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Physical Address *</Label>
                <Textarea
                  {...register('address', { required: 'Address is required' })}
                  placeholder="Enter complete physical address"
                  rows={3}
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
              </div>

              <div>
                <Label htmlFor="county">County *</Label>
                <Select onValueChange={(value) => {
                  setValue('county', value);
                  setValue('sub_county', ''); // Reset sub-county when county changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {KENYAN_COUNTIES.map((county) => (
                      <SelectItem key={county.name} value={county.name}>
                        {county.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sub_county">Sub County *</Label>
                <Select onValueChange={(value) => setValue('sub_county', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub county" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubCounties(watch('county')).map((subCounty) => (
                      <SelectItem key={subCounty} value={subCounty}>
                        {subCounty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* GPS Coordinates */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  <Label>GPS Coordinates (Optional but Recommended)</Label>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      step="any"
                      {...register('latitude', { valueAsNumber: true })}
                      placeholder="Latitude (e.g., -1.2921)"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      step="any"
                      {...register('longitude', { valueAsNumber: true })}
                      placeholder="Longitude (e.g., 36.8219)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="shrink-0"
                  >
                    <Navigation className={`h-4 w-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                    {isGettingLocation ? 'Getting...' : 'Get Location'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click "Get Location" to automatically capture your current coordinates
                </p>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="connection_type">Connection Type *</Label>
                <Select onValueChange={(value) => setValue('connection_type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiber">Fiber</SelectItem>
                    <SelectItem value="wireless">Wireless</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service_package_id">Service Package *</Label>
                <Select onValueChange={(value) => setValue('service_package_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service package" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.speed} (KES {pkg.monthly_rate}/month)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPackage && (
                <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium">Selected Package Details:</h4>
                  <p><strong>Package:</strong> {selectedPackage.name}</p>
                  <p><strong>Speed:</strong> {selectedPackage.speed}</p>
                  <p><strong>Monthly Rate:</strong> KES {selectedPackage.monthly_rate}</p>
                  <p><strong>Setup Fee:</strong> KES {selectedPackage.setup_fee}</p>
                  {selectedPackage.description && <p><strong>Description:</strong> {selectedPackage.description}</p>}
                </div>
              )}

              <div className="md:col-span-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  {...register('notes')}
                  placeholder="Any additional information or special requirements"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Client'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientRegistrationForm;
