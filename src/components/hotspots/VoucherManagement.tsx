
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Ticket,
  Plus,
  Clock,
  Users,
  Wifi,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VoucherManagementProps {
  selectedHotspot: string | null;
}

const VoucherManagement: React.FC<VoucherManagementProps> = ({ selectedHotspot }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [bulkGenerate, setBulkGenerate] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    voucherType: 'time_based',
    durationMinutes: 60,
    dataLimitMb: 100,
    price: 50,
    maxDevices: 1,
    quantity: 1,
    expiryDays: 30
  });

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['hotspot-vouchers', selectedHotspot],
    queryFn: async () => {
      let query = supabase
        .from('hotspot_vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedHotspot) {
        query = query.eq('hotspot_id', selectedHotspot);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createVoucher = useMutation({
    mutationFn: async (voucherData: any) => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + voucherForm.expiryDays);

      const vouchers = [];
      for (let i = 0; i < voucherForm.quantity; i++) {
        const voucherCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        vouchers.push({
          voucher_code: voucherCode,
          isp_company_id: profile?.isp_company_id,
          generated_by: profile?.id,
          hotspot_id: selectedHotspot || 'default',
          voucher_type: voucherForm.voucherType,
          duration_minutes: voucherForm.voucherType === 'time_based' ? voucherForm.durationMinutes : undefined,
          data_limit_mb: voucherForm.voucherType === 'data_based' ? voucherForm.dataLimitMb : undefined,
          price: voucherForm.price,
          max_devices: voucherForm.maxDevices,
          expiry_date: expiryDate.toISOString()
        });
      }

      const { data, error } = await supabase
        .from('hotspot_vouchers')
        .insert(vouchers)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspot-vouchers'] });
      toast({
        title: "Success",
        description: `${voucherForm.quantity} voucher(s) created successfully`,
      });
      setShowCreateForm(false);
      setVoucherForm({
        voucherType: 'time_based',
        durationMinutes: 60,
        dataLimitMb: 100,
        price: 50,
        maxDevices: 1,
        quantity: 1,
        expiryDays: 30
      });
    },
    onError: (error) => {
      console.error('Error creating voucher:', error);
      toast({
        title: "Error",
        description: "Failed to create voucher",
        variant: "destructive",
      });
    }
  });

  const deleteVoucher = useMutation({
    mutationFn: async (voucherId: string) => {
      const { error } = await supabase
        .from('hotspot_vouchers')
        .delete()
        .eq('id', voucherId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspot-vouchers'] });
      toast({
        title: "Success",
        description: "Voucher deleted successfully",
      });
    }
  });

  const handleCreateVoucher = () => {
    createVoucher.mutate(voucherForm);
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case 'time_based': return 'Time Based';
      case 'data_based': return 'Data Based';
      case 'unlimited': return 'Unlimited';
      default: return type;
    }
  };

  const getStatusColor = (isUsed: boolean, expiryDate: string) => {
    if (isUsed) return 'bg-gray-500';
    if (new Date(expiryDate) < new Date()) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = (isUsed: boolean, expiryDate: string) => {
    if (isUsed) return 'Used';
    if (new Date(expiryDate) < new Date()) return 'Expired';
    return 'Active';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalVouchers = vouchers?.length || 0;
  const usedVouchers = vouchers?.filter(v => v.is_used).length || 0;
  const activeVouchers = vouchers?.filter(v => !v.is_used && new Date(v.expiry_date) > new Date()).length || 0;
  const totalRevenue = vouchers?.filter(v => v.is_used).reduce((sum, v) => sum + v.price, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Voucher Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage access vouchers for guest users
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Vouchers
        </Button>
      </div>

      {/* Voucher Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Vouchers</p>
                <p className="text-xl font-bold">{totalVouchers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Vouchers</p>
                <p className="text-xl font-bold">{activeVouchers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Used Vouchers</p>
                <p className="text-xl font-bold">{usedVouchers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold">KES {totalRevenue.toLocaleString()}</p>
              </div>
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
            <div className="flex items-center gap-2">
              <Switch
                checked={bulkGenerate}
                onCheckedChange={setBulkGenerate}
              />
              <span className="text-sm">Bulk Generate</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Voucher Type</label>
                <select
                  value={voucherForm.voucherType}
                  onChange={(e) => setVoucherForm({...voucherForm, voucherType: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="time_based">Time Based</option>
                  <option value="data_based">Data Based</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              {voucherForm.voucherType === 'time_based' && (
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={voucherForm.durationMinutes}
                    onChange={(e) => setVoucherForm({...voucherForm, durationMinutes: Number(e.target.value)})}
                  />
                </div>
              )}

              {voucherForm.voucherType === 'data_based' && (
                <div>
                  <label className="text-sm font-medium">Data Limit (MB)</label>
                  <Input
                    type="number"
                    value={voucherForm.dataLimitMb}
                    onChange={(e) => setVoucherForm({...voucherForm, dataLimitMb: Number(e.target.value)})}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Price (KES)</label>
                <Input
                  type="number"
                  value={voucherForm.price}
                  onChange={(e) => setVoucherForm({...voucherForm, price: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Max Devices</label>
                <Input
                  type="number"
                  value={voucherForm.maxDevices}
                  onChange={(e) => setVoucherForm({...voucherForm, maxDevices: Number(e.target.value)})}
                />
              </div>

              {bulkGenerate && (
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={voucherForm.quantity}
                    onChange={(e) => setVoucherForm({...voucherForm, quantity: Number(e.target.value)})}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Expiry (days)</label>
                <Input
                  type="number"
                  value={voucherForm.expiryDays}
                  onChange={(e) => setVoucherForm({...voucherForm, expiryDays: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCreateVoucher}
                disabled={createVoucher.isPending}
              >
                {createVoucher.isPending ? 'Creating...' : 'Create Vouchers'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vouchers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Vouchers</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {vouchers?.map((voucher) => (
          <Card key={voucher.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="font-mono text-lg font-bold">
                    {voucher.voucher_code}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getVoucherTypeLabel(voucher.voucher_type)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(voucher.is_used, voucher.expiry_date)}`} />
                      {getStatusText(voucher.is_used, voucher.expiry_date)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <p className="font-medium">KES {voucher.price}</p>
                    <p className="text-muted-foreground">
                      {voucher.voucher_type === 'time_based' && `${voucher.duration_minutes}min`}
                      {voucher.voucher_type === 'data_based' && `${voucher.data_limit_mb}MB`}
                      {voucher.voucher_type === 'unlimited' && 'Unlimited'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteVoucher.mutate(voucher.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 text-xs text-muted-foreground grid grid-cols-3 gap-4">
                <div>
                  Created: {new Date(voucher.created_at).toLocaleDateString()}
                </div>
                <div>
                  Expires: {new Date(voucher.expiry_date).toLocaleDateString()}
                </div>
                <div>
                  Max Devices: {voucher.max_devices}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!vouchers || vouchers.length === 0) && (
        <div className="text-center py-12">
          <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers created yet</h3>
          <p className="text-gray-500">
            Create vouchers to provide temporary access to your hotspot.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoucherManagement;
