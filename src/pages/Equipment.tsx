
import React from 'react';
import EquipmentManager from '@/components/equipment/EquipmentManager';

const Equipment: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Equipment Management</h1>
      <EquipmentManager />
    </div>
  );
};

export default Equipment;
