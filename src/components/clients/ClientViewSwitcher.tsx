
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Grid, List, Map } from 'lucide-react';

export type ViewMode = 'list' | 'grid' | 'map';

interface ClientViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ClientViewSwitcher: React.FC<ClientViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'list' as ViewMode, icon: List, label: 'List' },
    { id: 'grid' as ViewMode, icon: Grid, label: 'Grid' },
    { id: 'map' as ViewMode, icon: Map, label: 'Map' },
  ];

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium mr-2">View:</span>
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <Button
                key={view.id}
                size="sm"
                variant={currentView === view.id ? "default" : "outline"}
                onClick={() => onViewChange(view.id)}
                className="gap-1"
              >
                <Icon className="h-4 w-4" />
                {view.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientViewSwitcher;
