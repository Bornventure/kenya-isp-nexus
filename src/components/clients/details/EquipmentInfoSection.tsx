
import React from 'react';
import { Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';

interface EquipmentInfoSectionProps {
  client: Client;
}

const EquipmentInfoSection: React.FC<EquipmentInfoSectionProps> = ({ client }) => {
  if (!client.equipment) return null;

  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Wifi className="h-5 w-5" />
        Equipment Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {client.equipment.router && (
          <div>
            <label className="font-medium text-gray-600">Router</label>
            <p>{client.equipment.router}</p>
          </div>
        )}
        {client.equipment.modem && (
          <div>
            <label className="font-medium text-gray-600">Modem</label>
            <p>{client.equipment.modem}</p>
          </div>
        )}
        <div className="md:col-span-2">
          <label className="font-medium text-gray-600">Serial Numbers</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {client.equipment.serialNumbers.map((serial, index) => (
              <Badge key={index} variant="outline">
                {serial}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentInfoSection;
