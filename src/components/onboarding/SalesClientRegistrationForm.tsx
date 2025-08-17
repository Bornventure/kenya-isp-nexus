
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, User, MapPin, Package, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SalesClientRegistrationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SalesClientRegistrationForm: React.FC<SalesClientRegistrationFormProps> = ({ 
  onClose, 
  onSuccess 
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    address: '',
    county: '',
    sub_county: '',
    latitude: null as number | null,
    longitude: null as number | null,
    client_type: 'individual' as const,
    connection_type: 'fiber' as const,
    service_package_id: '',
    installation_date: new Date().toISOString().split('T')[0],
  });

  // Fetch service packages
  const { data: servicePackages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['service_packages', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('is_active', true)
        .order('monthly_rate');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.isp_company_id,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.isp_company_id) {
      toast({
        title: "Error",
        description: "Company information not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get service package details
      const selectedPackage = servicePackages.find(pkg => pkg.id === formData.service_package_id);
      if (!selectedPackage) {
        throw new Error('Service package not found');
      }

      // Create client record
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone,
          id_number: formData.id_number,
          kra_pin_number: formData.kra_pin_number || null,
          mpesa_number: formData.mpesa_number || formData.phone,
          address: formData.address,
          county: formData.county,
          sub_county: formData.sub_county,
          latitude: formData.latitude,
          longitude: formData.longitude,
          client_type: formData.client_type,
          connection_type: formData.connection_type,
          service_package_id: formData.service_package_id,
          monthly_rate: selectedPackage.monthly_rate,
          status: 'pending',
          balance: 0,
          wallet_balance: 0,
          is_active: false,
          installation_date: formData.installation_date,
          installation_status: 'pending',
          submitted_by: profile.id,
          isp_company_id: profile.isp_company_id,
          subscription_type: 'monthly'
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create workflow status
      const { error: workflowError } = await supabase
        .rpc('update_client_workflow_status', {
          p_client_id: newClient.id,
          p_stage: 'pending_approval',
          p_stage_data: { 
            submitted_by: profile.id,
            service_package_id: formData.service_package_id 
          },
          p_assigned_to: null,
          p_notes: 'New client registration submitted by sales team'
        });

      if (workflowError) {
        console.warn('Workflow status creation failed:', workflowError);
      }

      toast({
        title: "Success",
        description: "Client registered successfully and sent for approval.",
      });

      onSuccess();
      onClose();

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Register New Client</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <User className="h-5 w-5" />
                Personal Information
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="id_number">ID Number *</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => updateFormData('id_number', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="kra_pin_number">KRA PIN</Label>
                  <Input
                    id="kra_pin_number"
                    value={formData.kra_pin_number}
                    onChange={(e) => updateFormData('kra_pin_number', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="mpesa_number">M-Pesa Number</Label>
                  <Input
                    id="mpesa_number"
                    value={formData.mpesa_number}
                    onChange={(e) => updateFormData('mpesa_number', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <MapPin className="h-5 w-5" />
                Location Information
              </div>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="county">County *</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => updateFormData('county', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="sub_county">Sub County *</Label>
                  <Input
                    id="sub_county"
                    value={formData.sub_county}
                    onChange={(e) => updateFormData('sub_county', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Package className="h-5 w-5" />
                Service Information
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_type">Client Type</Label>
                  <Select value={formData.client_type} onValueChange={(value: any) => updateFormData('client_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="connection_type">Connection Type</Label>
                  <Select value={formData.connection_type} onValueChange={(value: any) => updateFormData('connection_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiber">Fiber</SelectItem>
                      <SelectItem value="wireless">Wireless</SelectItem>
                      <SelectItem value="dsl">DSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="service_package_id">Service Package *</Label>
                  <Select value={formData.service_package_id} onValueChange={(value) => updateFormData('service_package_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service package" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicePackages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - KES {pkg.monthly_rate.toLocaleString()}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="installation_date">Preferred Installation Date</Label>
                  <Input
                    id="installation_date"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => updateFormData('installation_date', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gap-2" 
                disabled={isSubmitting || packagesLoading || !formData.service_package_id}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Registering...' : 'Register Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesClientRegistrationForm;
