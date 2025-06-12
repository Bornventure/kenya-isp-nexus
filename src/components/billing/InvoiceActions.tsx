
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Eye, 
  Send, 
  CreditCard, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Invoice } from '@/hooks/useInvoices';
import { Badge } from '@/components/ui/badge';

interface InvoiceActionsProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
  onMarkPaid: (invoice: Invoice) => void;
  onInitiatePayment: (invoice: Invoice) => void;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice,
  onView,
  onDownload,
  onSendEmail,
  onMarkPaid,
  onInitiatePayment,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'overdue': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={getStatusColor(invoice.status)}>
        {getStatusIcon(invoice.status)}
        <span className="ml-1">{invoice.status}</span>
      </Badge>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(invoice)}
          title="View Invoice"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDownload(invoice)}
          title="Download PDF"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        {invoice.status !== 'paid' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSendEmail(invoice)}
              title="Send Email"
            >
              <Send className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onInitiatePayment(invoice)}
              title="Initiate Payment"
            >
              <CreditCard className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkPaid(invoice)}
              title="Mark as Paid"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceActions;
