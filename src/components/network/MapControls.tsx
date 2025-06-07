
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Locate } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-white shadow-md"
        onClick={onZoomIn}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-white shadow-md"
        onClick={onZoomOut}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-white shadow-md"
        onClick={onReset}
      >
        <Locate className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapControls;
