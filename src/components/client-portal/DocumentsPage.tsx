
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { Download, FileText, Eye, Printer } from 'lucide-react';

const DocumentsPage = () => {
  const { client } = useClientAuth();
  const { data } = useClientDashboard(client?.email || '');

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateServiceAgreement = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Service Agreement - DataDefender</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #1e40af; font-size: 24px; font-weight: bold; }
            .section { margin: 20px 0; }
            .signature-section { margin-top: 50px; }
            .terms { margin-left: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">DataDefender</div>
            <h2>INTERNET SERVICE AGREEMENT</h2>
          </div>
          
          <div class="section">
            <h3>CUSTOMER INFORMATION</h3>
            <p><strong>Name:</strong> ${data?.client?.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${data?.client?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${data?.client?.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${data?.client?.address || 'N/A'}</p>
            <p><strong>Connection Type:</strong> ${data?.client?.connection_type || 'N/A'}</p>
          </div>
          
          <div class="section">
            <h3>SERVICE DETAILS</h3>
            <p><strong>Package:</strong> ${data?.client?.service_package?.name || 'N/A'}</p>
            <p><strong>Speed:</strong> ${data?.client?.service_package?.speed || 'N/A'}</p>
            <p><strong>Monthly Rate:</strong> KES ${data?.client?.monthly_rate || 'N/A'}</p>
            <p><strong>Installation Date:</strong> ${formatDate(data?.client?.installation_date)}</p>
          </div>
          
          <div class="section">
            <h3>TERMS AND CONDITIONS</h3>
            <div class="terms">
              <p>1. <strong>Service Provision:</strong> DataDefender agrees to provide internet services as specified in the selected package.</p>
              <p>2. <strong>Payment Terms:</strong> Payment is due monthly in advance. Late payments may result in service suspension.</p>
              <p>3. <strong>Fair Usage Policy:</strong> Customer agrees to use the service in accordance with acceptable use policies.</p>
              <p>4. <strong>Equipment:</strong> Any equipment provided remains property of DataDefender and must be returned upon termination.</p>
              <p>5. <strong>Termination:</strong> Either party may terminate this agreement with 30 days written notice.</p>
              <p>6. <strong>Governing Law:</strong> This agreement is governed by the laws of Kenya.</p>
            </div>
          </div>
          
          <div class="signature-section">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; padding: 20px; border-top: 1px solid #ccc;">
                  <strong>Customer Signature</strong><br>
                  Name: ${data?.client?.name || 'N/A'}<br>
                  Date: ________________
                </td>
                <td style="width: 50%; padding: 20px; border-top: 1px solid #ccc;">
                  <strong>DataDefender Representative</strong><br>
                  Name: ________________<br>
                  Date: ________________
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  const generateInvoiceTemplate = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - DataDefender</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #1e40af; font-size: 24px; font-weight: bold; }
            .invoice-details { margin: 20px 0; }
            .bill-to { margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">DataDefender</div>
            <h2>INVOICE</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> INV-${Date.now()}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-KE')}</p>
            <p><strong>Due Date:</strong> ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-KE')}</p>
          </div>
          
          <div class="bill-to">
            <h3>BILL TO:</h3>
            <p>${data?.client?.name || 'N/A'}</p>
            <p>${data?.client?.email || 'N/A'}</p>
            <p>${data?.client?.phone || 'N/A'}</p>
            <p>${data?.client?.address || 'N/A'}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Period</th>
                <th>Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Internet Service - ${data?.client?.service_package?.name || 'N/A'}</td>
                <td>Monthly</td>
                <td>${data?.client?.monthly_rate || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Subtotal:</strong> KES ${data?.client?.monthly_rate || 'N/A'}</p>
            <p><strong>VAT (16%):</strong> KES ${((data?.client?.monthly_rate || 0) * 0.16).toFixed(2)}</p>
            <p><strong>Total:</strong> KES ${((data?.client?.monthly_rate || 0) * 1.16).toFixed(2)}</p>
          </div>
          
          <div style="margin-top: 40px;">
            <p><strong>Payment Instructions:</strong></p>
            <p>Please pay via M-Pesa to Paybill: 123456</p>
            <p>Account Number: Your phone number</p>
            <p>Or use the payment options in your customer portal.</p>
          </div>
        </body>
      </html>
    `;
  };

  const generateComplianceCertificate = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Compliance Certificate - DataDefender</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #1e40af; font-size: 24px; font-weight: bold; }
            .certificate-body { margin: 20px 0; }
            .footer { margin-top: 50px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">DataDefender</div>
            <h2>COMPLIANCE CERTIFICATE</h2>
          </div>
          
          <div class="certificate-body">
            <p>This is to certify that:</p>
            <p style="text-align: center; font-size: 18px; margin: 20px 0;"><strong>${data?.client?.name || 'N/A'}</strong></p>
            <p>has been registered as a customer of DataDefender Internet Services and is in compliance with:</p>
            
            <ul style="margin: 20px 0;">
              <li>Kenya Information and Communications Act (Cap 411A)</li>
              <li>Communications Authority of Kenya regulations</li>
              <li>Data Protection Act, 2019</li>
              <li>Computer Misuse and Cybercrimes Act, 2018</li>
            </ul>
            
            <div style="margin: 30px 0;">
              <p><strong>Customer Details:</strong></p>
              <p>Customer Type: ${data?.client?.client_type || 'N/A'}</p>
              <p>Registration Date: ${formatDate(data?.client?.installation_date)}</p>
              <p>KRA PIN: ${data?.client?.kra_pin_number || 'N/A'}</p>
            </div>
            
            <p><strong>Service Details:</strong></p>
            <p>Connection Type: ${data?.client?.connection_type || 'N/A'}</p>
            <p>Package: ${data?.client?.service_package?.name || 'N/A'}</p>
            
            <p style="margin-top: 30px;">This certificate is issued in accordance with Kenyan law and regulations governing internet service provision.</p>
          </div>
          
          <div class="footer">
            <p>_______________________</p>
            <p><strong>DataDefender Compliance Officer</strong></p>
            <p>Date: ${new Date().toLocaleDateString('en-KE')}</p>
          </div>
        </body>
      </html>
    `;
  };

  const generateWalletStatement = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Wallet Statement - DataDefender</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #1e40af; font-size: 24px; font-weight: bold; }
            .statement-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .statement-table th, .statement-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .statement-table th { background-color: #f2f2f2; }
            .balance-info { margin: 20px 0; padding: 15px; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">DataDefender</div>
            <h2>WALLET STATEMENT</h2>
          </div>
          
          <div style="margin: 20px 0;">
            <p><strong>Customer:</strong> ${data?.client?.name || 'N/A'}</p>
            <p><strong>Account:</strong> ${data?.client?.phone || 'N/A'}</p>
            <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString('en-KE')}</p>
          </div>
          
          <div class="balance-info">
            <p><strong>Current Balance:</strong> KES ${data?.client?.wallet_balance || 'N/A'}</p>
            <p><strong>Account Balance:</strong> KES ${(data?.client?.wallet_balance || 0) - (data?.client?.balance || 0)}</p>
          </div>
          
          <table class="statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                  Transaction history will appear here as you make payments and renewals
                </td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 30px;">
            <p><strong>Notice:</strong> This statement is generated automatically and is valid for official purposes.</p>
            <p><strong>For inquiries:</strong> Contact DataDefender customer support</p>
          </div>
        </body>
      </html>
    `;
  };

  const documents = [
    {
      id: 1,
      title: 'Service Agreement',
      description: 'Your internet service contract and terms',
      icon: FileText,
      content: generateServiceAgreement(),
      filename: 'service-agreement.html'
    },
    {
      id: 2,
      title: 'Invoice Template',
      description: 'Monthly billing invoice template',
      icon: FileText,
      content: generateInvoiceTemplate(),
      filename: 'invoice-template.html'
    },
    {
      id: 3,
      title: 'Compliance Certificate',
      description: 'Compliance with Kenyan regulations',
      icon: FileText,
      content: generateComplianceCertificate(),
      filename: 'compliance-certificate.html'
    },
    {
      id: 4,
      title: 'Wallet Statement',
      description: 'Your wallet transaction history',
      icon: FileText,
      content: generateWalletStatement(),
      filename: 'wallet-statement.html'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Documents</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Access your service documents and certificates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <doc.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {doc.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrint(doc.content)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc.content, doc.filename)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrint(doc.content)}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">Document Information</h3>
        <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
          <li>• All documents are generated in real-time with your current information</li>
          <li>• Documents comply with Kenyan legal requirements</li>
          <li>• You can download documents as HTML files for printing or saving</li>
          <li>• For official copies, contact customer support</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentsPage;
