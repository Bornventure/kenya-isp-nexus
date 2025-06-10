
export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  mpesa_number: string;
  id_number: string;
  kra_pin_number: string;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  address: string;
  county: string;
  sub_county: string;
  service_package_id: string;
  isp_company_id: string;
}

export const validateCustomerForm = (formData: CustomerFormData): Record<string, string> => {
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) newErrors.name = 'Name is required';
  if (!formData.email.trim()) newErrors.email = 'Email is required';
  if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
  if (!formData.id_number.trim()) newErrors.id_number = 'ID Number is required';
  if (!formData.address.trim()) newErrors.address = 'Address is required';
  if (!formData.sub_county) newErrors.sub_county = 'Sub-county is required';

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
    newErrors.email = 'Invalid email format';
  }

  // Validate phone format
  const phoneRegex = /^\+254[0-9]{9}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    newErrors.phone = 'Phone must be in format +254XXXXXXXXX';
  }

  // Validate KRA PIN for business clients
  if (formData.client_type !== 'individual' && !formData.kra_pin_number.trim()) {
    newErrors.kra_pin_number = 'KRA PIN is required for business clients';
  }

  return newErrors;
};
