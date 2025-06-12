
import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Client } from '@/types/client';

interface PersonalInfoSectionProps {
  client: Client;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ client }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <User className="h-5 w-5" />
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <label className="font-medium text-gray-600">Full Name</label>
          <p>{client.name}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Client Type</label>
          <p className="capitalize">{client.clientType}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Email</label>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            {client.email}
          </p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Phone</label>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            {client.phone}
          </p>
        </div>
        {client.mpesaNumber && (
          <div>
            <label className="font-medium text-gray-600">M-Pesa Number</label>
            <p>{client.mpesaNumber}</p>
          </div>
        )}
        <div>
          <label className="font-medium text-gray-600">ID Number</label>
          <p>{client.idNumber}</p>
        </div>
        {client.kraPinNumber && (
          <div>
            <label className="font-medium text-gray-600">KRA PIN</label>
            <p>{client.kraPinNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
