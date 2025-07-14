
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface PersonalInfoSectionProps {
  formData: any;
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        Personal Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
            Full Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
              errors.name ? 'border-red-500 dark:border-red-400' : ''
            }`}
            disabled={isSubmitting}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_type" className="text-gray-700 dark:text-gray-300">
            Client Type
          </Label>
          <select
            id="client_type"
            value={formData.client_type}
            onChange={(e) => updateFormData('client_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            disabled={isSubmitting}
          >
            <option value="individual">Individual</option>
            <option value="business">Business</option>
            <option value="organization">Organization</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
              errors.email ? 'border-red-500 dark:border-red-400' : ''
            }`}
            disabled={isSubmitting}
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
            Phone Number *
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
              errors.phone ? 'border-red-500 dark:border-red-400' : ''
            }`}
            disabled={isSubmitting}
            placeholder="+254712345678"
          />
          {errors.phone && <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mpesa_number" className="text-gray-700 dark:text-gray-300">
            M-Pesa Number
          </Label>
          <Input
            id="mpesa_number"
            value={formData.mpesa_number}
            onChange={(e) => updateFormData('mpesa_number', e.target.value)}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            disabled={isSubmitting}
            placeholder="+254712345678 (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_number" className="text-gray-700 dark:text-gray-300">
            ID Number *
          </Label>
          <Input
            id="id_number"
            value={formData.id_number}
            onChange={(e) => updateFormData('id_number', e.target.value)}
            className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
              errors.id_number ? 'border-red-500 dark:border-red-400' : ''
            }`}
            disabled={isSubmitting}
            placeholder="12345678"
          />
          {errors.id_number && <p className="text-sm text-red-600 dark:text-red-400">{errors.id_number}</p>}
        </div>

        {formData.client_type !== 'individual' && (
          <div className="space-y-2">
            <Label htmlFor="kra_pin_number" className="text-gray-700 dark:text-gray-300">
              KRA PIN Number *
            </Label>
            <Input
              id="kra_pin_number"
              value={formData.kra_pin_number}
              onChange={(e) => updateFormData('kra_pin_number', e.target.value)}
              className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                errors.kra_pin_number ? 'border-red-500 dark:border-red-400' : ''
              }`}
              disabled={isSubmitting}
              placeholder="P051234567X"
            />
            {errors.kra_pin_number && <p className="text-sm text-red-600 dark:text-red-400">{errors.kra_pin_number}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
