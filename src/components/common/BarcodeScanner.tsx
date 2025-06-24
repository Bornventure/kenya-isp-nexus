
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  placeholder?: string;
  label?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeScanned,
  placeholder = "Scan or enter barcode...",
  label = "Barcode"
}) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [inputMethod, setInputMethod] = useState<'scan' | 'manual'>('scan');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleBarcodeInput = (value: string) => {
    setBarcode(value);
    // Simulate barcode scanning (in real implementation, this would integrate with a camera library)
    if (value.length >= 8) { // Minimum barcode length
      onBarcodeScanned(value);
      toast({
        title: "Barcode Scanned",
        description: `Successfully scanned: ${value}`,
      });
    }
  };

  const simulateBarcodeScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      const mockBarcode = `BC${Date.now().toString().slice(-8)}`;
      setBarcode(mockBarcode);
      handleBarcodeInput(mockBarcode);
      setIsScanning(false);
    }, 2000);
  };

  const handleManualSubmit = () => {
    if (barcode.trim()) {
      onBarcodeScanned(barcode.trim());
      toast({
        title: "Barcode Added",
        description: `Barcode: ${barcode.trim()}`,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scan className="h-5 w-5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={inputMethod === 'scan' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMethod('scan')}
          >
            <Scan className="h-4 w-4 mr-2" />
            Scan
          </Button>
          <Button
            type="button"
            variant={inputMethod === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMethod('manual')}
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Manual
          </Button>
        </div>

        {inputMethod === 'scan' ? (
          <div className="space-y-3">
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              {isScanning ? (
                <div className="space-y-2">
                  <div className="animate-pulse">
                    <Scan className="h-12 w-12 mx-auto text-blue-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">Scanning...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Scan className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-sm text-muted-foreground">Click to start scanning</p>
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={simulateBarcodeScan}
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? 'Scanning...' : 'Start Barcode Scan'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="manual-barcode">Enter Barcode Manually</Label>
              <Input
                id="manual-barcode"
                ref={inputRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              onClick={handleManualSubmit}
              disabled={!barcode.trim()}
              className="w-full"
            >
              Add Barcode
            </Button>
          </div>
        )}

        {barcode && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Scan className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Scanned:</span>
              <code className="text-green-700">{barcode}</code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
