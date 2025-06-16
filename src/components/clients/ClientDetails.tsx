
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import PersonalInfoSection from './details/PersonalInfoSection';
import ServiceInfoSection from './details/ServiceInfoSection';
import PaymentInfoSection from './details/PaymentInfoSection';
import LocationInfoSection from './details/LocationInfoSection';
import EquipmentInfoSection from './details/EquipmentInfoSection';
import ClientActionButtons from './details/ClientActionButtons';
import AssignedEquipmentSection from './details/AssignedEquipmentSection';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, isLoading } = useClients();
  const [activeTab, setActiveTab] = useState('overview');

  const client = clients.find(c => c.id === id);

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
          <Button onClick={() => navigate('/clients')} className="mt-4">
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">{client.email}</p>
          </div>
        </div>
        <ClientActionButtons client={client} />
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
