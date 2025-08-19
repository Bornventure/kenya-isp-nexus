import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, HardDrive, Plus } from 'lucide-react';

interface VoucherManagementProps {
  selectedHotspot: string | null;
}

const VoucherManagement: React.FC<VoucherManagementProps> = ({ selectedHotspot }) => {
  const [voucherType, setVoucherType] = useState('time_based');
  const [duration, setDuration] = useState('60');
  const [dataLimit, setDataLimit] = useState('1024');
  const [price, setPrice] = useState('50');
  const [quantity, setQuantity] = useState('10');

  const handleCreateVouchers = () => {
    console.log('Creating vouchers:', {
      type: voucherType,
      duration,
      dataLimit,
      price,
      quantity,
      hotspot: selectedHotspot
    });
  };

  // Sample voucher data
  const sampleVouchers = [
    { id: '1', code: 'WIFI-ABC123', type: 'time_based', duration: 60, used: false, created: '2024-01-15' },
    { id: '2', code: 'WIFI-XYZ789', type: 'data_based', dataLimit: 500, used: true, created: '2024-01-14' },
    { id: '3', code: 'WIFI-DEF456', type: 'time_based', duration: 120, used: false, created: '2024-01-13' },
  ];

  return (
    <div className="space-y-6">
      {/* Create Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voucher-type">Voucher Type</Label>
              <Select value={voucherType} onValueChange={setVoucherType}>
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

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {voucherType === 'time_based' && (
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                />
              </div>
            )}

            {voucherType === 'data_based' && (
              <div className="space-y-2">
                <Label htmlFor="data-limit">Data Limit (MB)</Label>
                <Input
                  id="data-limit"
                  type="number"
                  value={dataLimit}
                  onChange={(e) => setDataLimit(e.target.value)}
                  placeholder="1024"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="price">Price (KES)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50"
              />
            </div>
          </div>

          <Button onClick={handleCreateVouchers} className="w-full">
            <Ticket className="h-4 w-4 mr-2" />
            Create {quantity} Vouchers
          </Button>
        </CardContent>
      </Card>

      {/* Existing Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleVouchers.map((voucher) => (
              <div key={voucher.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{voucher.code}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {voucher.type === 'time_based' && (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{voucher.duration} minutes</span>
                        </>
                      )}
                      {voucher.type === 'data_based' && (
                        <>
                          <HardDrive className="h-3 w-3" />
                          <span>{voucher.dataLimit} MB</span>
                        </>
                      )}
                      <span>• Created {voucher.created}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={voucher.used ? 'secondary' : 'default'}>
                  {voucher.used ? 'Used' : 'Available'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherManagement;
