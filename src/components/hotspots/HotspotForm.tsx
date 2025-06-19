
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateHotspot } from '@/hooks/useHotspots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const hotspotSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  ssid: z.string().min(1, 'SSID is required'),
  password: z.string().optional(),
  bandwidth_limit: z.number().min(1, 'Bandwidth limit must be at least 1 Mbps'),
  max_concurrent_users: z.number().min(1, 'Must allow at least 1 user'),
  coverage_radius: z.number().min(1, 'Coverage radius must be at least 1 meter'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: z.enum(['active', 'inactive', 'maintenance']),
});

type HotspotFormData = z.infer<typeof hotspotSchema>;

interface HotspotFormProps {
  onSuccess?: () => void;
}

const HotspotForm: React.FC<HotspotFormProps> = ({ onSuccess }) => {
  const createHotspot = useCreateHotspot();

  const form = useForm<HotspotFormData>({
    resolver: zodResolver(hotspotSchema),
    defaultValues: {
      name: '',
      location: '',
      ssid: '',
      password: '',
      bandwidth_limit: 10,
      max_concurrent_users: 50,
      coverage_radius: 100,
      latitude: 0,
      longitude: 0,
      status: 'active',
    },
  });

  const onSubmit = async (data: HotspotFormData) => {
    try {
      await createHotspot.mutateAsync({
        ...data,
        is_active: data.status === 'active',
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating hotspot:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Hotspot</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotspot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter hotspot name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ssid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SSID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter WiFi network name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter WiFi password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bandwidth_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bandwidth Limit (Mbps)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_concurrent_users"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Concurrent Users</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="50" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverage_radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coverage Radius (meters)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="0.0" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="0.0" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createHotspot.isPending}
            >
              {createHotspot.isPending ? 'Creating...' : 'Create Hotspot'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HotspotForm;
