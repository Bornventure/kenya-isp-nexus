
export interface Receipt {
  id: string;
  invoiceId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  paymentMethod: 'M-Pesa' | 'Bank Transfer' | 'Cash';
  paymentReference: string;
  dateCreated: string;
  datePaid: string;
  servicePackage: string;
  servicePeriod: {
    from: string;
    to: string;
  };
  status: 'generated' | 'sent' | 'viewed';
  receiptNumber: string;
}
