
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Shield,
  FileCheck,
  AlertCircle,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  title: string;
  type: 'contract' | 'invoice' | 'receipt' | 'agreement' | 'policy' | 'terms';
  file_url: string;
  created_at: string;
  file_size: number;
  status: 'active' | 'expired' | 'pending';
  content?: string;
}

const DocumentsPage: React.FC = () => {
  const { client } = useClientAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (client) {
      generateDocuments();
    }
  }, [client]);

  const generateDocuments = async () => {
    if (!client) return;

    try {
      const currentDate = new Date();
      const contractDate = client.subscription_start_date ? new Date(client.subscription_start_date) : currentDate;
      
      const documents: Document[] = [
        {
          id: '1',
          title: 'Internet Service Agreement',
          type: 'contract',
          file_url: '#',
          created_at: contractDate.toISOString(),
          file_size: 245760,
          status: 'active',
          content: generateServiceAgreement()
        },
        {
          id: '2',
          title: 'Terms of Service',
          type: 'terms',
          file_url: '#',
          created_at: currentDate.toISOString(),
          file_size: 156432,
          status: 'active',
          content: generateTermsOfService()
        },
        {
          id: '3',
          title: 'Privacy Policy',
          type: 'policy',
          file_url: '#',
          created_at: currentDate.toISOString(),
          file_size: 98304,
          status: 'active',
          content: generatePrivacyPolicy()
        },
        {
          id: '4',
          title: 'Data Protection Notice',
          type: 'policy',
          file_url: '#',
          created_at: currentDate.toISOString(),
          file_size: 87234,
          status: 'active',
          content: generateDataProtectionNotice()
        }
      ];

      setDocuments(documents);
    } catch (error: any) {
      console.error('Error generating documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateServiceAgreement = () => {
    const currentDate = format(new Date(), 'do MMMM yyyy');
    const contractDate = client?.subscription_start_date 
      ? format(new Date(client.subscription_start_date), 'do MMMM yyyy')
      : currentDate;

    return `
INTERNET SERVICE AGREEMENT

Date: ${contractDate}
Agreement No: ISA-${client?.id?.substring(0, 8).toUpperCase()}

PARTIES:
1. Service Provider: [ISP Company Name]
   Address: [ISP Address]
   License No: [CA License Number]
   
2. Client: ${client?.name}
   ID Number: ${client?.id_number}
   Address: ${client?.address}, ${client?.sub_county}, ${client?.county}
   Phone: ${client?.phone}
   Email: ${client?.email}

TERMS AND CONDITIONS:

1. SERVICE DESCRIPTION
   The Service Provider agrees to provide internet connectivity services to the Client as per the selected package:
   - Package: ${client?.service_package?.name || 'Standard Package'}
   - Speed: ${client?.service_package?.speed || 'As specified'}
   - Monthly Rate: KES ${client?.monthly_rate?.toLocaleString()}

2. DURATION
   This agreement commences on ${contractDate} and shall continue on a ${client?.subscription_type || 'monthly'} basis until terminated by either party.

3. PAYMENT TERMS
   - Monthly fee: KES ${client?.monthly_rate?.toLocaleString()}
   - Payment due date: ${client?.subscription_type === 'weekly' ? '7 days' : '30 days'} from activation date
   - Late payment may result in service suspension

4. SERVICE LEVEL AGREEMENT
   The Service Provider undertakes to provide:
   - 99.5% uptime guarantee
   - 24/7 technical support
   - Maintenance notifications in advance

5. CLIENT OBLIGATIONS
   - Timely payment of service fees
   - Proper use of equipment
   - Compliance with acceptable use policy

6. TERMINATION
   Either party may terminate this agreement with 30 days written notice.

7. GOVERNING LAW
   This agreement shall be governed by the laws of Kenya.

8. DISPUTE RESOLUTION
   Any disputes arising shall be resolved through mediation, failing which through arbitration in Kenya.

IN WITNESS WHEREOF, the parties have executed this agreement on the date first written above.

Service Provider: ________________    Client: ________________
Date: ${contractDate}                Date: ${contractDate}

This document is generated electronically and is valid without signature as per the Electronic Transactions Act of Kenya.
    `.trim();
  };

  const generateTermsOfService = () => {
    const currentDate = format(new Date(), 'do MMMM yyyy');
    
    return `
TERMS OF SERVICE

Effective Date: ${currentDate}
Last Updated: ${currentDate}

1. ACCEPTANCE OF TERMS
By using our internet services, you agree to comply with these Terms of Service and all applicable laws of Kenya.

2. SERVICE DESCRIPTION
We provide internet connectivity services to residential and business customers in Kenya in accordance with Communications Authority of Kenya regulations.

3. ACCEPTABLE USE POLICY
You agree not to use our services for:
- Illegal activities under Kenyan law
- Harassment or threatening behavior
- Spam or unsolicited communications
- Copyright infringement
- Network security breaches

4. PAYMENT AND BILLING
- Services are billed in advance
- Late payments may result in service suspension
- Reconnection fees may apply

5. PRIVACY AND DATA PROTECTION
We comply with the Data Protection Act 2019 of Kenya in handling your personal information.

6. SERVICE AVAILABILITY
While we strive for 99.5% uptime, service may be interrupted for maintenance or due to circumstances beyond our control.

7. LIMITATION OF LIABILITY
Our liability is limited to the monthly service fee paid by the customer.

8. TERMINATION
We may terminate services for breach of these terms or non-payment.

9. GOVERNING LAW
These terms are governed by Kenyan law and subject to Kenyan courts' jurisdiction.

For support, contact: [Support Contact Information]

© ${new Date().getFullYear()} [ISP Company Name]. All rights reserved.
    `.trim();
  };

  const generatePrivacyPolicy = () => {
    const currentDate = format(new Date(), 'do MMMM yyyy');
    
    return `
PRIVACY POLICY

Effective Date: ${currentDate}
Last Updated: ${currentDate}

This Privacy Policy complies with the Data Protection Act 2019 of Kenya.

1. INFORMATION WE COLLECT
Personal Information:
- Name: ${client?.name}
- ID Number: ${client?.id_number}
- Contact Information: ${client?.phone}, ${client?.email}
- Address: ${client?.address}

Usage Information:
- Connection logs
- Bandwidth usage
- Service performance data

2. HOW WE USE YOUR INFORMATION
- Provide internet services
- Billing and account management
- Technical support
- Service improvements
- Legal compliance

3. DATA SHARING
We do not sell your personal information. We may share data with:
- Service providers for operational purposes
- Authorities when legally required
- With your consent

4. DATA SECURITY
We implement appropriate security measures to protect your information including:
- Encryption of sensitive data
- Access controls
- Regular security audits

5. YOUR RIGHTS
Under the Data Protection Act 2019, you have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your data (subject to legal requirements)
- Data portability

6. DATA RETENTION
We retain your data for as long as necessary to provide services and comply with legal obligations.

7. COOKIES AND TRACKING
We use cookies to improve our services. You can control cookie settings in your browser.

8. CONTACT US
For privacy-related queries, contact our Data Protection Officer at:
[Contact Information]

This policy may be updated periodically. Changes will be communicated to customers.
    `.trim();
  };

  const generateDataProtectionNotice = () => {
    const currentDate = format(new Date(), 'do MMMM yyyy');
    
    return `
DATA PROTECTION NOTICE

Date: ${currentDate}
Client: ${client?.name}
Reference: DPN-${client?.id?.substring(0, 8).toUpperCase()}

In compliance with the Data Protection Act 2019 of Kenya:

1. DATA CONTROLLER
[ISP Company Name] is the data controller for your personal information.

2. LAWFUL BASIS FOR PROCESSING
We process your personal data based on:
- Contract performance (service delivery)
- Legal obligations (regulatory compliance)
- Legitimate interests (service improvement)

3. DATA PROCESSED
- Identity: ${client?.name}, ID: ${client?.id_number}
- Contact: ${client?.phone}, ${client?.email}
- Location: ${client?.address}
- Financial: Payment history, billing information
- Technical: Usage logs, connection data

4. DATA RECIPIENTS
Your data may be shared with:
- Payment processors
- Technical support providers
- Regulatory authorities (when required)

5. DATA RETENTION PERIOD
- Account data: Duration of service + 7 years
- Financial records: 7 years (tax law requirement)
- Technical logs: 12 months

6. YOUR RIGHTS
You have the right to:
- Access your personal data
- Rectify inaccurate data
- Erase data (where legally permissible)
- Restrict processing
- Data portability
- Object to processing
- Lodge a complaint with the Data Protection Commissioner

7. CONTACT INFORMATION
Data Protection Officer: [Name]
Email: [Email]
Phone: [Phone]

8. COMPLAINTS
You may lodge complaints with:
Office of the Data Protection Commissioner
P.O. Box 28901-00100
Nairobi, Kenya
Email: info@odpc.go.ke

By continuing to use our services, you acknowledge receipt of this notice.
    `.trim();
  };

  const handleView = (document: Document) => {
    setViewingDocument(document);
  };

  const handleDownload = (document: Document) => {
    if (document.content) {
      const blob = new Blob([document.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `${document.title} has been downloaded`,
      });
    }
  };

  const handlePrint = (document: Document) => {
    if (document.content) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${document.title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                h1 { color: #333; }
                pre { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>${document.title}</h1>
              <pre>${document.content}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileCheck className="h-5 w-5 text-blue-500" />;
      case 'terms':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'policy':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Access your service agreements, policies, and important documents
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading documents...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewingDocument) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{viewingDocument.title}</h2>
            <p className="text-muted-foreground">
              Generated on {format(new Date(viewingDocument.created_at), 'MMMM do, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handlePrint(viewingDocument)}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={() => handleDownload(viewingDocument)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => setViewingDocument(null)}>
              Back to Documents
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {viewingDocument.content}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">
          Access your service agreements, policies, and important documents
        </p>
      </div>

      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getDocumentIcon(document.type)}
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{document.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(document.created_at), 'MMM dd, yyyy')}
                      </div>
                      <span>{formatFileSize(document.file_size)}</span>
                      <span className="capitalize">{document.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(document)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentsPage;
