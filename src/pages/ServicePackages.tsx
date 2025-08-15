
import React from 'react';
import PackageManager from '@/components/packages/PackageManager';

const ServicePackages: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Service Packages</h1>
      <PackageManager />
    </div>
  );
};

export default ServicePackages;
