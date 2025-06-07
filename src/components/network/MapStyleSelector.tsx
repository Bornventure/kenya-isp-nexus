
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MapStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

const MapStyleSelector: React.FC<MapStyleSelectorProps> = ({ currentStyle, onStyleChange }) => {
  const mapStyles = [
    { id: 'mapbox://styles/mapbox/streets-v12', name: 'Streets' },
    { id: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite' },
    { id: 'mapbox://styles/mapbox/satellite-streets-v12', name: 'Hybrid' },
    { id: 'mapbox://styles/mapbox/light-v11', name: 'Light' },
    { id: 'mapbox://styles/mapbox/dark-v11', name: 'Dark' },
  ];

  return (
    <div className="absolute top-4 left-4 z-20">
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
