
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { useTicketWorkflow } from '@/hooks/useTicketWorkflow';

interface TicketEscalationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  currentEscalationLevel: number;
}

const TicketEscalationDialog: React.FC<TicketEscalationDialogProps> = ({
  open,
  onOpenChange,
  ticketId,
  currentEscalationLevel,
}) => {
  const { escalateTicket } = useTicketWorkflow();
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationType, setEscalationType] = useState('');

  const handleEscalate = async () => {
    if (!escalationReason.trim() || !escalationType) return;

    escalateTicket(ticketId, escalationReason);
    onOpenChange(false);
    setEscalationReason('');
    setEscalationType('');
  };

  const escalationTypes = [
    { value: 'complexity', label: 'Technical Complexity' },
    { value: 'timeout', label: 'Response Timeout' },
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'resource_needed', label: 'Additional Resources Needed' },
    { value: 'management', label: 'Management Attention Required' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Escalate Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              Current escalation level: <strong>{currentEscalationLevel}</strong>
            </p>
            <p className="text-xs text-orange-600 mt-1">
              This will escalate to level {currentEscalationLevel + 1}
            </p>
          </div>

          <div>
            <Label htmlFor="escalation-type">Escalation Type</Label>
            <Select value={escalationType} onValueChange={setEscalationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select escalation reason" />
              </SelectTrigger>
              <SelectContent>
                {escalationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="escalation-reason">Detailed Reason</Label>
            <Textarea
              id="escalation-reason"
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="Provide detailed reason for escalation..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEscalate}
              disabled={!escalationReason.trim() || !escalationType}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Escalate Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketEscalationDialog;
