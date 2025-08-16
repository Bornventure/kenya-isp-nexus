
import React from 'react';
import ClientOnboardingWorkflow from './ClientOnboardingWorkflow';

const WorkflowDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Client Onboarding Workflow</h1>
      </div>
      <ClientOnboardingWorkflow />
    </div>
  );
};

export default WorkflowDashboard;
