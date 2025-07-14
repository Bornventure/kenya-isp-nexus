
import React from 'react';
import { Label } from '@/components/ui/label';
import { Wifi, Loader2 } from 'lucide-react';

interface ServiceInfoSectionProps {
  formData: any;
  isSubmitting: boolean;
  updateFormData: (field: string, value: string) => void;
}

const ServiceInfoSection: React.FC<ServiceInfoSectionProps> = ({
  formData,
  isSubmitting,
  updateFormData,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        Service Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="connection_type" className="text-gray-700 dark:text-gray-300">
            Connection Type
          </Label>
          <select
            id="connection_type"
            value={formData.connection_type}
            onChange={(e) => updateFormData('connection_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            disabled={isSubmitting}
          >
            <option value="fiber">Fiber Optic</option>
            <option value="wireless">Wireless</option>
            <option value="satellite">Satellite</option>
            <option value="dsl">DSL</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_package_id" className="text-gray-700 dark:text-gray-300">
            Service Package *
          </Label>
          <div className="relative">
            <select
              id="service_package_id"
              value={formData.service_package_id}
              onChange={(e) => updateFormData('service_package_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={isSubmitting}
            >
              <option value="">Select Package</option>
              <option value="basic">Basic - 10 Mbps (KES 2,500/month)</option>
              <option value="standard">Standard - 25 Mbps (KES 4,000/month)</option>
              <option value="premium">Premium - 50 Mbps (KES 6,500/month)</option>
              <option value="business">Business - 100 Mbps (KES 12,000/month)</option>
            </select>
            {isSubmitting && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          
          {formData.service_package_id && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Selected package details will be confirmed during installation.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Service Information</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Professional installation included</li>
          <li>• 24/7 technical support</li>
          <li>• No setup fees for fiber connections</li>
          <li>• Free equipment rental</li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceInfoSection;
