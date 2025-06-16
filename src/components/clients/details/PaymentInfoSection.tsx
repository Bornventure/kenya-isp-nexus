
import React from 'react';
import { CreditCard } from 'lucide-react';
import { formatKenyanCurrency } from '@/utils/currencyFormat';

interface PaymentInfoSectionProps {
  client: any;
}

const PaymentInfoSection: React.FC<PaymentInfoSectionProps> = ({ client }) => {
  if (!client.lastPayment) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        Last Payment
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <label className="font-medium text-gray-600">Date</label>
          <p>{formatDate(client.lastPayment.date)}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Amount</label>
          <p className="font-semibold">{formatKenyanCurrency(client.lastPayment.amount)}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Method</label>
          <p className="capitalize">{client.lastPayment.method}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoSection;
