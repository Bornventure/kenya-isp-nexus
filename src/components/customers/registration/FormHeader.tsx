
import React from 'react';
import { Mail } from 'lucide-react';

const FormHeader: React.FC = () => {
  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 text-blue-700">
        <Mail className="h-4 w-4" />
        <span className="font-medium">Account Creation</span>
      </div>
      <p className="text-sm text-blue-600 mt-1">
        Your login credentials will be sent to your email address after registration approval.
      </p>
    </div>
  );
};

export default FormHeader;
