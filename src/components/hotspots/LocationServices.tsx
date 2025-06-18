
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Store,
  Coffee,
  ShoppingBag,
  Car,
  Utensils,
  Star,
  Navigation,
  Clock,
  Phone
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BusinessPartner {
  id: string;
  name: string;
  category: string;
  distance: number;
  rating: number;
  address: string;
  phone?: string;
  website?: string;
  offer?: string;
  isPromoted: boolean;
  openingHours: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

interface LocationService {
  id: string;
  name: string;
  type: 'nearby_businesses' | 'directions' | 'promotions' | 'events';
  isEnabled: boolean;
  settings: Record<string, any>;
}

interface LocationServicesProps {
  selectedHotspot: string | null;
}

const LocationServices: React.FC<LocationServicesProps> = ({ selectedHotspot }) => {
  const [services, setServices] = useState<LocationService[]>([
    {
      id: 'nearby_businesses',
      name: 'Nearby Businesses',
      type: 'nearby_businesses',
      isEnabled: true,
      settings: { radius: 500, categories: ['restaurant', 'shop', 'cafe'] }
    },
    {
      id: 'directions',
      name: 'Turn-by-turn Directions',
      type: 'directions',
      isEnabled: true,
      settings: { provider: 'google_maps' }
    },
    {
      id: 'promotions',
      name: 'Location-based Promotions',
      type: 'promotions',
      isEnabled: true,
      settings: { autoShow: true, maxPerDay: 3 }
    },
    {
      id: 'events',
      name: 'Local Events',
      type: 'events',
      isEnabled: false,
      settings: { categories: ['entertainment', 'business', 'community'] }
    }
  ]);

  const { data: nearbyBusinesses, isLoading } = useQuery({
    queryKey: ['nearby-businesses', selectedHotspot],
    queryFn: async () => {
      // Mock data - in real implementation, fetch from location APIs
      const mockBusinesses: BusinessPartner[] = [
        {
          id: '1',
          name: 'Java House Coffee',
          category: 'Cafe',
          distance: 120,
          rating: 4.5,
          address: 'Tom Mboya Street, Nairobi',
          phone: '+254 701 234567',
          website: 'https://javahouse.co.ke',
          offer: '10% off with WiFi receipt',
          isPromoted: true,
          openingHours: {
            open: '06:00',
            close: '22:00',
            isOpen: true
          }
        },
        {
          id: '2',
          name: 'Nakumatt Lifestyle',
          category: 'Shopping',
          distance: 250,
          rating: 4.2,
          address: 'Kimathi Street, Nairobi',
          phone: '+254 701 345678',
          offer: 'Free parking for WiFi users',
          isPromoted: false,
          openingHours: {
            open: '08:00',
            close: '21:00',
            isOpen: true
          }
        },
        {
          id: '3',
          name: 'Carnivore Restaurant',
          category: 'Restaurant',
          distance: 450,
          rating: 4.7,
          address: 'Langata Road, Nairobi',
          phone: '+254 701 456789',
          website: 'https://carnivore.co.ke',
          offer: 'Complimentary appetizer',
          isPromoted: true,
          openingHours: {
            open: '12:00',
            close: '23:00',
            isOpen: true
          }
        },
        {
          id: '4',
          name: 'Shell Petrol Station',
          category: 'Fuel',
          distance: 180,
          rating: 4.0,
          address: 'Uhuru Highway, Nairobi',
          isPromoted: false,
          openingHours: {
            open: '24/7',
            close: '24/7',
            isOpen: true
          }
        }
      ];

      return mockBusinesses;
    },
  });

  const toggleService = (serviceId: string) => {
    setServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, isEnabled: !service.isEnabled }
          : service
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cafe': return <Coffee className="h-4 w-4" />;
      case 'restaurant': return <Utensils className="h-4 w-4" />;
      case 'shopping': return <ShoppingBag className="h-4 w-4" />;
      case 'fuel': return <Car className="h-4 w-4" />;
      default: return <Store className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Location-based Services</h3>
          <p className="text-sm text-muted-foreground">
            Provide contextual services and promotions based on user location
          </p>
        </div>
      </div>

      {/* Service Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Location Services Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.type === 'nearby_businesses' && 'Show nearby shops, restaurants, and services'}
                    {service.type === 'directions' && 'Provide GPS navigation and directions'}
                    {service.type === 'promotions' && 'Display location-specific offers and deals'}
                    {service.type === 'events' && 'Show local events and activities'}
                  </p>
                </div>
                <Switch
                  checked={service.isEnabled}
                  onCheckedChange={() => toggleService(service.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nearby Businesses */}
      {services.find(s => s.id === 'nearby_businesses')?.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nearby Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nearbyBusinesses?.map((business) => (
                <div key={business.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {getCategoryIcon(business.category)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{business.name}</h4>
                        {business.isPromoted && (
                          <Badge className="bg-orange-100 text-orange-800">Promoted</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{business.address}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{business.distance}m away</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{business.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className={business.openingHours.isOpen ? 'text-green-600' : 'text-red-600'}>
                            {business.openingHours.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>

                      {business.offer && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                          🎉 {business.offer}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {business.phone && (
                      <Button variant="outline" size="sm">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Navigation className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotion Settings */}
      {services.find(s => s.id === 'promotions')?.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Promotion Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Promotion Radius (meters)</label>
                  <Input
                    type="number"
                    defaultValue={500}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Promotions per User per Day</label>
                  <Input
                    type="number"
                    defaultValue={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-show Promotions</p>
                    <p className="text-xs text-muted-foreground">Automatically display promotions when users connect</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Collect User Preferences</p>
                    <p className="text-xs text-muted-foreground">Learn user preferences for better targeting</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Share Analytics with Partners</p>
                    <p className="text-xs text-muted-foreground">Provide anonymized analytics to business partners</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Location Services Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">847</p>
              <p className="text-sm text-muted-foreground">Business Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">234</p>
              <p className="text-sm text-muted-foreground">Directions Requested</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">67</p>
              <p className="text-sm text-muted-foreground">Promotions Claimed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">12.3%</p>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationServices;
