
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MigrationRunner } from '@/components/admin/MigrationRunner';
import { useAuth } from '@/contexts/AuthContext';
import { AccessDenied } from '@/components/AccessDenied';

const DataMigration = () => {
  const { profile } = useAuth();

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'isp_admin')) {
    return <AccessDenied />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Migration</h1>
          <p className="text-gray-600 mt-2">
            Run data migrations to fix system inconsistencies and update records.
          </p>
        </div>
        
        <MigrationRunner />
      </div>
    </DashboardLayout>
  );
};

export default DataMigration;
