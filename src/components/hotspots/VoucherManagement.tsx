
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket, 
  Plus, 
  Download, 
  Search,
  Filter,
  QrCode,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface VoucherManagementProps {
  selectedHotspot: string | null;
}

interface HotspotVoucher {
  id: string;
  voucher_code: string;
  hotspot_id: string;
  voucher_type: string;
  duration_minutes: number | null;
  data_limit_mb: number | null;
  price: number;
  currency: string;
  is_used: boolean;
  used_at: string | null;
  used_by_mac: string | null;
  expiry_date: string | null;
  created_at: string;
  hotspots: {
    name: string;
    location: string;
  };
}

const VoucherManagement: React.FC<VoucherManagementProps> = ({ selectedHotspot }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newVoucher, setNewVoucher] = useState({
    voucher_type: 'time_based',
    duration_minutes: 60,
    data_limit_mb: 1000,
    price: 50,
    quantity: 1
  });

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['hotspot-vouchers', profile?.isp_company_id, selectedHotspot],
    queryFn: async () => {
      let query = supabase
        .from('hotspot_vouchers')
        .select(`
          *,
          hotspots (
            name,
            location
          )
        `)
        .eq('isp_company_id', profile?.isp_company_id)
        .order('created_at', { ascending: false });

      if (selectedHotspot) {
        query = query.eq('hotspot_id', selectedHotspot);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HotspotVoucher[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createVoucherMutation = useMutation({
    mutationFn: async (voucherData: any) => {
      if (!selectedHotspot) {
        throw new Error('Please select a hotspot first');
      }

      const vouchers = [];
      for (let i = 0; i < voucherData.quantity; i++) {
        const { data, error } = await supabase
          .from('hotspot_vouchers')
          .insert({
            ...voucherData,
            hotspot_id: selectedHotspot,
            isp_company_id: profile?.isp_company_id,
            voucher_code: `HOT${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          })
          .select()
          .single();

        if (error) throw error;
        vouchers.push(data);
      }
      return vouchers;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspot-vouchers'] });
      toast({
        title: "Success",
        description: `${newVoucher.quantity} voucher(s) created successfully`,
      });
      setShowCreateForm(false);
      setNewVoucher({
        voucher_type: 'time_based',
        duration_minutes: 60,
        data_limit_mb: 1000,
        price: 50,
        quantity: 1
      });
    },
    onError: (error) => {
      console.error('Error creating vouchers:', error);
      toast({
        title: "Error",
        description: "Failed to create vouchers",
        variant: "destructive",
      });
    }
  });

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.voucher_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'used' && voucher.is_used) ||
                         (statusFilter === 'unused' && !voucher.is_used);
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Unlimited';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDataLimit = (mb: number | null) => {
    if (!mb) return 'Unlimited';
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Voucher Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage access vouchers for hotspot guests
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={!selectedHotspot}>
          <Plus className="h-4 w-4 mr-2" />
          Create Vouchers
        </Button>
      </div>

      {!selectedHotspot && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-orange-800">
              Please select a hotspot from the Hotspots tab to manage vouchers.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vouchers</p>
                <p className="text-2xl font-bold">{vouchers.length}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Used Vouchers</p>
                <p className="text-2xl font-bold">{vouchers.filter(v => v.is_used).length}</p>
              </div>
              <QrCode className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{vouchers.filter(v => !v.is_used).length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  KES {vouchers.filter(v => v.is_used).reduce((sum, v) => sum + v.price, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Voucher Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Vouchers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Voucher Type</Label>
                <Select 
                  value={newVoucher.voucher_type} 
                  onValueChange={(value) => setNewVoucher({...newVoucher, voucher_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_based">Time Based</SelectItem>
                    <SelectItem value="data_based">Data Based</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newVoucher.quantity}
                  onChange={(e) => setNewVoucher({...newVoucher, quantity: parseInt(e.target.value) || 1})}
                  min="1"
                  max="100"
                />
              </div>

              {newVoucher.voucher_type !== 'unlimited' && (
                <>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newVoucher.duration_minutes}
                      onChange={(e) => setNewVoucher({...newVoucher, duration_minutes: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Data Limit (MB)</Label>
                    <Input
                      type="number"
                      value={newVoucher.data_limit_mb}
                      onChange={(e) => setNewVoucher({...newVoucher, data_limit_mb: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Price (KES)</Label>
                <Input
                  type="number"
                  value={newVoucher.price}
                  onChange={(e) => setNewVoucher({...newVoucher, price: parseFloat(e.target.value) || 0})}
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createVoucherMutation.mutate(newVoucher)}
                disabled={createVoucherMutation.isPending}
              >
                Create Vouchers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vouchers List */}
      <Card>
        <CardHeader>
          <CardTitle>Vouchers</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search voucher codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unused">Unused</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Data Limit</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Used At</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-xs">{voucher.voucher_code}</td>
                    <td className="p-2 capitalize">{voucher.voucher_type.replace('_', ' ')}</td>
                    <td className="p-2">{formatDuration(voucher.duration_minutes)}</td>
                    <td className="p-2">{formatDataLimit(voucher.data_limit_mb)}</td>
                    <td className="p-2">KES {voucher.price.toFixed(2)}</td>
                    <td className="p-2">
                      <Badge variant={voucher.is_used ? 'secondary' : 'default'}>
                        {voucher.is_used ? 'Used' : 'Available'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {voucher.used_at ? format(new Date(voucher.used_at), 'MMM dd, HH:mm') : '-'}
                    </td>
                  </tr>
                ))}
                {filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No vouchers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherManagement;
