
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, CreditCard, Wifi, Calendar, User, Building } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientDetailsProps {
  client: Client;
  onEdit?: () => void;
  onStatusChange?: (status: Client['status']) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onEdit, onStatusChange }) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const handleStatusChange = (newStatus: Client['status']) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(client.status)}>
              {client.status}
            </Badge>
            {client.client_type && (
              <Badge variant="outline" className="capitalize">
                {client.client_type.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button onClick={onEdit} variant="outline">
              Edit Client
            </Button>
          )}
          {client.status === 'pending' && onStatusChange && (
            <Button onClick={() => handleStatusChange('approved')}>
              Approve
            </Button>
          )}
        </div>
      </div>

      {/* Client Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{client.phone}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{client.email}</span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              <span className="font-medium">ID Number:</span> {client.id_number}
            </div>
            {client.kra_pin_number && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">KRA PIN:</span> {client.kra_pin_number}
              </div>
            )}
            {client.mpesa_number && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">M-Pesa:</span> {client.mpesa_number}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="font-medium">{client.address}</div>
              <div className="text-sm text-gray-600">
                {client.sub_county}, {client.county}
              </div>
            </div>
            {client.latitude && client.longitude && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Coordinates:</span> {client.latitude}, {client.longitude}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="font-medium">{client.service_packages?.name || 'N/A'}</div>
              <div className="text-sm text-gray-600">
                Speed: {client.service_packages?.speed || 'N/A'}
              </div>
            </div>
            <div className="text-sm">
              <span className="font-medium">Connection:</span> {client.connection_type}
            </div>
            <div className="text-sm">
              <span className="font-medium">Monthly Rate:</span> {formatCurrency(client.monthly_rate)}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Balance:</span>
              <span className={`text-sm font-bold ${client.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(client.balance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Wallet:</span>
              <span className="text-sm">{formatCurrency(client.wallet_balance || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Installation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Installation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.installation_date && (
              <div className="text-sm">
                <span className="font-medium">Date:</span> {new Date(client.installation_date).toLocaleDateString()}
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">Status:</span> {client.installation_status || 'N/A'}
            </div>
            {client.service_activated_at && (
              <div className="text-sm">
                <span className="font-medium">Activated:</span> {new Date(client.service_activated_at).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.equipment_assignments && client.equipment_assignments.length > 0 ? (
              <div className="space-y-2">
                {client.equipment_assignments.map((assignment, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{assignment.equipment.model}</div>
                    <div className="text-gray-600">SN: {assignment.equipment.serial_number}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No equipment assigned</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetails;
