
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Megaphone,
  Target,
  Calendar,
  Users,
  TrendingUp,
  Mail,
  MessageSquare,
  Share2,
  BarChart3,
  Settings,
  Play,
  Pause,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'portal_banner';
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetAudience: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  conversions: number;
  budget: number;
  spent: number;
}

interface MarketingCampaignsProps {
  selectedHotspot: string | null;
}

const MarketingCampaigns: React.FC<MarketingCampaignsProps> = ({ selectedHotspot }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'portal_banner' as const,
    targetAudience: 'all',
    message: '',
    budget: 0
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['marketing-campaigns', selectedHotspot],
    queryFn: async () => {
      // Mock data - in real implementation, fetch from backend
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Free WiFi Promotion',
          type: 'portal_banner',
          status: 'active',
          targetAudience: 'new_users',
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          impressions: 1250,
          clicks: 89,
          conversions: 23,
          budget: 5000,
          spent: 1200
        },
        {
          id: '2',
          name: 'Premium Upgrade Campaign',
          type: 'email',
          status: 'active',
          targetAudience: 'frequent_users',
          startDate: '2024-01-10',
          endDate: '2024-01-31',
          impressions: 856,
          clicks: 124,
          conversions: 31,
          budget: 3000,
          spent: 890
        }
      ];

      return selectedHotspot 
        ? mockCampaigns.filter(c => c.id === selectedHotspot)
        : mockCampaigns;
    },
  });

  const handleCreateCampaign = () => {
    console.log('Creating campaign:', newCampaign);
    setNewCampaign({
      name: '',
      type: 'portal_banner',
      targetAudience: 'all',
      message: '',
      budget: 0
    });
    setShowCreateForm(false);
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Share2 className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Marketing Campaigns</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage marketing campaigns for hotspot users
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Megaphone className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-xl font-bold">{campaigns?.filter(c => c.status === 'active').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-xl font-bold">
                  {campaigns?.reduce((sum, c) => sum + c.impressions, 0).toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">
                  {campaigns?.length ? 
                    ((campaigns.reduce((sum, c) => sum + c.conversions, 0) / 
                      campaigns.reduce((sum, c) => sum + c.clicks, 0)) * 100).toFixed(1) + '%'
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold">
                  KES {campaigns?.reduce((sum, c) => sum + c.spent, 0).toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(campaign.type)}
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {campaign.startDate} - {campaign.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(campaign.status)}`} />
                    {campaign.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p className="font-medium">{campaign.clicks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="font-medium">{campaign.conversions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="font-medium">
                    {((campaign.clicks / campaign.impressions) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget Used</p>
                  <p className="font-medium">
                    {((campaign.spent / campaign.budget) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Campaign Type</label>
                <select
                  value={newCampaign.type}
                  onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="portal_banner">Portal Banner</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={newCampaign.message}
                onChange={(e) => setNewCampaign({...newCampaign, message: e.target.value})}
                placeholder="Enter campaign message"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(!campaigns || campaigns.length === 0) && (
        <div className="text-center py-12">
          <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-500">
            Create your first marketing campaign to engage hotspot users.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketingCampaigns;
