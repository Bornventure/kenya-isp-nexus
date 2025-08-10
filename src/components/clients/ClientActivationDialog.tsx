
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useFullAutomation } from '@/hooks/useFullAutomation';
import { Loader2, Zap, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
  onActivated?: () => void;
}

const ClientActivationDialog: React.FC<ClientActivationDialogProps> = ({
  open,
  onOpenChange,
  client,
  onActivated
}) => {
  const { profile } = useAuth();
  const { activateClientWithFullAutomation } = useFullAutomation();
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [activationNotes, setActivationNotes] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  // Fetch available equipment
  const { data: availableEquipment = [] } = useQuery({
    queryKey: ['available-equipment', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.isp_company_id && open,
  });

  const handleActivation = async () => {
    if (!selectedEquipment || !profile?.id) return;

    setIsActivating(true);
    
    try {
      const result = await activateClientWithFullAutomation({
        clientId: client.id,
        equipmentId: selectedEquipment,
        approvedBy: profile.id,
        activationNotes
      });

      if (result.success) {
        onActivated?.();
        onOpenChange(false);
        setSelectedEquipment('');
        setActivationNotes('');
      }
    } catch (error) {
      console.error('Activation failed:', error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Activate Client with Full Automation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-1">Full Automation Includes:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>RADIUS user creation</li>
                  <li>MikroTik QoS configuration</li>
                  <li>Service activation & monitoring</li>
                  <li>Automated renewal notifications</li>
                  <li>Network connection management</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="equipment">Assign Equipment *</Label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment to assign" />
                </SelectTrigger>
                <SelectContent>
                  {availableEquipment.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.brand} {item.model} - {item.serial_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Activation Notes</Label>
              <Textarea
                id="notes"
                value={activationNotes}
                onChange={(e) => setActivationNotes(e.target.value)}
                placeholder="Enter any activation notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleActivation}
              disabled={!selectedEquipment || isActivating}
              className="gap-2"
            >
              {isActivating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isActivating ? 'Activating...' : 'Activate with Full Automation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientActivationDialog;
