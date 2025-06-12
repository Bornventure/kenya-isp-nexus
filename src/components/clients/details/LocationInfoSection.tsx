
import React from 'react';
import { MapPin } from 'lucide-react';
import { Client } from '@/types/client';

interface LocationInfoSectionProps {
  client: Client;
}

const LocationInfoSection: React.FC<LocationInfoSectionProps> = ({ client }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Location Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="font-medium text-gray-600">Address</label>
          <p>{client.location.address}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">County</label>
          <p>{client.location.county}</p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Sub-County</label>
          <p>{client.location.subCounty}</p>
        </div>
        {client.location.coordinates && (
          <div>
            <label className="font-medium text-gray-600">Coordinates</label>
            <p>{client.location.coordinates.lat}, {client.location.coordinates.lng}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationInfoSection;
