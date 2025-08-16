import React, { useState, useEffect } from 'react';
import { useClients, DatabaseClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2 } from 'lucide-react';
import ClientForm from './ClientForm';
import { Client, ClientStatus } from '@/types/client';

interface ClientRowProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientRow: React.FC<ClientRowProps> = ({ client, onEdit, onDelete }) => {
  return (
    <TableRow key={client.id}>
      <TableCell className="font-medium">{client.name}</TableCell>
      <TableCell>{client.email}</TableCell>
      <TableCell>{client.phone}</TableCell>
      <TableCell>{client.clientType}</TableCell>
      <TableCell>{client.status}</TableCell>
      <TableCell className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(client)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(client.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
};

interface ClientsManagerProps {
}

const ClientsManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { clients, isLoading, error, createClient, updateClient, deleteClient } = useClients();

  useEffect(() => {
    if (error) {
      console.error("Error fetching clients:", error);
    }
  }, [error]);

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      deleteClient(id);
    }
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    // Convert Client to DatabaseClient format
    const databaseClient: Partial<DatabaseClient> = {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      id_number: clientData.idNumber,
      kra_pin_number: clientData.kraPinNumber,
      mpesa_number: clientData.mpesaNumber,
      client_type: clientData.clientType,
      status: clientData.status as 'active' | 'suspended' | 'disconnected' | 'pending' | 'approved',
      connection_type: clientData.connectionType,
      service_package_id: clientData.servicePackage,
      monthly_rate: clientData.monthlyRate,
      balance: clientData.balance,
      installation_date: clientData.installationDate,
      address: clientData.location?.address,
      county: clientData.location?.county,
      sub_county: clientData.location?.subCounty,
      latitude: clientData.location?.coordinates?.lat || null,
      longitude: clientData.location?.coordinates?.lng || null,
    };

    if (selectedClient) {
      updateClient({ id: selectedClient.id, updates: databaseClient });
    } else {
      const newClient = {
        ...databaseClient,
        subscription_start_date: '',
        subscription_end_date: '',
        subscription_type: 'monthly',
        wallet_balance: 0,
        isp_company_id: '',
        approved_at: '',
        approved_by: '',
        notes: null,
        rejection_reason: null,
        rejected_at: null,
        rejected_by: null,
        installation_status: 'pending',
        submitted_by: 'sales'
      } as Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>;
      
      createClient(newClient);
    }
    setSelectedClient(null);
    setIsFormOpen(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clients Manager</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p>Loading clients...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Client Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isFormOpen && (
        <ClientForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedClient(null);
          }}
          onSave={handleSaveClient}
          initialClient={selectedClient}
        />
      )}
    </div>
  );
};

export default ClientsManager;
