
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Payment } from '@/hooks/usePayments';
import type { Receipt } from '@/types/receipt';

export interface InvoiceData {
  id: string;
  invoice_number: string;
  client_id?: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  due_date?: string;
  service_period_start?: string;
  service_period_end?: string;
  notes?: string;
  created_at: string;
  tracking_number?: string;
  equipment_details?: any;
  clients?: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
  };
}

export interface InstallationInvoiceData {
  id: string;
  invoice_number: string;
  client_id: string;
  setup_fee: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  tracking_number: string;
  created_at: string;
  clients?: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
  };
  service_packages?: {
    name: string;
    speed: string;
    monthly_rate: number;
  };
}

export const downloadInvoicePDF = (invoice: InvoiceData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('INSTALLATION INVOICE', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 45);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 55);
  
  if (invoice.tracking_number) {
    doc.text(`Tracking Number: ${invoice.tracking_number}`, 20, 65);
  }
  
  // Client Information
  doc.setFontSize(14);
  doc.text('Bill To:', 20, 85);
  
  doc.setFontSize(12);
  let yPos = 95;
  if (invoice.clients?.name) {
    doc.text(invoice.clients.name, 20, yPos);
    yPos += 10;
  }
  if (invoice.clients?.email) {
    doc.text(invoice.clients.email, 20, yPos);
    yPos += 10;
  }
  if (invoice.clients?.phone) {
    doc.text(`Phone: ${invoice.clients.phone}`, 20, yPos);
    yPos += 10;
  }
  if (invoice.clients?.address) {
    doc.text(invoice.clients.address, 20, yPos);
    yPos += 10;
  }
  
  // Invoice Items Table
  const tableData = [
    ['Installation Service', `KES ${invoice.amount.toLocaleString()}`],
    ['VAT (16%)', `KES ${invoice.vat_amount.toLocaleString()}`],
    ['Total', `KES ${invoice.total_amount.toLocaleString()}`]
  ];
  
  (doc as any).autoTable({
    head: [['Description', 'Amount']],
    body: tableData,
    startY: yPos + 20,
    theme: 'grid',
    styles: {
      fontSize: 12,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
  });
  
  // Payment Instructions
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text('Payment Instructions:', 20, finalY);
  
  doc.setFontSize(10);
  const instructions = [
    '• Payment must be made within 7 days of invoice date',
    '• Use M-Pesa or Family Bank with your phone number as account',
    '• Installation will be scheduled after payment confirmation',
    '• Keep payment reference for your records'
  ];
  
  instructions.forEach((instruction, index) => {
    doc.text(instruction, 20, finalY + 15 + (index * 8));
  });
  
  // Equipment Details if available
  if (invoice.equipment_details) {
    const equipY = finalY + 60;
    doc.setFontSize(12);
    doc.text('Equipment Details:', 20, equipY);
    doc.setFontSize(10);
    doc.text('• Standard Wi-Fi Router', 20, equipY + 15);
    doc.text('• Ethernet Cable (10m)', 20, equipY + 25);
    doc.text('• Professional Installation', 20, equipY + 35);
  }
  
  // Save the PDF
  doc.save(`installation-invoice-${invoice.invoice_number}.pdf`);
};

export const downloadRegularInvoicePDF = (invoice: InvoiceData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('SERVICE INVOICE', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 45);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 55);
  
  if (invoice.due_date) {
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 65);
  }
  
  // Client Information
  doc.setFontSize(14);
  doc.text('Bill To:', 20, 85);
  
  doc.setFontSize(12);
  let yPos = 95;
  if (invoice.clients?.name) {
    doc.text(invoice.clients.name, 20, yPos);
    yPos += 10;
  }
  if (invoice.clients?.email) {
    doc.text(invoice.clients.email, 20, yPos);
    yPos += 10;
  }
  if (invoice.clients?.phone) {
    doc.text(`Phone: ${invoice.clients.phone}`, 20, yPos);
    yPos += 10;
  }
  
  // Service Period
  if (invoice.service_period_start && invoice.service_period_end) {
    yPos += 10;
    doc.text(`Service Period: ${new Date(invoice.service_period_start).toLocaleDateString()} - ${new Date(invoice.service_period_end).toLocaleDateString()}`, 20, yPos);
  }
  
  // Invoice Items Table
  const tableData = [
    ['Internet Service', `KES ${invoice.amount.toLocaleString()}`],
    ['VAT (16%)', `KES ${invoice.vat_amount.toLocaleString()}`],
    ['Total', `KES ${invoice.total_amount.toLocaleString()}`]
  ];
  
  (doc as any).autoTable({
    head: [['Description', 'Amount']],
    body: tableData,
    startY: yPos + 20,
    theme: 'grid',
    styles: {
      fontSize: 12,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
  });
  
  // Save the PDF
  doc.save(`service-invoice-${invoice.invoice_number}.pdf`);
};

