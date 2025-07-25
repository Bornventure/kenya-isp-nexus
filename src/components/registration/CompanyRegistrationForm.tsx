import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Building2, Mail, Phone, MapPin, FileText, Send, DollarSign, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLicenseTypes } from '@/hooks/useLicenseTypes';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

interface CompanyRegistrationFormProps {
  onClose: () => void;
}

const CompanyRegistrationForm = ({ onClose }: CompanyRegistrationFormProps) => {
  const { data: licenseTypes, isLoading: licenseTypesLoading } = useLicenseTypes();
  
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person_name: '',
    email: '',
    phone: '',
    address: '',
    county: '',
    sub_county: '',
    kra_pin: '',
    ca_license_number: '',
    requested_license_type: '',
    business_description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const selectedLicenseType = licenseTypes?.find(lt => lt.name === formData.requested_license_type);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear any existing errors when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.company_name.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!formData.contact_person_name.trim()) {
      setError('Contact person name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!formData.requested_license_type) {
      setError('Please select a license type');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare the data with explicit null values for optional fields
      const insertData = {
        company_name: formData.company_name.trim(),
        contact_person_name: formData.contact_person_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        county: formData.county.trim() || null,
        sub_county: formData.sub_county.trim() || null,
        kra_pin: formData.kra_pin.trim() || null,
        ca_license_number: formData.ca_license_number.trim() || null,
        requested_license_type: formData.requested_license_type,
        business_description: formData.business_description.trim() || null,
        status: 'pending'
      };

      console.log('Submitting registration request with data:', insertData);

      // Use a direct insert without .select() to avoid potential RLS issues
      const { error: submitError } = await supabase
        .from('company_registration_requests')
        .insert([insertData]);

      if (submitError) {
        console.error('Supabase error:', submitError);
        throw new Error(submitError.message || 'Database error occurred');
      }

      console.log('Registration request submitted successfully');

      toast({
        title: "Registration Request Submitted",
        description: "Your company registration request has been submitted successfully. You will receive a response within 24-48 hours.",
      });

      onClose();
    } catch (err: any) {
      console.error('Registration submission error:', err);
      
      let errorMessage = 'Failed to submit registration request. Please try again.';
      
      // Provide more specific error messages
      if (err.message?.includes('duplicate key') || err.message?.includes('already exists')) {
        errorMessage = 'A registration request with this email already exists.';
      } else if (err.message?.includes('row-level security')) {
        errorMessage = 'Permission denied. Please contact support if this issue persists.';
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-gray-900 dark:text-gray-100">Company Registration Request</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Submit your ISP company details to request registration with DataDefender
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Building2 className="h-4 w-4" />
                  Company Name *
                </label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Your ISP Company Name"
                  required
                  disabled={loading}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person *</label>
                <Input
                  value={formData.contact_person_name}
                  onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
                  placeholder="Full Name"
                  required
                  disabled={loading}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@yourcompany.com"
                  required
                  disabled={loading}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+254 xxx xxx xxx"
                  disabled={loading}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4" />
                Business Address
              </label>
              <Textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street address, building, etc."
                rows={2}
                disabled={loading}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">County</label>
                <Input
                  value={formData.county}
                  onChange={(e) => handleInputChange('county', e.target.value)}
                  placeholder="County"
                  disabled={loading}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub-County</label>
                <Input
                  value={formData.sub_county}
                  onChange={(e) => handleInputChange('sub_county', e.target.value)}
                  placeholder="Sub-County"
                  disabled={loading}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">KRA PIN</label>
                <Input
                  value={formData.kra_pin}
                  onChange={(e) => handleInputChange('kra_pin', e.target.value)}
                  placeholder="P051234567X"
                  disabled={loading}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CA License Number</label>
                <Input
                  value={formData.ca_license_number}
                  onChange={(e) => handleInputChange('ca_license_number', e.target.value)}
                  placeholder="Communications Authority License"
                  disabled={loading}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested License Type *</label>
                <Select 
                  value={formData.requested_license_type} 
                  onValueChange={(value) => handleInputChange('requested_license_type', value)}
                  disabled={licenseTypesLoading || loading}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue 
                      placeholder={licenseTypesLoading ? "Loading..." : "Select license type"} 
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {licenseTypes?.map((licenseType) => (
                      <SelectItem 
                        key={licenseType.id} 
                        value={licenseType.name}
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex flex-col">
                          <span>{licenseType.display_name} ({licenseType.client_limit} clients)</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatKenyanCurrency(licenseType.price)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedLicenseType && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Selected Package Details</span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• Package: {selectedLicenseType.display_name}</p>
                  <p>• Client Limit: {selectedLicenseType.client_limit} clients</p>
                  <p>• Price: {formatKenyanCurrency(selectedLicenseType.price)} (excluding VAT)</p>
                  <p>• Total with VAT (16%): {formatKenyanCurrency(selectedLicenseType.price * 1.16)}</p>
                  {selectedLicenseType.description && (
                    <p>• {selectedLicenseType.description}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4" />
                Business Description
              </label>
              <Textarea
                value={formData.business_description}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
                placeholder="Brief description of your ISP services and coverage area..."
                rows={3}
                disabled={loading}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.requested_license_type || !formData.company_name || !formData.contact_person_name || !formData.email}
                className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyRegistrationForm;
