
import React from 'react';
import ClientsManager from '@/components/clients/ClientsManager';

const Clients: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Client Management</h1>
      <ClientsManager />
    </div>
  );
};

export default Clients;
