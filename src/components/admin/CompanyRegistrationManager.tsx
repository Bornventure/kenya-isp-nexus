
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCompanyRegistrationRequests } from '@/hooks/useCompanyRegistrationRequests';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleApprove = async (requestId: string) => {
    setIsProcessing(true);
    try {
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
        description: "Company registration request has been approved. You can now create the company from the Company Management tab.",
      });

      setSelectedRequest(null);
      setNotes('');
      refetch();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
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
              {requests?.map((request) => (
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
                    <Badge variant="outline">
                      {request.requested_license_type}
                    </Badge>
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
                            <Badge className="ml-2">{request.requested_license_type}</Badge>
                          </div>
                          
                          {request.business_description && (
                            <div>
                              <label className="text-sm font-medium">Business Description</label>
                              <p className="text-sm">{request.business_description}</p>
                            </div>
                          )}
                          
                          <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add processing notes..."
                              rows={3}
                            />
                          </div>
                          
                          {request.status === 'pending' && (
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
                                disabled={isProcessing}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyRegistrationManager;
