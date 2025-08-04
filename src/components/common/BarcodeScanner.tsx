
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Keyboard, Camera, StopCircle } from 'lucide-react';
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleBarcodeInput = (value: string) => {
    setBarcode(value);
    if (value.length >= 8) { // Minimum barcode length
      onBarcodeScanned(value);
      toast({
        title: "Barcode Scanned",
        description: `Successfully scanned: ${value}`,
      });
    }
  };

  const startCameraScanning = async () => {
    try {
      setIsScanning(true);
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      toast({
        title: "Camera Started",
        description: "Position barcode in front of camera. Tap to capture when focused.",
      });

    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access or use manual input.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopCameraScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const captureBarcode = () => {
    // Since we don't have a barcode library, we'll simulate capture
    // In a real implementation, you'd use a library like ZXing or QuaggaJS
    const mockBarcode = `BC${Date.now().toString().slice(-8)}`;
    setBarcode(mockBarcode);
    handleBarcodeInput(mockBarcode);
    stopCameraScanning();
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
            <Camera className="h-4 w-4 mr-2" />
            Camera Scan
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
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              {isScanning && stream ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-red-500 w-64 h-32 bg-transparent opacity-50"></div>
                  </div>
                  <Button
                    type="button"
                    onClick={captureBarcode}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                  >
                    Capture Barcode
                  </Button>
                </div>
              ) : (
                <div className="text-center p-6 h-64 flex flex-col justify-center">
                  {isScanning ? (
                    <div className="space-y-2">
                      <div className="animate-pulse">
                        <Scan className="h-12 w-12 mx-auto text-blue-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">Starting camera...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-sm text-muted-foreground">Click to start camera scanning</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isScanning ? (
                <>
                  <Button
                    type="button"
                    onClick={startCameraScanning}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera Scan
                  </Button>
                  <Button
                    type="button"
                    onClick={simulateBarcodeScan}
                    variant="outline"
                    className="flex-1"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Simulate Scan
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={stopCameraScanning}
                  variant="destructive"
                  className="w-full"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              )}
            </div>
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
