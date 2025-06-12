
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calculator } from 'lucide-react';
import { calculateVAT, formatKenyanCurrency } from '@/utils/kenyanValidation';

const VATCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(16);

  const calculation = calculateVAT(amount, vatRate / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          VAT Calculator (Kenya)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Base Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <Label htmlFor="vatRate">VAT Rate (%)</Label>
            <Input
              id="vatRate"
              type="number"
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value) || 16)}
              placeholder="VAT rate"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Base Amount:</span>
            <span className="text-sm">{formatKenyanCurrency(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">VAT ({vatRate}%):</span>
            <span className="text-sm">{formatKenyanCurrency(calculation.vat)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold">Total Amount:</span>
            <span className="font-semibold">{formatKenyanCurrency(calculation.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VATCalculator;
