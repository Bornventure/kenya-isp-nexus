
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 z-20">
      <Card className="shadow-md">
        <CardContent className="p-3">
          <h4 className="font-medium text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active Client</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Suspended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-8 bg-red-600 rounded-sm"></div>
              <span>Network Tower</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapLegend;
