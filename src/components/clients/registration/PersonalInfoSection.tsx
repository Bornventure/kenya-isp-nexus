
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { FormData } from './formValidation';
import { clientTypes } from './formConstants';

interface PersonalInfoSectionProps {
  formData: FormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  updateFormData: (field: string, value: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  errors,
  isSubmitting,
  updateFormData,
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <User className="h-5 w-5" />
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="clientType">Client Type</Label>
          <select
            id="clientType"
            value={formData.clientType}
            onChange={(e) => updateFormData('clientType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          >
            {clientTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            placeholder="+254712345678"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="mpesaNumber">M-Pesa Number</Label>
          <Input
            id="mpesaNumber"
            placeholder="+254712345678 (optional)"
            value={formData.mpesaNumber}
            onChange={(e) => updateFormData('mpesaNumber', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="idNumber">ID Number *</Label>
          <Input
            id="idNumber"
            value={formData.idNumber}
            onChange={(e) => updateFormData('idNumber', e.target.value)}
            className={errors.idNumber ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.idNumber && <p className="text-sm text-red-500 mt-1">{errors.idNumber}</p>}
        </div>
        {formData.clientType !== 'individual' && (
          <div>
            <Label htmlFor="kraPinNumber">KRA PIN Number *</Label>
            <Input
              id="kraPinNumber"
              value={formData.kraPinNumber}
              onChange={(e) => updateFormData('kraPinNumber', e.target.value)}
              className={errors.kraPinNumber ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.kraPinNumber && <p className="text-sm text-red-500 mt-1">{errors.kraPinNumber}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
