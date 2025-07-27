
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const InstallationFeeSettings: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [installationFee, setInstallationFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load current installation fee
  useEffect(() => {
    const loadInstallationFee = async () => {
      if (!profile?.isp_company_id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('installation_fee')
          .eq('isp_company_id', profile.isp_company_id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading installation fee:', error);
          throw error;
        }

        if (data) {
          setInstallationFee(data.installation_fee || 0);
        }
      } catch (error) {
        console.error('Error loading installation fee:', error);
        toast({
          title: "Error",
          description: "Failed to load installation fee settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInstallationFee();
  }, [profile?.isp_company_id, toast]);

  const handleSave = async () => {
    if (!profile?.isp_company_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          isp_company_id: profile.isp_company_id,
          installation_fee: installationFee,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving installation fee:', error);
        throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Installation fee has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving installation fee:', error);
      toast({
        title: "Error",
        description: "Failed to save installation fee settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Installation Fee Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="installation_fee">Installation Fee (KES)</Label>
            <Input
              id="installation_fee"
              type="number"
              value={installationFee}
              onChange={(e) => setInstallationFee(Number(e.target.value))}
              placeholder="Enter installation fee amount"
              min="0"
              step="1"
            />
            <p className="text-sm text-gray-500 mt-1">
              This fee will be automatically applied to all installation invoices
            </p>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How Installation Fees Work:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• This fee is charged once per new client installation</li>
            <li>• The fee is automatically added to installation invoices</li>
            <li>• VAT (16%) is automatically calculated and added</li>
            <li>• Installation must be completed before service activation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallationFeeSettings;
