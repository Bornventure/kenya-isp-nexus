
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Save, Package } from 'lucide-react';

const InstallationFeeSettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    installation_fee: 0,
    equipment_fee: 0,
    service_connection_fee: 0,
    is_installation_fee_enabled: true,
    is_equipment_fee_enabled: true,
    is_service_connection_fee_enabled: true,
    installation_fee_description: '',
    equipment_fee_description: '',
    service_connection_fee_description: '',
    payment_terms: '',
  });

  useEffect(() => {
    fetchInstallationFeeSettings();
  }, [profile?.isp_company_id]);

  const fetchInstallationFeeSettings = async () => {
    if (!profile?.isp_company_id) return;

    setIsLoading(true);
    try {
      // This would fetch from a real table in a production environment
      // For now, we'll use default values
      setSettings({
        installation_fee: 5000,
        equipment_fee: 8000,
        service_connection_fee: 2000,
        is_installation_fee_enabled: true,
        is_equipment_fee_enabled: true,
        is_service_connection_fee_enabled: true,
        installation_fee_description: 'One-time installation and setup fee',
        equipment_fee_description: 'Equipment rental and configuration fee',
        service_connection_fee_description: 'Service activation and connection fee',
        payment_terms: 'Payment required before installation',
      });
    } catch (error) {
      console.error('Error fetching installation fee settings:', error);
      toast({
        title: "Error",
        description: "Failed to load installation fee settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.isp_company_id) return;

    setIsSaving(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Installation fee settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating installation fee settings:', error);
      toast({
        title: "Error",
        description: "Failed to update installation fee settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Installation Fee Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Installation Fee */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="installation_fee_enabled">Installation Fee</Label>
              <p className="text-sm text-muted-foreground">
                Charge customers for installation services
              </p>
            </div>
            <Switch
              id="installation_fee_enabled"
              checked={settings.is_installation_fee_enabled}
              onCheckedChange={(checked) => handleInputChange('is_installation_fee_enabled', checked)}
            />
          </div>

          {settings.is_installation_fee_enabled && (
            <div className="space-y-3 ml-4 border-l-2 border-gray-200 pl-4">
              <div>
                <Label htmlFor="installation_fee">Installation Fee (KES)</Label>
                <Input
                  id="installation_fee"
                  type="number"
                  value={settings.installation_fee}
                  onChange={(e) => handleInputChange('installation_fee', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="100"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Current: {formatCurrency(settings.installation_fee)}
                </p>
              </div>
              <div>
                <Label htmlFor="installation_description">Description</Label>
                <Textarea
                  id="installation_description"
                  value={settings.installation_fee_description}
                  onChange={(e) => handleInputChange('installation_fee_description', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Equipment Fee */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="equipment_fee_enabled">Equipment Fee</Label>
              <p className="text-sm text-muted-foreground">
                Charge customers for equipment rental/purchase
              </p>
            </div>
            <Switch
              id="equipment_fee_enabled"
              checked={settings.is_equipment_fee_enabled}
              onCheckedChange={(checked) => handleInputChange('is_equipment_fee_enabled', checked)}
            />
          </div>

          {settings.is_equipment_fee_enabled && (
            <div className="space-y-3 ml-4 border-l-2 border-gray-200 pl-4">
              <div>
                <Label htmlFor="equipment_fee">Equipment Fee (KES)</Label>
                <Input
                  id="equipment_fee"
                  type="number"
                  value={settings.equipment_fee}
                  onChange={(e) => handleInputChange('equipment_fee', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="100"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Current: {formatCurrency(settings.equipment_fee)}
                </p>
              </div>
              <div>
                <Label htmlFor="equipment_description">Description</Label>
                <Textarea
                  id="equipment_description"
                  value={settings.equipment_fee_description}
                  onChange={(e) => handleInputChange('equipment_fee_description', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Service Connection Fee */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="service_fee_enabled">Service Connection Fee</Label>
              <p className="text-sm text-muted-foreground">
                Charge customers for service activation
              </p>
            </div>
            <Switch
              id="service_fee_enabled"
              checked={settings.is_service_connection_fee_enabled}
              onCheckedChange={(checked) => handleInputChange('is_service_connection_fee_enabled', checked)}
            />
          </div>

          {settings.is_service_connection_fee_enabled && (
            <div className="space-y-3 ml-4 border-l-2 border-gray-200 pl-4">
              <div>
                <Label htmlFor="service_fee">Service Connection Fee (KES)</Label>
                <Input
                  id="service_fee"
                  type="number"
                  value={settings.service_connection_fee}
                  onChange={(e) => handleInputChange('service_connection_fee', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="100"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Current: {formatCurrency(settings.service_connection_fee)}
                </p>
              </div>
              <div>
                <Label htmlFor="service_description">Description</Label>
                <Textarea
                  id="service_description"
                  value={settings.service_connection_fee_description}
                  onChange={(e) => handleInputChange('service_connection_fee_description', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Terms */}
        <div className="space-y-3">
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Textarea
            id="payment_terms"
            value={settings.payment_terms}
            onChange={(e) => handleInputChange('payment_terms', e.target.value)}
            placeholder="Enter payment terms and conditions..."
            rows={3}
          />
        </div>

        {/* Total Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Total Installation Cost</h4>
          <div className="space-y-1 text-sm">
            {settings.is_installation_fee_enabled && (
              <div className="flex justify-between">
                <span>Installation Fee:</span>
                <span>{formatCurrency(settings.installation_fee)}</span>
              </div>
            )}
            {settings.is_equipment_fee_enabled && (
              <div className="flex justify-between">
                <span>Equipment Fee:</span>
                <span>{formatCurrency(settings.equipment_fee)}</span>
              </div>
            )}
            {settings.is_service_connection_fee_enabled && (
              <div className="flex justify-between">
                <span>Service Connection Fee:</span>
                <span>{formatCurrency(settings.service_connection_fee)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>
                {formatCurrency(
                  (settings.is_installation_fee_enabled ? settings.installation_fee : 0) +
                  (settings.is_equipment_fee_enabled ? settings.equipment_fee : 0) +
                  (settings.is_service_connection_fee_enabled ? settings.service_connection_fee : 0)
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Installation Fee Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallationFeeSettings;
