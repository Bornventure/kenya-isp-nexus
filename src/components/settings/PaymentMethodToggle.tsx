
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Smartphone, 
  Building2, 
  Save, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface PaymentMethodSetting {
  id: string;
  payment_method: string;
  is_enabled: boolean;
  disabled_reason?: string | null;
}

const PaymentMethodToggle: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PaymentMethodSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, color: 'text-green-600' },
    { id: 'family_bank', name: 'Family Bank', icon: Building2, color: 'text-purple-600' },
  ];

  useEffect(() => {
    if (profile?.isp_company_id) {
      fetchPaymentSettings();
    }
  }, [profile?.isp_company_id]);

  const fetchPaymentSettings = async () => {
    try {
      console.log('Fetching payment settings for company:', profile?.isp_company_id);
      const { data, error } = await supabase
        .from('payment_method_settings')
        .select('*')
        .eq('isp_company_id', profile?.isp_company_id);

      if (error) {
        console.error('Error fetching payment settings:', error);
        throw error;
      }

      console.log('Payment settings fetched:', data);
      setSettings(data as PaymentMethodSetting[] || []);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast({
        title: "Error",
        description: "Failed to load payment method settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (methodId: string, enabled: boolean, reason?: string) => {
    setSaving(true);
    try {
      console.log('Updating payment method:', methodId, { enabled, reason });
      
      const { data: existingData, error: selectError } = await supabase
        .from('payment_method_settings')
        .select('id')
        .eq('isp_company_id', profile?.isp_company_id)
        .eq('payment_method', methodId)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      let result;
      if (existingData) {
        result = await supabase
          .from('payment_method_settings')
          .update({
            is_enabled: enabled,
            disabled_reason: enabled ? null : reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id);
      } else {
        result = await supabase
          .from('payment_method_settings')
          .insert({
            isp_company_id: profile?.isp_company_id,
            payment_method: methodId,
            is_enabled: enabled,
            disabled_reason: enabled ? null : reason,
          });
      }

      if (result.error) {
        if (result.error.code === '23505') {
          console.log('Record already exists, attempting update instead');
          const updateResult = await supabase
            .from('payment_method_settings')
            .update({
              is_enabled: enabled,
              disabled_reason: enabled ? null : reason,
              updated_at: new Date().toISOString(),
            })
            .eq('isp_company_id', profile?.isp_company_id)
            .eq('payment_method', methodId);

          if (updateResult.error) throw updateResult.error;
        } else {
          throw result.error;
        }
      }

      // Update local state
      setSettings(prev => {
        const existingSetting = prev.find(s => s.payment_method === methodId);
        if (existingSetting) {
          return prev.map(setting => 
            setting.payment_method === methodId 
              ? { ...setting, is_enabled: enabled, disabled_reason: enabled ? null : reason }
              : setting
          );
        } else {
          return [...prev, {
            id: '',
            payment_method: methodId,
            is_enabled: enabled,
            disabled_reason: enabled ? null : reason
          }];
        }
      });

      console.log('Payment method updated successfully');
      toast({
        title: "Success",
        description: `${paymentMethods.find(m => m.id === methodId)?.name} payment method updated`,
      });

      // Refresh the settings to ensure we have the latest state
      await fetchPaymentSettings();
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update payment method settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSetting = (methodId: string): PaymentMethodSetting => {
    const setting = settings.find(s => s.payment_method === methodId);
    if (setting) return setting;
    
    return { 
      id: '', 
      payment_method: methodId, 
      is_enabled: true, 
      disabled_reason: '' 
    };
  };

  if (loading) {
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
          <CheckCircle className="h-5 w-5 text-green-600" />
          Payment Method Controls
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enable or disable payment methods for your customers
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {paymentMethods.map((method) => {
          const setting = getSetting(method.id);
          return (
            <PaymentMethodCard
              key={method.id}
              method={method}
              setting={setting}
              onUpdate={updatePaymentMethod}
              saving={saving}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

interface PaymentMethodCardProps {
  method: { id: string; name: string; icon: any; color: string };
  setting: PaymentMethodSetting;
  onUpdate: (methodId: string, enabled: boolean, reason?: string) => Promise<void>;
  saving: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ 
  method, 
  setting, 
  onUpdate, 
  saving 
}) => {
  const [localEnabled, setLocalEnabled] = useState(setting.is_enabled);
  const [reason, setReason] = useState(setting.disabled_reason || '');
  const [showReasonInput, setShowReasonInput] = useState(!setting.is_enabled);

  useEffect(() => {
    setLocalEnabled(setting.is_enabled);
    setReason(setting.disabled_reason || '');
    setShowReasonInput(!setting.is_enabled);
  }, [setting]);

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      // When enabling, immediately update and close reason input
      setLocalEnabled(true);
      setShowReasonInput(false);
      setReason('');
      await onUpdate(method.id, true, '');
    } else {
      // When disabling, show reason input
      setLocalEnabled(false);
      setShowReasonInput(true);
    }
  };

  const handleSaveWithReason = async () => {
    if (!localEnabled && reason.trim()) {
      await onUpdate(method.id, false, reason);
      setShowReasonInput(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <method.icon className={`h-6 w-6 ${method.color}`} />
          <div>
            <h3 className="font-medium">{method.name}</h3>
            <p className="text-sm text-muted-foreground">
              {method.id === 'mpesa' ? 'Mobile money payments' : 'Bank transfer payments'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={localEnabled ? 'default' : 'secondary'}>
            {localEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
          <Switch
            checked={localEnabled}
            onCheckedChange={handleToggle}
            disabled={saving}
          />
        </div>
      </div>

      {showReasonInput && !localEnabled && (
        <div className="space-y-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-700">
            <AlertCircle className="h-4 w-4" />
            <Label htmlFor={`reason-${method.id}`} className="text-sm font-medium">
              Reason for disabling (shown to customers)
            </Label>
          </div>
          <Textarea
            id={`reason-${method.id}`}
            placeholder="e.g., Temporary maintenance, System upgrade in progress..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[60px]"
          />
          {reason.trim() && (
            <Button
              size="sm"
              onClick={handleSaveWithReason}
              disabled={saving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Disabled State
            </Button>
          )}
        </div>
      )}

      {!localEnabled && setting.disabled_reason && !showReasonInput && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-700 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Currently Disabled</span>
          </div>
          <p className="text-sm text-orange-600">{setting.disabled_reason}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodToggle;
