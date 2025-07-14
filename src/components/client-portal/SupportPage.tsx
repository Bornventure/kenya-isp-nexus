
import React from 'react';
import SupportTicketForm from './SupportTicketForm';
import SupportTicketsList from './SupportTicketsList';

const SupportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Support Center</h2>
        <p className="text-muted-foreground">
          Submit support tickets and track their progress
        </p>
      </div>

      <SupportTicketForm />
      <SupportTicketsList />
    </div>
  );
};

export default SupportPage;
