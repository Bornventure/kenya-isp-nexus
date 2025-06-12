
import React from 'react';
import { Wifi, Calendar } from 'lucide-react';
import { Client } from '@/types/client';

interface ServiceInfoSectionProps {
  client: Client;
}

const ServiceInfoSection: React.FC<ServiceInfoSectionProps> = ({ client }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Wifi className="h-5 w-5" />
        Service Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <label className="font-medium text-gray-600">Connection Type</label>
          <p className="capitalize">{client.connectionType}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Service Package</label>
          <p>{client.servicePackage}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Monthly Rate</label>
          <p className="font-semibold">{formatCurrency(client.monthlyRate)}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Installation Date</label>
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            {formatDate(client.installationDate)}
          </p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Current Balance</label>
          <p className={`font-semibold ${
            client.balance < 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatCurrency(client.balance)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoSection;
