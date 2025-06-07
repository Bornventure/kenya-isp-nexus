
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Wifi,
  CreditCard,
  Calendar,
  Edit,
  Ban,
  Play,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: Client['status']) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ 
  client, 
  onClose, 
  onEdit, 
  onStatusChange 
}) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'suspended':
        return <Ban className="h-4 w-4" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-semibold">{client.name}</CardTitle>
            <Badge className={`${getStatusColor(client.status)} gap-1`}>
              {getStatusIcon(client.status)}
              {client.status}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-600">Full Name</label>
                <p>{client.name}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Client Type</label>
                <p className="capitalize">{client.clientType}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Email</label>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {client.email}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Phone</label>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {client.phone}
                </p>
              </div>
              {client.mpesaNumber && (
                <div>
                  <label className="font-medium text-gray-600">M-Pesa Number</label>
                  <p>{client.mpesaNumber}</p>
                </div>
              )}
              <div>
                <label className="font-medium text-gray-600">ID Number</label>
                <p>{client.idNumber}</p>
              </div>
              {client.kraPinNumber && (
                <div>
                  <label className="font-medium text-gray-600">KRA PIN</label>
                  <p>{client.kraPinNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-600">Address</label>
                <p>{client.location.address}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">County</label>
                <p>{client.location.county}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Sub-County</label>
                <p>{client.location.subCounty}</p>
              </div>
              {client.location.coordinates && (
                <div>
                  <label className="font-medium text-gray-600">Coordinates</label>
                  <p>{client.location.coordinates.lat}, {client.location.coordinates.lng}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Service Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-600">Connection Type</label>
                <p className="capitalize">{client.connectionType}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Service Package</label>
                <p>{client.servicePackage}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Monthly Rate</label>
                <p className="font-semibold">{formatCurrency(client.monthlyRate)}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Installation Date</label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(client.installationDate)}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Current Balance</label>
                <p className={`font-semibold ${
                  client.balance < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(client.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Equipment Information */}
          {client.equipment && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Equipment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {client.equipment.router && (
                  <div>
                    <label className="font-medium text-gray-600">Router</label>
                    <p>{client.equipment.router}</p>
                  </div>
                )}
                {client.equipment.modem && (
                  <div>
                    <label className="font-medium text-gray-600">Modem</label>
                    <p>{client.equipment.modem}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="font-medium text-gray-600">Serial Numbers</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {client.equipment.serialNumbers.map((serial, index) => (
                      <Badge key={index} variant="outline">
                        {serial}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {client.lastPayment && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Last Payment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-600">Date</label>
                  <p>{formatDate(client.lastPayment.date)}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Amount</label>
                  <p className="font-semibold">{formatCurrency(client.lastPayment.amount)}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Method</label>
                  <p className="capitalize">{client.lastPayment.method}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Client
            </Button>
            
            {client.status === 'active' && (
              <Button 
                variant="outline" 
                onClick={() => onStatusChange('suspended')}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Ban className="h-4 w-4" />
                Suspend
              </Button>
            )}
            
            {(client.status === 'suspended' || client.status === 'pending') && (
              <Button 
                variant="outline" 
                onClick={() => onStatusChange('active')}
                className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
              >
                <Play className="h-4 w-4" />
                Activate
              </Button>
            )}
            
            {client.status !== 'disconnected' && (
              <Button 
                variant="outline" 
                onClick={() => onStatusChange('disconnected')}
                className="gap-2 text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                <AlertCircle className="h-4 w-4" />
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetails;
