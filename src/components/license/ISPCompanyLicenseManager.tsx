
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSuperAdminCompanies } from '@/hooks/useSuperAdminCompanies';
import { 
  Building2, 
  Users, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';

const ISPCompanyLicenseManager = () => {
  const { data: companies, isLoading, refetch } = useSuperAdminCompanies();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateLicense = async (companyId: string, updates: any) => {
    setIsUpdating(companyId);
    try {
      const { error } = await supabase
        .from('isp_companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "License Updated",
        description: "Company license has been updated successfully.",
      });

      refetch();
    } catch (error) {
      console.error('Error updating license:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update license. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = licenseFilter === 'all' || company.license_type === licenseFilter;
    return matchesSearch && matchesFilter;
  }) || [];

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-green-100 text-green-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Companies</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="license-filter">License Type</Label>
              <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company List */}
      <div className="grid gap-6">
        {filteredCompanies.map((company) => {
          const usagePercentage = company.client_limit > 0 
            ? (company.current_client_count / company.client_limit) * 100 
            : 0;

          return (
            <Card key={company.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {company.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getLicenseTypeColor(company.license_type)}>
                      {company.license_type}
                    </Badge>
                    {company.is_active ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <div className="text-gray-600">{company.email || 'Not set'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <div className="text-gray-600">{company.phone || 'Not set'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <div className="text-gray-600">
                      {company.county ? `${company.sub_county}, ${company.county}` : 'Not set'}
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Client Usage</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {company.current_client_count} / {company.client_limit}
                    </div>
                    <div className={`text-sm ${getUsageColor(usagePercentage)}`}>
                      {usagePercentage.toFixed(1)}% used
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-1">License Key</div>
                    <div className="text-xs font-mono bg-white p-2 rounded border">
                      {company.license_key.slice(0, 8)}...{company.license_key.slice(-8)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-1">Subscription</div>
                    <div className="text-sm">
                      {company.subscription_end_date 
                        ? `Expires: ${new Date(company.subscription_end_date).toLocaleDateString()}`
                        : 'No expiry set'
                      }
                    </div>
                  </div>
                </div>

                {/* License Management */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">License Management</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>License Type</Label>
                      <Select
                        value={company.license_type}
                        onValueChange={(value) => handleUpdateLicense(company.id, { license_type: value })}
                        disabled={isUpdating === company.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Client Limit</Label>
                      <Input
                        type="number"
                        value={company.client_limit}
                        onChange={(e) => {
                          const newLimit = parseInt(e.target.value);
                          if (!isNaN(newLimit) && newLimit > 0) {
                            handleUpdateLicense(company.id, { client_limit: newLimit });
                          }
                        }}
                        disabled={isUpdating === company.id}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant={company.is_active ? "destructive" : "default"}
                        onClick={() => handleUpdateLicense(company.id, { is_active: !company.is_active })}
                        disabled={isUpdating === company.id}
                        className="w-full"
                      >
                        {company.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newKey = `lic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                          handleUpdateLicense(company.id, { license_key: newKey });
                        }}
                        disabled={isUpdating === company.id}
                        className="w-full"
                      >
                        Regenerate Key
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ISPCompanyLicenseManager;
