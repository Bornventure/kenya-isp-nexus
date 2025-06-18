
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Ticket,
  Plus,
  Search,
  Download,
  Eye,
  Copy,
  Clock,
  DollarSign,
  Users,
  Wifi
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface HotspotVoucher {
  id: string;
  hotspot_id: string;
  voucher_code: string;
  voucher_type: 'time_based' | 'data_based' | 'unlimited';
  duration_minutes?: number;
  data_limit_mb?: number;
  price: number;
  currency: string;
  max_devices: number;
  expiry_date?: string;
  is_used: boolean;
  used_at?: string;
  used_by_mac?: string;
  payment_reference?: string;
  mpesa_receipt_number?: string;
  generated_by?: string;
  isp_company_id?: string;
  created_at: string;
  hotspots?: { name: string; location: string };
}

interface VoucherManagementProps {
  selectedHotspot: string | null;
}

const VoucherManagement: React.FC<VoucherManagementProps> = ({ selectedHotspot }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['hotspot-vouchers', profile?.isp_company_id, selectedHotspot],
    queryFn: async () => {
      let query = supabase
        .from('hotspot_vouchers')
        .select(`
          *,
          hotspots!inner(name, location)
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
    mutationFn: async (voucherData: {
      hotspot_id: string;
      voucher_type: string;
      duration_minutes?: number;
      data_limit_mb?: number;
      price: number;
      max_devices: number;
      expiry_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('hotspot_vouchers')
        .insert({
          ...voucherData,
          isp_company_id: profile?.isp_company_id,
          generated_by: profile?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspot-vouchers'] });
      toast({
        title: "Success",
        description: "Voucher created successfully",
      });
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create voucher",
        variant: "destructive",
      });
      console.error('Error creating voucher:', error);
    },
  });

  const filteredVouchers = vouchers?.filter(voucher => {
    const matchesSearch = 
      voucher.voucher_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.hotspots?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !voucher.is_used && (!voucher.expiry_date || new Date(voucher.expiry_date) > new Date())) ||
      (statusFilter === 'used' && voucher.is_used) ||
      (statusFilter === 'expired' && voucher.expiry_date && new Date(voucher.expiry_date) <= new Date() && !voucher.is_used);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getVoucherStatus = (voucher: HotspotVoucher) => {
    if (voucher.is_used) return { status: 'used', color: 'bg-gray-100 text-gray-800' };
    if (voucher.expiry_date && new Date(voucher.expiry_date) <= new Date()) {
      return { status: 'expired', color: 'bg-red-100 text-red-800' };
    }
    return { status: 'active', color: 'bg-green-100 text-green-800' };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Voucher code copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Voucher Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage WiFi access vouchers for guest users
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Voucher</DialogTitle>
            </DialogHeader>
            <VoucherCreateForm 
              onSubmit={(data) => createVoucherMutation.mutate(data)}
              selectedHotspot={selectedHotspot}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by voucher code, hotspot, or payment reference..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Vouchers List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredVouchers.map((voucher) => {
          const voucherStatus = getVoucherStatus(voucher);
          
          return (
            <Card key={voucher.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Ticket className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-lg">{voucher.voucher_code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(voucher.voucher_code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Badge className={voucherStatus.color}>
                          {voucherStatus.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{voucher.hotspots?.name}</span>
                        <span>Type: {voucher.voucher_type.replace('_', ' ')}</span>
                        {voucher.duration_minutes && (
                          <span>{voucher.duration_minutes} min</span>
                        )}
                        {voucher.data_limit_mb && (
                          <span>{voucher.data_limit_mb} MB</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 text-lg font-medium">
                      <DollarSign className="h-4 w-4" />
                      <span>{voucher.currency} {voucher.price}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Created {format(new Date(voucher.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    {voucher.used_at && (
                      <div className="text-sm text-muted-foreground">
                        Used {format(new Date(voucher.used_at), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVouchers.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No vouchers match your search criteria.' : 'Create your first voucher to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Voucher
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const VoucherCreateForm: React.FC<{
  onSubmit: (data: any) => void;
  selectedHotspot: string | null;
}> = ({ onSubmit, selectedHotspot }) => {
  const [formData, setFormData] = useState({
    hotspot_id: selectedHotspot || '',
    voucher_type: 'time_based',
    duration_minutes: 60,
    data_limit_mb: 1024,
    price: 10,
    max_devices: 1,
    expiry_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Voucher Type</Label>
        <Select value={formData.voucher_type} onValueChange={(value) => setFormData({...formData, voucher_type: value})}>
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

      {formData.voucher_type === 'time_based' && (
        <div>
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
          />
        </div>
      )}

      {formData.voucher_type === 'data_based' && (
        <div>
          <Label>Data Limit (MB)</Label>
          <Input
            type="number"
            value={formData.data_limit_mb}
            onChange={(e) => setFormData({...formData, data_limit_mb: parseInt(e.target.value)})}
          />
        </div>
      )}

      <div>
        <Label>Price (KES)</Label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
        />
      </div>

      <div>
        <Label>Max Devices</Label>
        <Input
          type="number"
          value={formData.max_devices}
          onChange={(e) => setFormData({...formData, max_devices: parseInt(e.target.value)})}
        />
      </div>

      <Button type="submit" className="w-full">
        Create Voucher
      </Button>
    </form>
  );
};

export default VoucherManagement;
