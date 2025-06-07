
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MapStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

const MapStyleSelector: React.FC<MapStyleSelectorProps> = ({ currentStyle, onStyleChange }) => {
  const mapStyles = [
    { 
      id: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
      name: 'Streets' 
    },
    { 
      id: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
      name: 'Satellite' 
    },
    { 
      id: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
      name: 'Terrain' 
    },
    { 
      id: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', 
      name: 'Light' 
    },
    { 
      id: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', 
      name: 'Dark' 
    },
  ];

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <Card className="shadow-md">
        <CardContent className="p-2">
          <div className="flex gap-1">
            {mapStyles.map((style) => (
              <Button
                key={style.id}
                size="sm"
                variant={currentStyle === style.id ? "default" : "outline"}
                onClick={() => onStyleChange(style.id)}
                className="text-xs"
              >
                {style.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapStyleSelector;
