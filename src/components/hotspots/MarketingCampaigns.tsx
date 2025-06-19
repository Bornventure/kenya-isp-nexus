
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Megaphone, 
  Plus, 
  Eye, 
  Users,
  TrendingUp,
  Calendar,
  Mail,
  MessageSquare
} from 'lucide-react';

interface MarketingCampaignsProps {
  selectedHotspot: string | null;
}

const MarketingCampaigns: React.FC<MarketingCampaignsProps> = ({ selectedHotspot }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'banner',
    content: '',
    startDate: '',
    endDate: '',
    targetAudience: 'all'
  });

  const mockCampaigns = [
    { 
      id: 1, 
      name: 'Summer Promotions', 
      type: 'banner', 
      status: 'active', 
      impressions: 1234, 
      clicks: 45,
      startDate: '2024-06-01',
      endDate: '2024-08-31'
    },
    { 
      id: 2, 
      name: 'Welcome Message', 
      type: 'popup', 
      status: 'active', 
      impressions: 2567, 
      clicks: 123,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    { 
      id: 3, 
      name: 'Local Business Ads', 
      type: 'email', 
      status: 'paused', 
      impressions: 890, 
      clicks: 67,
      startDate: '2024-05-15',
      endDate: '2024-07-15'
    }
  ];

  const handleCreateCampaign = () => {
    console.log('Creating campaign:', newCampaign);
    setShowCreateForm(false);
    setNewCampaign({
      name: '',
      type: 'banner',
      content: '',
      startDate: '',
      endDate: '',
      targetAudience: 'all'
    });
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'banner': return <Eye className="h-4 w-4" />;
      case 'popup': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Marketing Campaigns</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage marketing campaigns for hotspot users
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {!selectedHotspot && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-orange-800">
              Please select a hotspot from the Hotspots tab to manage marketing campaigns.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{mockCampaigns.filter(c => c.status === 'active').length}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">
                  {mockCampaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">
                  {mockCampaigns.reduce((sum, c) => sum + c.clicks, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. CTR</p>
                <p className="text-2xl font-bold">
                  {(mockCampaigns.reduce((sum, c) => sum + (c.clicks / c.impressions * 100), 0) / mockCampaigns.length).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="Enter campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select 
                  value={newCampaign.type} 
                  onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner Ad</SelectItem>
                    <SelectItem value="popup">Popup Message</SelectItem>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="notification">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newCampaign.startDate}
                  onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newCampaign.endDate}
                  onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select 
                  value={newCampaign.targetAudience} 
                  onValueChange={(value) => setNewCampaign({...newCampaign, targetAudience: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="new">New Users</SelectItem>
                    <SelectItem value="returning">Returning Users</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Campaign Content</Label>
              <Textarea
                placeholder="Enter your campaign message or content"
                value={newCampaign.content}
                onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Impressions</th>
                  <th className="text-left p-2">Clicks</th>
                  <th className="text-left p-2">CTR</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{campaign.name}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getCampaignTypeIcon(campaign.type)}
                        <span className="capitalize">{campaign.type}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="p-2">{campaign.impressions.toLocaleString()}</td>
                    <td className="p-2">{campaign.clicks}</td>
                    <td className="p-2">{((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {campaign.startDate} - {campaign.endDate}
                      </div>
                    </td>
                    <td className="text-right p-2">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">
                          {campaign.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingCampaigns;
