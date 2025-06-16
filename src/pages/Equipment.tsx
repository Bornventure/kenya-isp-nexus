
import React from 'react';
import EquipmentActions from '@/components/equipment/EquipmentActions';

const Equipment = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Equipment Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage network equipment, SNMP configuration, and approval workflow
        </p>
      </div>
      
      <EquipmentActions />
    </div>
  );
};

export default Equipment;
