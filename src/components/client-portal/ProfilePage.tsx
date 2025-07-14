
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Phone, Mail, CreditCard, Calendar, Save } from 'lucide-react';
import { format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { client, refreshClientData } = useClientAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    mpesa_number: client?.mpesa_number || '',
    address: client?.location?.address || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-client-profile', {
        body: {
          client_email: client.email,
          client_id_number: client.id_number,
          updates: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            mpesa_number: formData.mpesa_number,
            address: formData.address,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        
        // Refresh client data to get updated information
        await refreshClientData();
      } else {
        throw new Error(data?.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0712345678"
                />
              </div>

              <div>
                <Label htmlFor="mpesa_number">M-Pesa Number</Label>
                <Input
                  id="mpesa_number"
                  value={formData.mpesa_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, mpesa_number: e.target.value }))}
                  placeholder="0712345678"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Your physical address"
                />
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Account ID:</span>
                <span className="text-sm text-muted-foreground">#{client.id.slice(0, 8)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">ID Number:</span>
                <span className="text-sm text-muted-foreground">{client.id_number}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  client.status === 'active' ? 'bg-green-100 text-green-800' :
                  client.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {client.status?.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Package:</span>
                <span className="text-sm text-muted-foreground">
                  {client.service_package?.name || 'Not assigned'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Monthly Rate:</span>
                <span className="text-sm text-muted-foreground">
                  KES {client.monthly_rate?.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.subscription_start_date && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Started:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(client.subscription_start_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              
              {client.subscription_end_date && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Expires:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(client.subscription_end_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              
              {client.installation_date && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Installed:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(client.installation_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">Address:</div>
                <div className="text-muted-foreground">{client.location?.address}</div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium">Location:</div>
                <div className="text-muted-foreground">
                  {client.location?.sub_county}, {client.location?.county}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
