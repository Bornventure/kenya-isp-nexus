import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSuperAdminCompanies } from '@/hooks/useSuperAdminCompanies';
import { useLicenseTypes } from '@/hooks/useLicenseTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Plus, 
  Edit, 
  Calendar, 
  Users, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Mail,
  Key,
  FileText
} from 'lucide-react';
import { useSuperAdminInvoices } from '@/hooks/useSuperAdminInvoices';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

const ISPCompanyLicenseManager = () => {
  const { data: companies, isLoading, refetch } = useSuperAdminCompanies();
  const { data: paidInvoices } = useSuperAdminInvoices();
  const { data: licenseTypes } = useLicenseTypes();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    county: '',
    sub_county: '',
    kra_pin: '',
    ca_license_number: '',
    license_type: 'starter' as 'starter' | 'professional' | 'enterprise',
    client_limit: 50,
    contact_person_name: ''
  });

  // Get only paid invoices that haven't been used to create companies yet
  const availableInvoices = paidInvoices?.filter(invoice => 
    invoice.status === 'paid' && 
    !companies?.some(company => company.email === invoice.contact_email)
  ) || [];

  const handleSelectInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    // Populate form with invoice data
    setNewCompany(prev => ({
      ...prev,
      name: invoice.company_name,
      email: invoice.contact_email,
      // We'll need to get other details from the registration request
    }));
  };

  const getLicenseTypeByName = (name: string) => {
    return licenseTypes?.find(lt => lt.name === name);
  };

  const handleCreateCompany = async () => {
    if (!selectedInvoice) {
      toast({
        title: "Validation Error",
        description: "Please select a paid invoice to create company from.",
        variant: "destructive"
      });
      return;
    }

    if (!newCompany.name || !newCompany.email || !newCompany.contact_person_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Company Name, Email, Contact Person).",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Generate license key and create company
      const licenseKey = `DD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

      const { data: company, error: companyError } = await supabase
        .from('isp_companies')
        .insert([{
          name: newCompany.name,
          email: newCompany.email,
          phone: newCompany.phone,
          address: newCompany.address,
          county: newCompany.county,
          sub_county: newCompany.sub_county,
          kra_pin: newCompany.kra_pin,
          ca_license_number: newCompany.ca_license_number,
          license_type: newCompany.license_type,
          license_key: licenseKey,
          client_limit: newCompany.client_limit,
          is_active: true,
          subscription_end_date: subscriptionEndDate.toISOString()
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // Create user account and send credentials using the edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('create-isp-account', {
        body: {
          companyData: {
            id: company.id,
            name: company.name,
            contact_email: newCompany.email,
            contact_person_name: newCompany.contact_person_name
          },
          licenseKey: licenseKey
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        toast({
          title: "Partial Success",
          description: "Company created but failed to create user account. Please create manually.",
          variant: "destructive"
        });
      } else if (!functionData?.success) {
        console.error('User creation failed:', functionData);
        toast({
          title: "Partial Success", 
          description: functionData?.error || "Company created but failed to create user account.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: `ISP company "${newCompany.name}" created successfully from invoice ${selectedInvoice.invoice_number}. Login credentials sent to ${newCompany.email}`,
        });
      }

      setIsCreateDialogOpen(false);
      setSelectedInvoice(null);
      setNewCompany({
        name: '',
        email: '',
        phone: '',
        address: '',
        county: '',
        sub_county: '',
        kra_pin: '',
        ca_license_number: '',
        license_type: 'starter',
        client_limit: 50,
        contact_person_name: ''
      });
      refetch();

    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ISP company",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLicenseTypeChange = (type: 'starter' | 'professional' | 'enterprise') => {
    const licenseType = getLicenseTypeByName(type);
    setNewCompany(prev => ({
      ...prev,
      license_type: type,
      client_limit: licenseType?.client_limit || 50
    }));
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ISP Company Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Create ISP companies from paid registration invoices
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={availableInvoices.length === 0}>
              <Plus className="h-4 w-4" />
              Create from Paid Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create ISP Company from Paid Invoice</DialogTitle>
              <DialogDescription>
                Select a paid invoice to create the corresponding ISP company
              </DialogDescription>
            </DialogHeader>
            
            {availableInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No paid invoices available for company creation</p>
                <p className="text-sm text-gray-400">Companies can only be created from paid registration invoices</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Select Paid Invoice *</Label>
                  <Select value={selectedInvoice?.id || ''} onValueChange={(value) => {
                    const invoice = availableInvoices.find(inv => inv.id === value);
                    handleSelectInvoice(invoice);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose paid invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {invoice.company_name} ({formatKenyanCurrency(invoice.total_amount)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoice && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Paid Invoice Selected</span>
                      </div>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>• Invoice: {selectedInvoice.invoice_number}</p>
                        <p>• Company: {selectedInvoice.company_name}</p>
                        <p>• Amount Paid: {formatKenyanCurrency(selectedInvoice.total_amount)}</p>
                        <p>• Payment Date: {selectedInvoice.payment_date ? new Date(selectedInvoice.payment_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Name *</Label>
                        <Input
                          value={newCompany.name}
                          onChange={(e) => setNewCompany(prev => ({...prev, name: e.target.value}))}
                          placeholder="ISP Company Name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Contact Person *</Label>
                        <Input
                          value={newCompany.contact_person_name}
                          onChange={(e) => setNewCompany(prev => ({...prev, contact_person_name: e.target.value}))}
                          placeholder="Admin Full Name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Email Address *</Label>
                        <Input
                          type="email"
                          value={newCompany.email}
                          onChange={(e) => setNewCompany(prev => ({...prev, email: e.target.value}))}
                          placeholder="admin@company.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={newCompany.phone}
                          onChange={(e) => setNewCompany(prev => ({...prev, phone: e.target.value}))}
                          placeholder="+254 xxx xxx xxx"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label>Address</Label>
                        <Input
                          value={newCompany.address}
                          onChange={(e) => setNewCompany(prev => ({...prev, address: e.target.value}))}
                          placeholder="Company address"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>County</Label>
                        <Input
                          value={newCompany.county}
                          onChange={(e) => setNewCompany(prev => ({...prev, county: e.target.value}))}
                          placeholder="County"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Sub County</Label>
                        <Input
                          value={newCompany.sub_county}
                          onChange={(e) => setNewCompany(prev => ({...prev, sub_county: e.target.value}))}
                          placeholder="Sub County"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>KRA PIN</Label>
                        <Input
                          value={newCompany.kra_pin}
                          onChange={(e) => setNewCompany(prev => ({...prev, kra_pin: e.target.value}))}
                          placeholder="P051234567X"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>CA License</Label>
                        <Input
                          value={newCompany.ca_license_number}
                          onChange={(e) => setNewCompany(prev => ({...prev, ca_license_number: e.target.value}))}
                          placeholder="CA License Number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>License Type</Label>
                        <Select value={newCompany.license_type} onValueChange={handleLicenseTypeChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {licenseTypes?.map((licenseType) => (
                              <SelectItem key={licenseType.id} value={licenseType.name}>
                                {licenseType.display_name} ({licenseType.client_limit} clients)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Client Limit</Label>
                        <Input
                          type="number"
                          value={newCompany.client_limit}
                          onChange={(e) => setNewCompany(prev => ({...prev, client_limit: parseInt(e.target.value) || 0}))}
                          placeholder="Client limit"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">Automatic Setup</span>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Admin user account will be created automatically</li>
                        <li>• Login credentials will be sent to the provided email</li>
                        <li>• Company ID and License Key will be included</li>
                        <li>• User can activate their system immediately</li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateCompany}
                        disabled={isProcessing || !selectedInvoice}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Key className="h-4 w-4" />
                        {isProcessing ? 'Creating...' : 'Create Company & Send Credentials'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Registered Companies ({companies?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>License Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies?.map((company) => {
                  const licenseTypeDetails = getLicenseTypeByName(company.license_type);
                  return (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          company.license_type === 'enterprise' ? 'default' :
                          company.license_type === 'professional' ? 'secondary' : 'outline'
                        }>
                          {licenseTypeDetails?.display_name || company.license_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {company.is_active ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600">Active</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600">Inactive</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>0 / {company.client_limit}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {company.subscription_end_date ? 
                              new Date(company.subscription_end_date).toLocaleDateString() : 
                              'No expiry'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ISPCompanyLicenseManager;
