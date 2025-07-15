
import React, { useState } from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Eye, 
  FileText, 
  Receipt, 
  Shield, 
  User,
  Printer
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DocumentsPage = () => {
  const { client } = useClientAuth();
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  if (!client) return null;

  const documents = [
    {
      id: 'service-agreement',
      title: 'Service Agreement',
      type: 'PDF',
      date: client.created_at ? new Date(client.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      icon: FileText,
      description: 'Terms and conditions for internet services'
    },
    {
      id: 'installation-certificate',
      title: 'Installation Certificate',
      type: 'PDF',
      date: client.installation_date ? new Date(client.installation_date).toLocaleDateString() : new Date().toLocaleDateString(),
      icon: Shield,
      description: 'Certificate of service installation'
    },
    {
      id: 'client-profile',
      title: 'Client Profile Summary',
      type: 'PDF',
      date: new Date().toLocaleDateString(),
      icon: User,
      description: 'Your account information and service details'
    },
    {
      id: 'payment-history',
      title: 'Payment History Report',
      type: 'PDF',
      date: new Date().toLocaleDateString(),
      icon: Receipt,
      description: 'Complete payment and transaction history'
    }
  ];

  const generateServiceAgreement = () => {
    const content = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">DATADEFENDER LAKELINK NETWORKS</h1>
          <p style="margin: 0; font-size: 14px;">Professional ISP Management Solutions</p>
          <p style="margin: 5px 0; font-size: 14px;">Kenya Internet Services</p>
        </div>
        
        <h2 style="color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">INTERNET SERVICE AGREEMENT</h2>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Client Information</h3>
          <p><strong>Name:</strong> ${client.name}</p>
          <p><strong>Email:</strong> ${client.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${client.phone}</p>
          <p><strong>ID Number:</strong> ${client.id_number}</p>
          <p><strong>Location:</strong> ${client.location || 'N/A'}</p>
          <p><strong>Service Type:</strong> ${client.connection_type}</p>
          <p><strong>Monthly Rate:</strong> KES ${client.monthly_rate?.toFixed(2) || '0.00'}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Terms and Conditions</h3>
          <ol style="padding-left: 20px;">
            <li><strong>Service Provision:</strong> DataDefender Lakelink Networks agrees to provide internet services as specified in this agreement.</li>
            <li><strong>Payment Terms:</strong> Payment is due monthly in advance. Late payments may result in service suspension.</li>
            <li><strong>Fair Usage Policy:</strong> Service is subject to fair usage policies to ensure quality for all users.</li>
            <li><strong>Equipment:</strong> Customer premises equipment remains property of DataDefender until fully paid.</li>
            <li><strong>Service Level:</strong> We strive to maintain 99% uptime excluding scheduled maintenance.</li>
            <li><strong>Termination:</strong> Either party may terminate with 30 days written notice.</li>
            <li><strong>Compliance:</strong> This agreement is governed by the laws of Kenya and Communications Authority regulations.</li>
          </ol>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="color: #1e40af;">Service Specifications</h3>
          <p><strong>Connection Type:</strong> ${client.connection_type}</p>
          <p><strong>Installation Date:</strong> ${client.installation_date ? new Date(client.installation_date).toLocaleDateString() : 'Pending'}</p>
          <p><strong>Service Status:</strong> ${client.status}</p>
        </div>

        <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-left: 4px solid #2563eb;">
          <h4 style="color: #1e40af; margin-top: 0;">Customer Support</h4>
          <p>For technical support or billing inquiries:</p>
          <p><strong>Email:</strong> support@datadefender.co.ke</p>
          <p><strong>Phone:</strong> +254 700 000 000</p>
        </div>

        <div style="margin: 30px 0; text-align: center; font-size: 12px; color: #666;">
          <p>Agreement Date: ${new Date().toLocaleDateString()}</p>
          <p>This is a system-generated document from DataDefender Lakelink Networks</p>
        </div>
      </div>
    `;
    return content;
  };

  const generateInstallationCertificate = () => {
    const content = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">DATADEFENDER LAKELINK NETWORKS</h1>
          <p style="margin: 0; font-size: 14px;">Professional ISP Management Solutions</p>
          <p style="margin: 5px 0; font-size: 14px;">Kenya Internet Services</p>
        </div>
        
        <div style="border: 3px solid #2563eb; padding: 30px; margin: 20px 0; text-align: center;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">INSTALLATION CERTIFICATE</h2>
          
          <p style="font-size: 18px; margin: 20px 0;">This certifies that internet services have been successfully installed for:</p>
          
          <div style="margin: 30px 0; padding: 20px; background: #f8fafc;">
            <h3 style="color: #1e40af; margin-top: 0;">${client.name}</h3>
            <p><strong>Client ID:</strong> ${client.id}</p>
            <p><strong>Installation Date:</strong> ${client.installation_date ? new Date(client.installation_date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <p><strong>Service Type:</strong> ${client.connection_type}</p>
            <p><strong>Location:</strong> ${client.location || 'N/A'}</p>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Installation Details</h3>
          <ul style="padding-left: 20px;">
            <li>Service successfully configured and tested</li>
            <li>Equipment installed and operational</li>
            <li>Network connectivity verified</li>
            <li>Customer orientation completed</li>
            <li>Service agreement signed and filed</li>
          </ul>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <p style="margin: 40px 0;">_________________________</p>
          <p><strong>Technical Team</strong></p>
          <p>DataDefender Lakelink Networks</p>
          <p style="font-size: 12px; color: #666;">Certified by Communications Authority of Kenya</p>
        </div>

        <div style="margin: 30px 0; text-align: center; font-size: 12px; color: #666;">
          <p>Certificate Generated: ${new Date().toLocaleDateString()}</p>
          <p>This is an official document from DataDefender Lakelink Networks</p>
        </div>
      </div>
    `;
    return content;
  };

  const generateClientProfile = () => {
    const content = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">DATADEFENDER LAKELINK NETWORKS</h1>
          <p style="margin: 0; font-size: 14px;">Professional ISP Management Solutions</p>
          <p style="margin: 5px 0; font-size: 14px;">Kenya Internet Services</p>
        </div>
        
        <h2 style="color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">CLIENT PROFILE SUMMARY</h2>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Personal Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p><strong>Full Name:</strong> ${client.name}</p>
              <p><strong>Email:</strong> ${client.email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${client.phone}</p>
              <p><strong>ID Number:</strong> ${client.id_number}</p>
            </div>
            <div>
              <p><strong>Client Type:</strong> ${client.client_type}</p>
              <p><strong>Account Status:</strong> ${client.status}</p>
              <p><strong>Registration Date:</strong> ${client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}</p>
              <p><strong>KRA PIN:</strong> ${client.kra_pin_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Service Information</h3>
          <p><strong>Connection Type:</strong> ${client.connection_type}</p>
          <p><strong>Monthly Rate:</strong> KES ${client.monthly_rate?.toFixed(2) || '0.00'}</p>
          <p><strong>Subscription Type:</strong> ${client.subscription_type}</p>
          <p><strong>Installation Date:</strong> ${client.installation_date ? new Date(client.installation_date).toLocaleDateString() : 'Pending'}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Account Status</h3>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <p><strong>Current Status:</strong> <span style="color: ${client.status === 'active' ? '#059669' : '#dc2626'}">${client.status?.toUpperCase()}</span></p>
            <p><strong>Wallet Balance:</strong> KES ${client.wallet_balance?.toFixed(2) || '0.00'}</p>
            <p><strong>Account Balance:</strong> KES ${client.balance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div style="margin: 30px 0; text-align: center; font-size: 12px; color: #666;">
          <p>Profile Generated: ${new Date().toLocaleDateString()}</p>
          <p>This is a confidential document from DataDefender Lakelink Networks</p>
        </div>
      </div>
    `;
    return content;
  };

  const generatePaymentHistory = () => {
    const content = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">DATADEFENDER LAKELINK NETWORKS</h1>
          <p style="margin: 0; font-size: 14px;">Professional ISP Management Solutions</p>
          <p style="margin: 5px 0; font-size: 14px;">Kenya Internet Services</p>
        </div>
        
        <h2 style="color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">PAYMENT HISTORY REPORT</h2>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Account Information</h3>
          <p><strong>Client Name:</strong> ${client.name}</p>
          <p><strong>Account ID:</strong> ${client.id}</p>
          <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Current Balance:</strong> KES ${client.wallet_balance?.toFixed(2) || '0.00'}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Payment Summary</h3>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <p><strong>Monthly Service Rate:</strong> KES ${client.monthly_rate?.toFixed(2) || '0.00'}</p>
            <p><strong>Payment Method:</strong> M-Pesa</p>
            <p><strong>M-Pesa Number:</strong> ${client.mpesa_number || client.phone}</p>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1e40af;">Transaction History</h3>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <p><em>Transaction history is dynamically loaded from your payment records.</em></p>
            <p><em>For detailed transaction history, please check the wallet section in your client portal.</em></p>
          </div>
        </div>

        <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-left: 4px solid #2563eb;">
          <h4 style="color: #1e40af; margin-top: 0;">Payment Instructions</h4>
          <p><strong>M-Pesa Paybill:</strong> 123456 (Example)</p>
          <p><strong>Account Number:</strong> Your phone number</p>
          <p><strong>Amount:</strong> KES ${client.monthly_rate?.toFixed(2) || '0.00'}</p>
        </div>

        <div style="margin: 30px 0; text-align: center; font-size: 12px; color: #666;">
          <p>Report Generated: ${new Date().toLocaleDateString()}</p>
          <p>This is a confidential document from DataDefender Lakelink Networks</p>
        </div>
      </div>
    `;
    return content;
  };

  const getDocumentContent = (documentId: string) => {
    switch (documentId) {
      case 'service-agreement':
        return generateServiceAgreement();
      case 'installation-certificate':
        return generateInstallationCertificate();
      case 'client-profile':
        return generateClientProfile();
      case 'payment-history':
        return generatePaymentHistory();
      default:
        return '<p>Document not found</p>';
    }
  };

  const handleDownload = (documentId: string, title: string) => {
    const content = getDocumentContent(documentId);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = (documentId: string) => {
    const content = getDocumentContent(documentId);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Document</title>
          <style>
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Documents & Certificates
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Access your service documents, certificates, and reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => {
          const IconComponent = doc.icon;
          return (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {doc.type} • {doc.date}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {doc.description}
                </p>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{doc.title}</DialogTitle>
                      </DialogHeader>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: getDocumentContent(doc.id) }}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => handleDownload(doc.id, doc.title)}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => handlePrint(doc.id)}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>• All documents are generated in real-time with your current account information</p>
            <p>• Documents can be downloaded as HTML files for offline viewing</p>
            <p>• Print functionality is available for physical copies</p>
            <p>• All documents comply with Kenyan legal requirements and CA regulations</p>
            <p>• For official stamped documents, please contact our support team</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
