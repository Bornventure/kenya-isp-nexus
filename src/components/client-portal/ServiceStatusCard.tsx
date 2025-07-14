
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  MapPin, 
  Calendar, 
  DollarSign,
  Signal,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceStatusCardProps {
  client: {
    status: string;
    monthly_rate: number;
    subscription_type: string;
    installation_date: string | null;
    subscription_start_date: string | null;
    location: {
      address: string;
      county: string;
      sub_county: string;
    };
    service_package: any;
  };
}

const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({ client }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Service Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Status</span>
          <Badge className={cn('border', getStatusColor(client.status))}>
            {client.status?.toUpperCase()}
          </Badge>
        </div>

        {/* Service Package */}
        {client.service_package && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Package</span>
            <div className="text-right">
              <div className="text-sm font-medium">{client.service_package.name}</div>
              <div className="text-xs text-gray-500">{client.service_package.speed}</div>
            </div>
          </div>
        )}

        {/* Monthly Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Monthly Rate
          </span>
          <span className="text-sm font-medium">{formatCurrency(client.monthly_rate)}</span>
        </div>

        {/* Subscription Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Billing Cycle
          </span>
          <span className="text-sm font-medium capitalize">{client.subscription_type}</span>
        </div>

        {/* Installation Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Installed
          </span>
          <span className="text-sm">{formatDate(client.installation_date)}</span>
        </div>

        {/* Service Start */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Signal className="h-4 w-4" />
            Service Started
          </span>
          <span className="text-sm">{formatDate(client.subscription_start_date)}</span>
        </div>

        {/* Location */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600 mb-1">Service Location</div>
              <div className="text-sm text-gray-700">
                <div>{client.location.address}</div>
                <div>{client.location.sub_county}, {client.location.county}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceStatusCard;
