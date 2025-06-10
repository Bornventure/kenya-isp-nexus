
export interface FormData {
  name: string;
  email: string;
  phone: string;
  mpesaNumber: string;
  idNumber: string;
  kraPinNumber: string;
  clientType: 'individual' | 'business' | 'corporate' | 'government';
  connectionType: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  servicePackage: string;
  address: string;
  county: string;
  subCounty: string;
}

export const validateForm = (formData: FormData): Record<string, string> => {
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) newErrors.name = 'Name is required';
  if (!formData.email.trim()) newErrors.email = 'Email is required';
  if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
  if (!formData.idNumber.trim()) newErrors.idNumber = 'ID Number is required';
  if (!formData.servicePackage) newErrors.servicePackage = 'Service package is required';
  if (!formData.address.trim()) newErrors.address = 'Address is required';
  if (!formData.subCounty) newErrors.subCounty = 'Sub-county is required';

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
  if (formData.clientType !== 'individual' && !formData.kraPinNumber.trim()) {
    newErrors.kraPinNumber = 'KRA PIN is required for business clients';
  }

  return newErrors;
};
