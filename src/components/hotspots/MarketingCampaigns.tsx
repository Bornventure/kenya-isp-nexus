
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Users, Mail } from 'lucide-react';

interface MarketingCampaignsProps {
  selectedHotspot: string | null;
}

const MarketingCampaigns: React.FC<MarketingCampaignsProps> = ({ selectedHotspot }) => {
  const campaigns = [
    {
      id: '1',
      name: 'Summer Promotion',
      type: 'Discount',
      status: 'active',
      reach: 1250,
      conversions: 185,
      progress: 75
    },
    {
      id: '2',
      name: 'Welcome Package',
      type: 'Onboarding',
      status: 'paused',
      reach: 850,
      conversions: 120,
      progress: 45
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Marketing Campaigns
            {selectedHotspot && (
              <Badge variant="outline">
                Hotspot: {selectedHotspot}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-muted-foreground">{campaign.type}</p>
                  </div>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{campaign.reach}</p>
                      <p className="text-xs text-muted-foreground">Reach</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{campaign.conversions}</p>
                      <p className="text-xs text-muted-foreground">Conversions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{Math.round((campaign.conversions / campaign.reach) * 100)}%</p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>
                </div>

                <Progress value={campaign.progress} className="mb-3" />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">
                    {campaign.status === 'active' ? 'Pause' : 'Resume'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Create targeted marketing campaigns for your hotspot users</p>
              <Button>Create Campaign</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingCampaigns;
