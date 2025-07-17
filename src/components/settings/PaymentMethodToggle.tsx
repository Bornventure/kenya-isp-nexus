
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
      const { data, error } = await supabase
        .from('payment_method_settings')
        .select('*')
        .eq('isp_company_id', profile?.isp_company_id);

      if (error) throw error;

      // Type assertion to ensure data matches our expected type
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
      const { error } = await supabase
        .from('payment_method_settings')
        .upsert({
          isp_company_id: profile?.isp_company_id,
          payment_method: methodId,
          is_enabled: enabled,
          disabled_reason: enabled ? null : reason,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state
      setSettings(prev => prev.map(setting => 
        setting.payment_method === methodId 
          ? { ...setting, is_enabled: enabled, disabled_reason: enabled ? null : reason }
          : setting
      ));

      toast({
        title: "Success",
        description: `${paymentMethods.find(m => m.id === methodId)?.name} payment method updated`,
      });
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
    
    // Return a default setting if none exists
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

  const handleToggle = async (enabled: boolean) => {
    setLocalEnabled(enabled);
    if (!enabled && !reason.trim()) {
      // Don't update yet, wait for reason
      return;
    }
    await onUpdate(method.id, enabled, enabled ? '' : reason);
  };

  const handleSaveWithReason = async () => {
    if (!localEnabled && reason.trim()) {
      await onUpdate(method.id, false, reason);
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

      {!localEnabled && (
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
    </div>
  );
};

export default PaymentMethodToggle;
