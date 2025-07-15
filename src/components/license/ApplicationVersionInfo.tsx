
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, Hash, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';

const ApplicationVersionInfo: React.FC = () => {
  const { profile } = useAuth();
  const { validation } = useLicenseValidation();

  // Application version
  const APP_VERSION = "1.2.0";

  // Format company ID for display
  const formatCompanyId = (id: string) => {
    if (!id) return 'N/A';
    return `id: ${id.substring(0, 8)} ${id.substring(8, 16)}`;
  };

  // Get activation date (using subscription end date as reference)
  const getActivationInfo = () => {
    if (!profile?.isp_company_id) return null;
    
    // For demo purposes, using current date as activation date
    // In real implementation, this would come from license activation records
    const activationDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return activationDate;
  };

  // Get "Active until" date
  const getActiveUntilDate = () => {
    if (!validation.expiryDate) return 'Unlimited';
    
    return new Date(validation.expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!profile?.isp_company_id) {
    return null;
  }

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Shield className="h-5 w-5" />
          License Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              Version {APP_VERSION}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-gray-600" />
            <span className="font-mono text-gray-700">
              {formatCompanyId(profile.isp_company_id)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">
              Activated: {getActivationInfo()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">
              Active until: {getActiveUntilDate()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationVersionInfo;
