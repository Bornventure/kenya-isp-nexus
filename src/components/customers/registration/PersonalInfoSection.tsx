
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User } from 'lucide-react';
import { CustomerFormData } from './formValidation';
import { clientTypes } from './constants';

interface PersonalInfoSectionProps {
  formData: CustomerFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  updateFormData: (field: string, value: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  errors,
  isSubmitting,
  updateFormData
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
          <Label htmlFor="client_type">Client Type</Label>
          <select
            id="client_type"
            value={formData.client_type}
            onChange={(e) => updateFormData('client_type', e.target.value)}
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
          <Label htmlFor="mpesa_number">M-Pesa Number</Label>
          <Input
            id="mpesa_number"
            placeholder="+254712345678 (optional)"
            value={formData.mpesa_number}
            onChange={(e) => updateFormData('mpesa_number', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="id_number">ID Number *</Label>
          <Input
            id="id_number"
            value={formData.id_number}
            onChange={(e) => updateFormData('id_number', e.target.value)}
            className={errors.id_number ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.id_number && <p className="text-sm text-red-500 mt-1">{errors.id_number}</p>}
        </div>
        {formData.client_type !== 'individual' && (
          <div>
            <Label htmlFor="kra_pin_number">KRA PIN Number *</Label>
            <Input
              id="kra_pin_number"
              value={formData.kra_pin_number}
              onChange={(e) => updateFormData('kra_pin_number', e.target.value)}
              className={errors.kra_pin_number ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.kra_pin_number && <p className="text-sm text-red-500 mt-1">{errors.kra_pin_number}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