export const downloadInstallationInvoicePDF = (invoice: InstallationInvoiceData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('INSTALLATION INVOICE', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 45);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 55);
  doc.text(`Tracking Number: ${invoice.tracking_number}`, 20, 65);
  
  // Client Information
  doc.setFontSize(14);
  doc.text('Bill To:', 20, 85);
  
  doc.setFontSize(12);
  let yPos = 95;
  if (invoice.clients?.name) {
    doc.text(invoice.clients.name, 20, yPos);
    yPos += 10;
  }
  if (invoice.clients?.email) {
    doc.text(invoice.clients.email, 20, yPos);
    yPos += 10;
  }
  if (invoice.clients?.phone) {
    doc.text(`Phone: ${invoice.clients.phone}`, 20, yPos);
    yPos += 10;
  }
  
  // Package Information
  if (invoice.service_packages) {
    yPos += 10;
    doc.text(`Package: ${invoice.service_packages.name} (${invoice.service_packages.speed})`, 20, yPos);
    yPos += 10;
    doc.text(`Monthly Rate: KES ${invoice.service_packages.monthly_rate.toLocaleString()}`, 20, yPos);
  }
  
  // Invoice Items Table
  const tableData = [
    ['Installation Service', `KES ${invoice.setup_fee.toLocaleString()}`],
    ['VAT (16%)', `KES ${invoice.vat_amount.toLocaleString()}`],
    ['Total', `KES ${invoice.total_amount.toLocaleString()}`]
  ];
  
  (doc as any).autoTable({
    head: [['Description', 'Amount']],
    body: tableData,
    startY: yPos + 20,
    theme: 'grid',
    styles: {
      fontSize: 12,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
  });
  
  // Payment Instructions
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text('Payment Instructions:', 20, finalY);
  
  doc.setFontSize(10);
  const instructions = [
    '• Payment must be made before installation can be scheduled',
    '• Use M-Pesa or Family Bank with your phone number as account',
    '• Installation will be scheduled after payment confirmation',
    '• Keep payment reference for your records'
  ];
  
  instructions.forEach((instruction, index) => {
    doc.text(instruction, 20, finalY + 15 + (index * 8));
  });
  
  // Save the PDF
  doc.save(`installation-invoice-${invoice.invoice_number}.pdf`);
};

export const downloadReceiptPDF = (payment: Payment) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('PAYMENT RECEIPT', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Receipt Number: RCP-${payment.id.substring(0, 8)}`, 20, 45);
  doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 20, 55);
  
  // Client Information
  doc.setFontSize(14);
  doc.text('Received From:', 20, 75);
  
  doc.setFontSize(12);
  let yPos = 85;
  if (payment.clients?.name) {
    doc.text(payment.clients.name, 20, yPos);
    yPos += 10;
  }
  if (payment.clients?.phone) {
    doc.text(`Phone: ${payment.clients.phone}`, 20, yPos);
    yPos += 10;
  }
  
  // Payment Details Table
  const tableData = [
    ['Payment Method', payment.payment_method],
    ['Reference Number', payment.reference_number || payment.mpesa_receipt_number || 'N/A'],
    ['Amount Paid', `KES ${payment.amount.toLocaleString()}`],
    ['Status', payment.status]
  ];
  
  (doc as any).autoTable({
    head: [['Description', 'Details']],
    body: tableData,
    startY: yPos + 10,
    theme: 'grid',
    styles: {
      fontSize: 12,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
    },
  });
  
  // Thank you note
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.text('Thank you for your payment!', 20, finalY);
  doc.setFontSize(10);
  doc.text('This is an official receipt for your payment.', 20, finalY + 15);
  
  // Save the PDF
  doc.save(`receipt-${payment.reference_number || payment.id.substring(0, 8)}.pdf`);
};
