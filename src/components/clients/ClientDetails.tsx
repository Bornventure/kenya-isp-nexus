
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, CreditCard, Wifi, Calendar } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientDetailsProps {
  client: Client;
  onEdit?: () => void;
  onSuspend?: () => void;
  onActivate?: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onEdit, onSuspend, onActivate }) => {
  // Convert database client to display format
  const displayClient = {
    ...client,
    mpesaNumber: client.mpesa_number,
    idNumber: client.id_number,
    kraPinNumber: client.kra_pin_number,
    clientType: client.client_type,
    connectionType: client.connection_type,
    monthlyRate: client.monthly_rate,
    installationDate: client.installation_date || new Date().toISOString(),
    servicePackage: client.service_packages?.name || 'Unknown Package',
    location: {
      address: client.address,
      county: client.county,
      subCounty: client.sub_county,
      coordinates: client.latitude && client.longitude ? {
        lat: client.latitude,
        lng: client.longitude
      } : undefined
    },
    equipment: {
      router: client.equipment_assignments?.[0]?.equipment?.model || 'Not assigned',
      modem: 'Not assigned',
      serialNumbers: client.equipment_assignments?.map(eq => eq.equipment.serial_number) || []
    },
    lastPayment: undefined
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'disconnected':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'suspended': return 'Suspended';
      case 'pending': return 'Pending';
      case 'inactive': return 'Inactive';
      case 'disconnected': return 'Disconnected';
      case 'approved': return 'Approved';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{displayClient.name}</h2>
          <p className="text-gray-600">Client ID: {displayClient.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(displayClient.status)}>
            {getStatusText(displayClient.status)}
          </Badge>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit Client
              </Button>
            )}
            {displayClient.status === 'active' && onSuspend && (
              <Button variant="destructive" onClick={onSuspend}>
                Suspend
              </Button>
            )}
            {displayClient.status === 'suspended' && onActivate && (
              <Button onClick={onActivate}>
                Activate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Client Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="font-medium">{displayClient.phone}</p>
            </div>
            {displayClient.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="font-medium">{displayClient.email}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">ID Number</label>
              <p className="font-medium">{displayClient.idNumber}</p>
            </div>
            {displayClient.kraPinNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">KRA PIN</label>
                <p className="font-medium">{displayClient.kraPinNumber}</p>
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
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="font-medium">{displayClient.location.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">County</label>
              <p className="font-medium">{displayClient.location.county}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Sub County</label>
              <p className="font-medium">{displayClient.location.subCounty}</p>
            </div>
            {displayClient.location.coordinates && (
              <div>
                <label className="text-sm font-medium text-gray-500">Coordinates</label>
                <p className="font-medium text-xs">
                  {displayClient.location.coordinates.lat.toFixed(6)}, {displayClient.location.coordinates.lng.toFixed(6)}
                </p>
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
              <label className="text-sm font-medium text-gray-500">Package</label>
              <p className="font-medium">{displayClient.servicePackage}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Connection Type</label>
              <p className="font-medium capitalize">{displayClient.connectionType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Monthly Rate</label>
              <p className="font-medium">KES {displayClient.monthlyRate.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Client Type</label>
              <p className="font-medium capitalize">{displayClient.clientType}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">M-Pesa Number</label>
              <p className="font-medium">{displayClient.mpesaNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account Balance</label>
              <p className={`font-medium ${displayClient.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                KES {displayClient.balance.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Wallet Balance</label>
              <p className="font-medium">KES {displayClient.wallet_balance.toLocaleString()}</p>
            </div>
            {displayClient.lastPayment && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Payment</label>
                <p className="font-medium">
                  KES {displayClient.lastPayment.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{displayClient.lastPayment.date}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Router</label>
              <p className="font-medium">{displayClient.equipment?.router}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Modem</label>
              <p className="font-medium">{displayClient.equipment?.modem}</p>
            </div>
            {displayClient.equipment?.serialNumbers && displayClient.equipment.serialNumbers.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Serial Numbers</label>
                <div className="space-y-1">
                  {displayClient.equipment.serialNumbers.map((serial, index) => (
                    <p key={index} className="text-sm font-mono">{serial}</p>
                  ))}
                </div>
              </div>
            )}
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
            <div>
              <label className="text-sm font-medium text-gray-500">Installation Date</label>
              <p className="font-medium">
                {new Date(displayClient.installationDate).toLocaleDateString()}
              </p>
            </div>
            {displayClient.installation_status && (
              <div>
                <label className="text-sm font-medium text-gray-500">Installation Status</label>
                <p className="font-medium capitalize">{displayClient.installation_status}</p>
              </div>
            )}
            {displayClient.installation_completed_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Completed At</label>
                <p className="font-medium">
                  {new Date(displayClient.installation_completed_at).toLocaleDateString()}
                </p>
              </div>
            )}
            {displayClient.installation_completed_by && (
              <div>
                <label className="text-sm font-medium text-gray-500">Completed By</label>
                <p className="font-medium">{displayClient.installation_completed_by}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetails;
