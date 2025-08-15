
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import ClientRegistrationForm from './ClientRegistrationForm';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/types/client';

const ClientsManager: React.FC = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const { clients, isLoading } = useClients();

  const handleSaveClient = (clientData: Partial<Client>) => {
    console.log('Saving client:', clientData);
    setShowRegistrationForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Client Management</h2>
        </div>
        <Button onClick={() => setShowRegistrationForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{clients.length}</div>
              <div className="text-sm text-muted-foreground">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {clients.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {clients.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {clients.filter(c => c.status === 'suspended').length}
              </div>
              <div className="text-sm text-muted-foreground">Suspended</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client list would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No clients registered yet</p>
              <p className="text-sm">Click "Add Client" to register your first client</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </div>
                  <div className="text-sm capitalize">{client.status}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showRegistrationForm && (
        <ClientRegistrationForm
          onClose={() => setShowRegistrationForm(false)}
          onSave={handleSaveClient}
        />
      )}
    </div>
  );
};

export default ClientsManager;
