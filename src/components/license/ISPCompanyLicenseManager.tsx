import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSuperAdminCompanies } from '@/hooks/useSuperAdminCompanies';
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
  Key
} from 'lucide-react';

const ISPCompanyLicenseManager = () => {
  const { data: companies, isLoading, refetch } = useSuperAdminCompanies();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const handleCreateCompany = async () => {
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

      // Create user account and send credentials
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-isp-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          companyData: {
            id: company.id,
            name: company.name,
            contact_email: newCompany.email,
            contact_person_name: newCompany.contact_person_name
          },
          licenseKey: licenseKey
        })
      });

      if (!response.ok) {
        console.error('Failed to create user account');
        // Company was created, but user account creation failed
        toast({
          title: "Partial Success",
          description: "Company created but failed to create user account. Please create manually.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: `ISP company "${newCompany.name}" created successfully. Login credentials sent to ${newCompany.email}`,
        });
      }

      setIsCreateDialogOpen(false);
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
    const limits = { starter: 50, professional: 200, enterprise: 1000 };
    setNewCompany(prev => ({
      ...prev,
      license_type: type,
      client_limit: limits[type]
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
            Manage registered ISP companies and their licenses
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New ISP Company</DialogTitle>
              <DialogDescription>
                Create a new ISP company with automatic user account creation and credential delivery
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(prev => ({...prev, name: e.target.value}))}
                  placeholder="ISP Company Name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person *</label>
                <Input
                  value={newCompany.contact_person_name}
                  onChange={(e) => setNewCompany(prev => ({...prev, contact_person_name: e.target.value}))}
                  placeholder="Admin Full Name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <Input
                  type="email"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany(prev => ({...prev, email: e.target.value}))}
                  placeholder="admin@company.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany(prev => ({...prev, phone: e.target.value}))}
                  placeholder="+254 xxx xxx xxx"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={newCompany.address}
                  onChange={(e) => setNewCompany(prev => ({...prev, address: e.target.value}))}
                  placeholder="Company address"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">County</label>
                <Input
                  value={newCompany.county}
                  onChange={(e) => setNewCompany(prev => ({...prev, county: e.target.value}))}
                  placeholder="County"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sub County</label>
                <Input
                  value={newCompany.sub_county}
                  onChange={(e) => setNewCompany(prev => ({...prev, sub_county: e.target.value}))}
                  placeholder="Sub County"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">KRA PIN</label>
                <Input
                  value={newCompany.kra_pin}
                  onChange={(e) => setNewCompany(prev => ({...prev, kra_pin: e.target.value}))}
                  placeholder="P051234567X"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">CA License</label>
                <Input
                  value={newCompany.ca_license_number}
                  onChange={(e) => setNewCompany(prev => ({...prev, ca_license_number: e.target.value}))}
                  placeholder="CA License Number"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">License Type</label>
                <Select value={newCompany.license_type} onValueChange={handleLicenseTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter (50 clients)</SelectItem>
                    <SelectItem value="professional">Professional (200 clients)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000 clients)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Limit</label>
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
                disabled={isProcessing}
                className="flex-1 flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                {isProcessing ? 'Creating...' : 'Create & Send Credentials'}
              </Button>
            </div>
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
                {companies?.map((company) => (
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
                        {company.license_type}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ISPCompanyLicenseManager;
