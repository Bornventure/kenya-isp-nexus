
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateHotspot, useUpdateHotspot, type Hotspot } from '@/hooks/useHotspots';

interface HotspotFormProps {
  hotspot?: Hotspot;
  onSuccess: () => void;
}

const HotspotForm: React.FC<HotspotFormProps> = ({ hotspot, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: 0,
    longitude: 0,
    status: 'active' as const,
    bandwidth_limit: 10,
    max_concurrent_users: 50,
    coverage_radius: 100,
    ssid: '',
    password: '',
    is_active: true,
  });

  const { mutate: createHotspot, isPending: isCreating } = useCreateHotspot();
  const { mutate: updateHotspot, isPending: isUpdating } = useUpdateHotspot();

  useEffect(() => {
    if (hotspot) {
      setFormData({
        name: hotspot.name,
        location: hotspot.location,
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
        status: hotspot.status,
        bandwidth_limit: hotspot.bandwidth_limit,
        max_concurrent_users: hotspot.max_concurrent_users,
        coverage_radius: hotspot.coverage_radius,
        ssid: hotspot.ssid,
        password: hotspot.password || '',
        is_active: hotspot.is_active,
      });
    }
  }, [hotspot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hotspot) {
      updateHotspot(
        { id: hotspot.id, updates: formData },
        { onSuccess }
      );
    } else {
      createHotspot(formData as any, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ssid">SSID *</Label>
          <Input
            id="ssid"
            value={formData.ssid}
            onChange={(e) => setFormData(prev => ({ ...prev, ssid: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Textarea
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bandwidth_limit">Bandwidth Limit (Mbps)</Label>
          <Input
            id="bandwidth_limit"
            type="number"
            value={formData.bandwidth_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, bandwidth_limit: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_concurrent_users">Max Users</Label>
          <Input
            id="max_concurrent_users"
            type="number"
            value={formData.max_concurrent_users}
            onChange={(e) => setFormData(prev => ({ ...prev, max_concurrent_users: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverage_radius">Coverage Radius (m)</Label>
          <Input
            id="coverage_radius"
            type="number"
            value={formData.coverage_radius}
            onChange={(e) => setFormData(prev => ({ ...prev, coverage_radius: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isCreating || isUpdating}>
          {(isCreating || isUpdating) ? 'Saving...' : hotspot ? 'Update Hotspot' : 'Create Hotspot'}
        </Button>
      </div>
    </form>
  );
};

export default HotspotForm;
