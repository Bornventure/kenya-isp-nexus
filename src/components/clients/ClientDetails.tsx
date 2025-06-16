
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useClients, DatabaseClient } from '@/hooks/useClients';
import { Client } from '@/types/client';
import PersonalInfoSection from './details/PersonalInfoSection';
import ServiceInfoSection from './details/ServiceInfoSection';
import PaymentInfoSection from './details/PaymentInfoSection';
import LocationInfoSection from './details/LocationInfoSection';
import EquipmentInfoSection from './details/EquipmentInfoSection';
import ClientActionButtons from './details/ClientActionButtons';
import AssignedEquipmentSection from './details/AssignedEquipmentSection';

// Helper function to transform DatabaseClient to Client
const transformDatabaseClientToClient = (dbClient: DatabaseClient): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  email: dbClient.email || '',
  phone: dbClient.phone,
  mpesaNumber: dbClient.mpesa_number || '',
  idNumber: dbClient.id_number,
  kraPinNumber: dbClient.kra_pin_number || '',
  clientType: dbClient.client_type as 'individual' | 'business' | 'corporate' | 'government',
  status: dbClient.status as 'active' | 'suspended' | 'disconnected' | 'pending',
  connectionType: dbClient.connection_type as 'fiber' | 'wireless' | 'satellite' | 'dsl',
  servicePackage: dbClient.service_packages?.name || `${dbClient.monthly_rate} KES/month`,
  monthlyRate: dbClient.monthly_rate,
  installationDate: dbClient.installation_date || '',
  location: {
    address: dbClient.address,
    county: dbClient.county,
    subCounty: dbClient.sub_county,
    coordinates: dbClient.latitude && dbClient.longitude ? {
      lat: dbClient.latitude,
      lng: dbClient.longitude,
    } : undefined,
  },
  balance: dbClient.balance,
  lastPayment: undefined, // TODO: Fetch from payments table
});

interface ClientDetailsProps {
  clientId?: string;
  onClose?: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ clientId: propClientId, onClose }) => {
  const { id: urlClientId } = useParams();
  const navigate = useNavigate();
  const { clients, isLoading, updateClient, deleteClient, isUpdating, isDeleting } = useClients();
  const [activeTab, setActiveTab] = useState('overview');

  // Use either the prop clientId or URL parameter
  const clientId = propClientId || urlClientId;

  const dbClient = clients.find(c => c.id === clientId);
  const client = dbClient ? transformDatabaseClientToClient(dbClient) : null;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Client not found</p>
          <Button onClick={onClose || (() => navigate('/clients'))} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const handleViewEquipment = (itemId: string) => {
    // Navigate to inventory with the specific item
    navigate(`/inventory?item=${itemId}`);
  };

  const handleEditClient = () => {
    // Navigate back to clients page to edit
    navigate('/clients');
  };

  const handleStatusChange = (newStatus: Client['status']) => {
    if (dbClient) {
      updateClient({
        id: dbClient.id,
        updates: { status: newStatus }
      });
    }
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    if (onClose) {
      onClose();
    } else {
      navigate('/clients');
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/clients');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">{client.email}</p>
          </div>
        </div>
        <ClientActionButtons 
          client={client} 
          onEdit={handleEditClient}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteClient}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalInfoSection client={client} />
            <ServiceInfoSection client={client} />
            <LocationInfoSection client={client} />
            <EquipmentInfoSection client={client} />
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <AssignedEquipmentSection
            clientId={client.id}
            clientName={client.name}
            onViewEquipment={handleViewEquipment}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <PaymentInfoSection client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
