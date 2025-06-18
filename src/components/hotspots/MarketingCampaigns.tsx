
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Megaphone,
  Target,
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Click,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Campaign {
  id: string;
  name: string;
  type: 'splash_page' | 'popup' | 'banner' | 'email';
  status: 'active' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  targetAudience: string[];
  content: {
    title: string;
    message: string;
    imageUrl?: string;
    ctaText: string;
    ctaUrl: string;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
  };
  budget?: number;
  spend?: number;
}

interface MarketingCampaignsProps {
  selectedHotspot: string | null;
}

const MarketingCampaigns: React.FC<MarketingCampaignsProps> = ({ selectedHotspot }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    type: 'splash_page',
    status: 'draft',
    targetAudience: [],
    content: {
      title: '',
      message: '',
      ctaText: 'Learn More',
      ctaUrl: ''
    }
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['marketing-campaigns', selectedHotspot],
    queryFn: async () => {
      // Mock data - in real implementation, fetch from backend
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Holiday Special Offer',
          type: 'splash_page',
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-01-31',
          targetAudience: ['new_users', 'frequent_visitors'],
          content: {
            title: '50% Off Premium Internet!',
            message: 'Enjoy blazing fast internet at half the price. Limited time offer for new subscribers.',
            imageUrl: '/api/placeholder/400/200',
            ctaText: 'Subscribe Now',
            ctaUrl: 'https://yoursite.com/subscribe'
          },
          metrics: {
            impressions: 4521,
            clicks: 687,
            conversions: 89,
            ctr: 15.2
          },
          budget: 5000,
          spend: 2340
        },
        {
          id: '2',
          name: 'Coffee Shop Partnership',
          type: 'banner',
          status: 'active',
          startDate: '2024-01-10',
          endDate: '2024-02-10',
          targetAudience: ['coffee_shop_visitors'],
          content: {
            title: 'Free Coffee with WiFi!',
            message: 'Show this message at Java House to get a free coffee with any internet purchase.',
            ctaText: 'Claim Offer',
            ctaUrl: 'https://javahouse.com/wifi-offer'
          },
          metrics: {
            impressions: 2134,
            clicks: 321,
            conversions: 45,
            ctr: 15.0
          }
        },
        {
          id: '3',
          name: 'Student Discount Campaign',
          type: 'popup',
          status: 'paused',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          targetAudience: ['students', 'library_visitors'],
          content: {
            title: 'Student Discount Available',
            message: 'Get 30% off with a valid student ID. Perfect for research and online learning.',
            ctaText: 'Get Discount',
            ctaUrl: 'https://yoursite.com/student-discount'
          },
          metrics: {
            impressions: 1876,
            clicks: 234,
            conversions: 67,
            ctr: 12.5
          },
          budget: 2000,
          spend: 890
        }
      ];

      return selectedHotspot 
        ? mockCampaigns 
        : mockCampaigns;
    },
  });

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'splash_page': return <Eye className="h-4 w-4" />;
      case 'popup': return <Megaphone className="h-4 w-4" />;
      case 'banner': return <Target className="h-4 w-4" />;
      case 'email': return <Users className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
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
            Create and manage promotional campaigns for your hotspot users
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaign Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {campaigns?.reduce((sum, c) => sum + c.metrics.impressions, 0).toLocaleString() || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Impressions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {campaigns?.reduce((sum, c) => sum + c.metrics.clicks, 0).toLocaleString() || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {campaigns?.reduce((sum, c) => sum + c.metrics.conversions, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Conversions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {campaigns?.length ? 
                  (campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length).toFixed(1) 
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg CTR</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <div className="space-y-4">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(campaign.type)}
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Campaign Content Preview */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium text-lg">{campaign.content.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{campaign.content.message}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    {campaign.content.ctaText}
                  </Button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-lg font-bold text-blue-600">
                        {campaign.metrics.impressions.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Click className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        {campaign.metrics.clicks}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-lg font-bold text-purple-600">
                        {campaign.metrics.conversions}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="text-lg font-bold text-orange-600">
                        {campaign.metrics.ctr}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">CTR</p>
                  </div>
                </div>

                {/* Budget Information */}
                {campaign.budget && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget:</span>
                    <span>KES {campaign.spend?.toLocaleString()} / KES {campaign.budget.toLocaleString()}</span>
                  </div>
                )}

                {/* Target Audience */}
                <div>
                  <p className="text-sm font-medium mb-1">Target Audience:</p>
                  <div className="flex flex-wrap gap-1">
                    {campaign.targetAudience.map((audience) => (
                      <Badge key={audience} variant="outline" className="text-xs">
                        {audience.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
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
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    value={newCampaign.name || ''}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Campaign Type</label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value as Campaign['type'] }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="splash_page">Splash Page</option>
                    <option value="popup">Popup</option>
                    <option value="banner">Banner</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Campaign Title</label>
                <Input
                  value={newCampaign.content?.title || ''}
                  onChange={(e) => setNewCampaign(prev => ({ 
                    ...prev, 
                    content: { ...prev.content!, title: e.target.value }
                  }))}
                  placeholder="Enter campaign title"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Campaign Message</label>
                <Textarea
                  value={newCampaign.content?.message || ''}
                  onChange={(e) => setNewCampaign(prev => ({ 
                    ...prev, 
                    content: { ...prev.content!, message: e.target.value }
                  }))}
                  placeholder="Enter campaign message"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Call-to-Action Text</label>
                  <Input
                    value={newCampaign.content?.ctaText || ''}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      content: { ...prev.content!, ctaText: e.target.value }
                    }))}
                    placeholder="e.g., Learn More, Subscribe Now"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Call-to-Action URL</label>
                  <Input
                    value={newCampaign.content?.ctaUrl || ''}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      content: { ...prev.content!, ctaUrl: e.target.value }
                    }))}
                    placeholder="https://yoursite.com/offer"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button onClick={() => setShowCreateForm(false)} variant="outline">
                  Cancel
                </Button>
                <Button>
                  Create Campaign
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(!campaigns || campaigns.length === 0) && !showCreateForm && (
        <div className="text-center py-12">
          <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first marketing campaign to engage with hotspot users.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarketingCampaigns;
