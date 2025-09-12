import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Shield, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FamilyBankConfig {
  id?: string;
  merchant_code: string;
  paybill_number: string;
  client_id: string;
  client_secret: string;
  token_url: string;
  stk_url: string;
  is_active: boolean;
}

export const FamilyBankSettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState<FamilyBankConfig>({
    merchant_code: '026026',
    paybill_number: '026026',
    client_id: '',
    client_secret: '',
    token_url: 'https://openbank.familybank.co.ke:8083/connect/token',
    stk_url: 'https://openbank.familybank.co.ke:8084/api/v1/Mpesa/stkpush',
    is_active: false,
  });

  // Fetch existing settings
  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ['family-bank-admin-settings', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return null;

      const { data, error } = await supabase
        .from('family_bank_settings')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!profile?.isp_company_id,
  });

  // Update local state when data is loaded
  useEffect(() => {
    if (existingSettings) {
      setConfig({
        id: existingSettings.id,
        merchant_code: existingSettings.merchant_code || '026026',
        paybill_number: existingSettings.paybill_number || '026026',
        client_id: existingSettings.client_id || '',
        client_secret: existingSettings.client_secret || '',
        token_url: existingSettings.token_url || 'https://openbank.familybank.co.ke:8083/connect/token',
        stk_url: existingSettings.stk_url || 'https://openbank.familybank.co.ke:8084/api/v1/Mpesa/stkpush',
        is_active: existingSettings.is_active || false,
      });
    }
  }, [existingSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: FamilyBankConfig) => {
      if (!profile?.isp_company_id) {
        throw new Error('No company ID found');
      }

      const payload = {
        isp_company_id: profile.isp_company_id,
        merchant_code: settingsData.merchant_code,
        paybill_number: settingsData.paybill_number,
        client_id: settingsData.client_id,
        client_secret: settingsData.client_secret,
        token_url: settingsData.token_url,
        stk_url: settingsData.stk_url,
        is_active: settingsData.is_active,
      };

      if (settingsData.id) {
        // Update existing
        const { data, error } = await supabase
          .from('family_bank_settings')
          .update(payload)
          .eq('id', settingsData.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('family_bank_settings')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      setConfig(prev => ({ ...prev, id: data.id }));
      queryClient.invalidateQueries({ queryKey: ['family-bank-admin-settings'] });
      toast({
        title: "Settings Saved",
        description: "Family Bank settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error saving Family Bank settings:', error);
      toast({
        title: "Error",
        description: "Failed to save Family Bank settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!config.client_id || !config.client_secret) {
      toast({
        title: "Missing Information",
        description: "Please provide both Client ID and Client Secret.",
        variant: "destructive",
      });
      return;
    }

    saveSettingsMutation.mutate(config);
  };

  const handleInputChange = (field: keyof FamilyBankConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-purple-600" />
            Family Bank Configuration
            {config.is_active ? (
              <Badge className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant_code">Business Short Code</Label>
              <Input
                id="merchant_code"
                value={config.merchant_code}
                onChange={(e) => handleInputChange('merchant_code', e.target.value)}
                placeholder="026026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paybill_number">Paybill Number</Label>
              <Input
                id="paybill_number"
                value={config.paybill_number}
                onChange={(e) => handleInputChange('paybill_number', e.target.value)}
                placeholder="026026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                value={config.client_id}
                onChange={(e) => handleInputChange('client_id', e.target.value)}
                placeholder="Your Family Bank Client ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_secret">Client Secret</Label>
              <Input
                id="client_secret"
                type="password"
                value={config.client_secret}
                onChange={(e) => handleInputChange('client_secret', e.target.value)}
                placeholder="Your Family Bank Client Secret"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token_url">Token URL</Label>
              <Input
                id="token_url"
                value={config.token_url}
                onChange={(e) => handleInputChange('token_url', e.target.value)}
                placeholder="https://openbank.familybank.co.ke:8083/connect/token"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stk_url">STK Push URL</Label>
              <Input
                id="stk_url"
                value={config.stk_url}
                onChange={(e) => handleInputChange('stk_url', e.target.value)}
                placeholder="https://openbank.familybank.co.ke:8084/api/v1/Mpesa/stkpush"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={config.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Enable Family Bank Payments</Label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saveSettingsMutation.isPending}
              className="flex items-center gap-2"
            >
              {saveSettingsMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-yellow-800 dark:text-yellow-200 text-sm">
            <p className="font-medium mb-1">Important Configuration Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure you have received valid credentials from Family Bank</li>
              <li>The callback URL configured with Family Bank should be: <code>https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/family-bank-stk-callback</code></li>
              <li>For C2B paybill notifications: <code>https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/family-bank-c2b-callback</code></li>
              <li>Test the integration after saving settings to ensure everything works correctly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};