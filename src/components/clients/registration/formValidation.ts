
export interface FormData {
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  kraPinNumber: string;
  mpesaNumber: string;
  address: string;
  county: string;
  subCounty: string;
  latitude?: number;
  longitude?: number;
  servicePackage: string;
  monthlyRate: number;
  connectionType: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  clientType: 'individual' | 'business' | 'corporate' | 'government';
  installationDate?: string;
}

export const validateClientForm = (formData: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.name?.trim()) errors.name = 'Name is required';
  if (!formData.phone?.trim()) errors.phone = 'Phone is required';
  if (!formData.idNumber?.trim()) errors.idNumber = 'ID number is required';
  if (!formData.address?.trim()) errors.address = 'Address is required';
  if (!formData.county?.trim()) errors.county = 'County is required';
  if (!formData.subCounty?.trim()) errors.subCounty = 'Sub county is required';
  if (!formData.servicePackage) errors.servicePackage = 'Service package is required';

  if (formData.clientType !== 'individual' && !formData.kraPinNumber?.trim()) {
    errors.kraPinNumber = 'KRA PIN is required for business entities';
  }

  return errors;
};
