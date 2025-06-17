
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHotspotMutations } from '@/hooks/useHotspots';

interface HotspotFormProps {
  onClose: () => void;
  onSuccess: () => void;
  hotspot?: any; // For editing existing hotspots
}

const HotspotForm: React.FC<HotspotFormProps> = ({ onClose, onSuccess, hotspot }) => {
  const { createHotspot, updateHotspot } = useHotspotMutations();
  const isEditing = !!hotspot;

  const [formData, setFormData] = useState({
    name: hotspot?.name || '',
    location: hotspot?.location || '',
    latitude: hotspot?.latitude?.toString() || '',
    longitude: hotspot?.longitude?.toString() || '',
    status: hotspot?.status || 'active',
    ssid: hotspot?.ssid || '',
    password: hotspot?.password || '',
    bandwidth_limit: hotspot?.bandwidth_limit?.toString() || '10',
    max_concurrent_users: hotspot?.max_concurrent_users?.toString() || '50',
    coverage_radius: hotspot?.coverage_radius?.toString() || '100',
    ip_address: hotspot?.ip_address || '',
    mac_address: hotspot?.mac_address || '',
    installation_date: hotspot?.installation_date || '',
    hardware_details: hotspot?.hardware_details ? JSON.stringify(hotspot.hardware_details, null, 2) : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.ssid.trim()) newErrors.ssid = 'SSID is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';

    // Validate numeric fields
    if (formData.bandwidth_limit && isNaN(Number(formData.bandwidth_limit))) {
      newErrors.bandwidth_limit = 'Must be a valid number';
    }
    if (formData.max_concurrent_users && isNaN(Number(formData.max_concurrent_users))) {
      newErrors.max_concurrent_users = 'Must be a valid number';
    }
    if (formData.coverage_radius && isNaN(Number(formData.coverage_radius))) {
      newErrors.coverage_radius = 'Must be a valid number';
    }

    // Validate coordinates if provided
    if (formData.latitude && (isNaN(Number(formData.latitude)) || Math.abs(Number(formData.latitude)) > 90)) {
      newErrors.latitude = 'Must be a valid latitude (-90 to 90)';
    }
    if (formData.longitude && (isNaN(Number(formData.longitude)) || Math.abs(Number(formData.longitude)) > 180)) {
      newErrors.longitude = 'Must be a valid longitude (-180 to 180)';
    }

    // Validate MAC address format if provided
    if (formData.mac_address && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.mac_address)) {
      newErrors.mac_address = 'Invalid MAC address format (e.g., 00:11:22:33:44:55)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let hardwareDetails = null;
      if (formData.hardware_details.trim()) {
        try {
          hardwareDetails = JSON.parse(formData.hardware_details);
        } catch {
          setErrors({ hardware_details: 'Invalid JSON format' });
          return;
        }
      }

      const submitData = {
        name: formData.name,
        location: formData.location,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        status: formData.status,
        ssid: formData.ssid,
        password: formData.password,
        bandwidth_limit: Number(formData.bandwidth_limit),
        max_concurrent_users: Number(formData.max_concurrent_users),
        coverage_radius: Number(formData.coverage_radius),
        ip_address: formData.ip_address || null,
        mac_address: formData.mac_address || null,
        installation_date: formData.installation_date || null,
        hardware_details: hardwareDetails,
      };

      if (isEditing) {
        await updateHotspot.mutateAsync({ id: hotspot.id, updates: submitData });
      } else {
        await createHotspot.mutateAsync(submitData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving hotspot:', error);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isSubmitting = createHotspot.isPending || updateHotspot.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Hotspot' : 'Create New Hotspot'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Hotspot Name *</Label>
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
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
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
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateFormData('location', e.target.value)}
              className={errors.location ? 'border-red-500' : ''}
              disabled={isSubmitting}
              placeholder="e.g., Kisumu Central Business District"
            />
            {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => updateFormData('latitude', e.target.value)}
                className={errors.latitude ? 'border-red-500' : ''}
                disabled={isSubmitting}
                placeholder="-0.0917"
              />
              {errors.latitude && <p className="text-sm text-red-500 mt-1">{errors.latitude}</p>}
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => updateFormData('longitude', e.target.value)}
                className={errors.longitude ? 'border-red-500' : ''}
                disabled={isSubmitting}
                placeholder="34.7680"
              />
              {errors.longitude && <p className="text-sm text-red-500 mt-1">{errors.longitude}</p>}
            </div>
          </div>

          {/* Network Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ssid">SSID *</Label>
              <Input
                id="ssid"
                value={formData.ssid}
                onChange={(e) => updateFormData('ssid', e.target.value)}
                className={errors.ssid ? 'border-red-500' : ''}
                disabled={isSubmitting}
                placeholder="MyHotspot_WiFi"
              />
              {errors.ssid && <p className="text-sm text-red-500 mt-1">{errors.ssid}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bandwidth_limit">Bandwidth Limit (Mbps)</Label>
              <Input
                id="bandwidth_limit"
                type="number"
                value={formData.bandwidth_limit}
                onChange={(e) => updateFormData('bandwidth_limit', e.target.value)}
                className={errors.bandwidth_limit ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.bandwidth_limit && <p className="text-sm text-red-500 mt-1">{errors.bandwidth_limit}</p>}
            </div>

            <div>
              <Label htmlFor="max_concurrent_users">Max Users</Label>
              <Input
                id="max_concurrent_users"
                type="number"
                value={formData.max_concurrent_users}
                onChange={(e) => updateFormData('max_concurrent_users', e.target.value)}
                className={errors.max_concurrent_users ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.max_concurrent_users && <p className="text-sm text-red-500 mt-1">{errors.max_concurrent_users}</p>}
            </div>

            <div>
              <Label htmlFor="coverage_radius">Coverage Radius (m)</Label>
              <Input
                id="coverage_radius"
                type="number"
                value={formData.coverage_radius}
                onChange={(e) => updateFormData('coverage_radius', e.target.value)}
                className={errors.coverage_radius ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.coverage_radius && <p className="text-sm text-red-500 mt-1">{errors.coverage_radius}</p>}
            </div>
          </div>

          {/* Network Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ip_address">IP Address</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => updateFormData('ip_address', e.target.value)}
                disabled={isSubmitting}
                placeholder="192.168.1.1"
              />
            </div>

            <div>
              <Label htmlFor="mac_address">MAC Address</Label>
              <Input
                id="mac_address"
                value={formData.mac_address}
                onChange={(e) => updateFormData('mac_address', e.target.value)}
                className={errors.mac_address ? 'border-red-500' : ''}
                disabled={isSubmitting}
                placeholder="00:11:22:33:44:55"
              />
              {errors.mac_address && <p className="text-sm text-red-500 mt-1">{errors.mac_address}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="installation_date">Installation Date</Label>
            <Input
              id="installation_date"
              type="date"
              value={formData.installation_date}
              onChange={(e) => updateFormData('installation_date', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="hardware_details">Hardware Details (JSON)</Label>
            <Textarea
              id="hardware_details"
              value={formData.hardware_details}
              onChange={(e) => updateFormData('hardware_details', e.target.value)}
              className={errors.hardware_details ? 'border-red-500' : ''}
              disabled={isSubmitting}
              placeholder='{"router": "TP-Link AC1200", "antenna": "Omni 15dBi"}'
              rows={3}
            />
            {errors.hardware_details && <p className="text-sm text-red-500 mt-1">{errors.hardware_details}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Hotspot' : 'Create Hotspot')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HotspotForm;
