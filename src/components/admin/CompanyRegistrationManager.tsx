import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCompanyRegistrationRequests } from '@/hooks/useCompanyRegistrationRequests';
import { useLicenseTypes } from '@/hooks/useLicenseTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { 
  Building2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';

const CompanyRegistrationManager = () => {
  const { data: requests, isLoading, refetch } = useCompanyRegistrationRequests();
  const { data: licenseTypes } = useLicenseTypes();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const { toast } = useToast();

  const getLicenseTypePrice = (licenseTypeName: string) => {
    const licenseType = licenseTypes?.find(lt => lt.name === licenseTypeName);
    return licenseType?.price || 15000;
  };

  const getLicenseTypeDetails = (licenseTypeName: string) => {
    return licenseTypes?.find(lt => lt.name === licenseTypeName);
  };

  const handleApprove = async (requestId: string) => {
    const licenseTypeDetails = getLicenseTypeDetails(selectedRequest?.requested_license_type);
    const amount = parseFloat(invoiceAmount) || licenseTypeDetails?.price || 15000;
    const vatAmount = amount * 0.16; // 16% VAT
    const totalAmount = amount + vatAmount;

    setIsProcessing(true);
    try {
      // Generate invoice number
      const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
        .rpc('generate_invoice_number');

      if (invoiceNumberError) throw invoiceNumberError;

      // Create invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

      const { error: invoiceError } = await supabase
        .from('super_admin_invoices')
        .insert({
          invoice_number: invoiceNumberData,
          registration_request_id: requestId,
          company_name: selectedRequest.company_name,
          contact_email: selectedRequest.email,
          amount: amount,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          due_date: dueDate.toISOString().split('T')[0],
          notes: notes,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (invoiceError) throw invoiceError;

      // Update request status to approved
      const { error } = await supabase
        .from('company_registration_requests')
        .update({
          status: 'approved',
          notes: notes,
          processed_by: (await supabase.auth.getUser()).data.user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: `Invoice ${invoiceNumberData} generated for ${formatKenyanCurrency(totalAmount)}. Company can be created after payment.`,
      });

      setSelectedRequest(null);
      setNotes('');
      setInvoiceAmount('');
      refetch();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request and generate invoice",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('company_registration_requests')
        .update({
          status: 'rejected',
          notes: notes,
          processed_by: (await supabase.auth.getUser()).data.user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "Company registration request has been rejected.",
      });

      setSelectedRequest(null);
      setNotes('');
      refetch();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Registration Requests ({requests?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request) => {
                const licenseTypeDetails = getLicenseTypeDetails(request.requested_license_type);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.company_name}</div>
                      <div className="text-sm text-gray-500">{request.contact_person_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {request.email}
                        </div>
                        {request.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {request.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {licenseTypeDetails?.display_name || request.requested_license_type}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {formatKenyanCurrency(licenseTypeDetails?.price || 0)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setNotes(request.notes || '');
                              const licenseType = getLicenseTypeDetails(request.requested_license_type);
                              setInvoiceAmount(licenseType?.price?.toString() || '15000');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Company Registration Request</DialogTitle>
                            <DialogDescription>
                              Review and process the registration request from {request.company_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Company Name</label>
                                <p className="text-sm">{request.company_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Contact Person</label>
                                <p className="text-sm">{request.contact_person_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <p className="text-sm">{request.email}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <p className="text-sm">{request.phone || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">County</label>
                                <p className="text-sm">{request.county || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Sub County</label>
                                <p className="text-sm">{request.sub_county || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">KRA PIN</label>
                                <p className="text-sm">{request.kra_pin || 'Not provided'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">CA License</label>
                                <p className="text-sm">{request.ca_license_number || 'Not provided'}</p>
                              </div>
                            </div>
                            
                            {request.address && (
                              <div>
                                <label className="text-sm font-medium">Address</label>
                                <p className="text-sm">{request.address}</p>
                              </div>
                            )}
                            
                            <div>
                              <label className="text-sm font-medium">Requested License Type</label>
                              <div className="flex items-center gap-2">
                                <Badge className="ml-2">
                                  {getLicenseTypeDetails(request.requested_license_type)?.display_name || request.requested_license_type}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  (Price: {formatKenyanCurrency(getLicenseTypePrice(request.requested_license_type))})
                                </span>
                              </div>
                            </div>
                            
                            {request.business_description && (
                              <div>
                                <label className="text-sm font-medium">Business Description</label>
                                <p className="text-sm">{request.business_description}</p>
                              </div>
                            )}
                            
                            {request.status === 'pending' && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Invoice Amount (KES)</label>
                                  <Input
                                    type="number"
                                    value={invoiceAmount}
                                    onChange={(e) => setInvoiceAmount(e.target.value)}
                                    placeholder="Enter invoice amount"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Total with VAT: {formatKenyanCurrency((parseFloat(invoiceAmount) || 0) * 1.16)}
                                  </p>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Processing Notes</label>
                                  <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add processing notes..."
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleReject(request.id)}
                                    disabled={isProcessing}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => handleApprove(request.id)}
                                    disabled={isProcessing || !invoiceAmount}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve & Generate Invoice
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyRegistrationManager;
