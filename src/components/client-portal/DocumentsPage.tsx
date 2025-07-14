
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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  title: string;
  type: 'contract' | 'invoice' | 'receipt' | 'agreement' | 'policy';
  file_url: string;
  created_at: string;
  file_size: number;
  status: 'active' | 'expired' | 'pending';
}

const DocumentsPage: React.FC = () => {
  const { client } = useClientAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (client) {
      fetchDocuments();
    }
  }, [client]);

  const fetchDocuments = async () => {
    if (!client) return;

    try {
      // Mock documents for demonstration
      const mockDocuments: Document[] = [
        {
          id: '1',
          title: 'Service Agreement',
          type: 'contract',
          file_url: '#',
          created_at: client.subscription_start_date || new Date().toISOString(),
          file_size: 245760,
          status: 'active'
        },
        {
          id: '2',
          title: 'Terms of Service',
          type: 'agreement',
          file_url: '#',
          created_at: new Date().toISOString(),
          file_size: 156432,
          status: 'active'
        },
        {
          id: '3',
          title: 'Privacy Policy',
          type: 'policy',
          file_url: '#',
          created_at: new Date().toISOString(),
          file_size: 98304,
          status: 'active'
        }
      ];

      setDocuments(mockDocuments);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileCheck className="h-5 w-5 text-blue-500" />;
      case 'agreement':
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

  const handleDownload = (document: Document) => {
    // In a real implementation, this would download the actual file
    toast({
      title: "Download Started",
      description: `Downloading ${document.title}...`,
    });
  };

  const handleView = (document: Document) => {
    // In a real implementation, this would open the document in a viewer
    toast({
      title: "Opening Document",
      description: `Opening ${document.title}...`,
    });
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

      {documents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents available</h3>
            <p className="text-muted-foreground">
              Your service documents will appear here once they're generated
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentsPage;
