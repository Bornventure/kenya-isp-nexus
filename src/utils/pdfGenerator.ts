
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateInvoicePDF = (invoice: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('INVOICE', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 45);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 55);
  doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 65);
  
  // Client information
  doc.setFontSize(14);
  doc.text('Bill To:', 20, 85);
  doc.setFontSize(12);
  doc.text(`${invoice.clients?.name || 'N/A'}`, 20, 95);
  doc.text(`Service Period: ${new Date(invoice.service_period_start).toLocaleDateString()} - ${new Date(invoice.service_period_end).toLocaleDateString()}`, 20, 105);
  
  // Invoice table
  const tableData = [
    ['Internet Service', `KES ${invoice.amount.toLocaleString()}`],
    ['VAT (16%)', `KES ${invoice.vat_amount.toLocaleString()}`],
    ['Total', `KES ${invoice.total_amount.toLocaleString()}`]
  ];
  
  doc.autoTable({
    startY: 120,
    head: [['Description', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 },
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, finalY + 20);
  
  return doc;
};

export const downloadInvoicePDF = (invoice: any) => {
  const doc = generateInvoicePDF(invoice);
  doc.save(`invoice-${invoice.invoice_number}.pdf`);
};

export const generateReceiptPDF = (payment: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('PAYMENT RECEIPT', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Receipt #: ${payment.reference_number}`, 20, 45);
  doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 20, 55);
  
  // Payment details
  const tableData = [
    ['Amount Paid', `KES ${payment.amount.toLocaleString()}`],
    ['Payment Method', payment.payment_method],
    ['Reference', payment.reference_number || 'N/A'],
    ['Status', 'PAID']
  ];
  
  doc.autoTable({
    startY: 70,
    head: [['Description', 'Details']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 10 },
  });
  
  return doc;
};

export const downloadReceiptPDF = (payment: any) => {
  const doc = generateReceiptPDF(payment);
  doc.save(`receipt-${payment.reference_number}.pdf`);
};
