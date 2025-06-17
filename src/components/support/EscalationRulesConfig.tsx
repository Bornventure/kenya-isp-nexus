
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Clock, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EscalationRule {
  id: string;
  name: string;
  condition: 'time_based' | 'priority_based' | 'department_based';
  trigger_value: string;
  escalate_to_level: number;
  notify_roles: string[];
  is_active: boolean;
}

const EscalationRulesConfig = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<EscalationRule[]>([
    {
      id: '1',
      name: 'High Priority Auto-Escalation',
      condition: 'priority_based',
      trigger_value: 'high',
      escalate_to_level: 2,
      notify_roles: ['isp_admin', 'manager'],
      is_active: true,
    },
    {
      id: '2',
      name: '24 Hour Response Rule',
      condition: 'time_based',
      trigger_value: '24',
      escalate_to_level: 2,
      notify_roles: ['manager'],
      is_active: true,
    },
  ]);

  const [newRule, setNewRule] = useState({
    name: '',
    condition: 'time_based' as EscalationRule['condition'],
    trigger_value: '',
    escalate_to_level: 2,
    notify_roles: [],
    is_active: true,
  });

  const [showAddRule, setShowAddRule] = useState(false);

  const handleAddRule = () => {
    if (!newRule.name.trim() || !newRule.trigger_value.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const rule: EscalationRule = {
      id: Date.now().toString(),
      ...newRule,
    };

    setRules(prev => [...prev, rule]);
    setNewRule({
      name: '',
      condition: 'time_based',
      trigger_value: '',
      escalate_to_level: 2,
      notify_roles: [],
      is_active: true,
    });
    setShowAddRule(false);

    toast({
      title: "Success",
      description: "Escalation rule added successfully",
    });
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(rule =>
        rule.id === ruleId
          ? { ...rule, is_active: !rule.is_active }
          : rule
      )
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Success",
      description: "Escalation rule deleted",
    });
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'time_based': return 'Time Based';
      case 'priority_based': return 'Priority Based';
      case 'department_based': return 'Department Based';
      default: return condition;
    }
  };

  const getTriggerDescription = (rule: EscalationRule) => {
    switch (rule.condition) {
      case 'time_based':
        return `After ${rule.trigger_value} hours without response`;
      case 'priority_based':
        return `When priority is ${rule.trigger_value}`;
      case 'department_based':
        return `When assigned to ${rule.trigger_value} department`;
      default:
        return rule.trigger_value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Escalation Rules</h2>
          <p className="text-muted-foreground">
            Configure automatic ticket escalation rules
          </p>
        </div>
        <Button onClick={() => setShowAddRule(!showAddRule)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {showAddRule && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Escalation Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., High Priority Auto-Escalation"
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition Type</Label>
                <Select
                  value={newRule.condition}
                  onValueChange={(value: EscalationRule['condition']) => 
                    setNewRule(prev => ({ ...prev, condition: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_based">Time Based</SelectItem>
                    <SelectItem value="priority_based">Priority Based</SelectItem>
                    <SelectItem value="department_based">Department Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trigger-value">Trigger Value</Label>
                {newRule.condition === 'time_based' ? (
                  <Input
                    id="trigger-value"
                    type="number"
                    value={newRule.trigger_value}
                    onChange={(e) => setNewRule(prev => ({ ...prev, trigger_value: e.target.value }))}
                    placeholder="Hours"
                  />
                ) : newRule.condition === 'priority_based' ? (
                  <Select
                    value={newRule.trigger_value}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger_value: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="trigger-value"
                    value={newRule.trigger_value}
                    onChange={(e) => setNewRule(prev => ({ ...prev, trigger_value: e.target.value }))}
                    placeholder="Department name"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="escalation-level">Escalate to Level</Label>
                <Select
                  value={newRule.escalate_to_level.toString()}
                  onValueChange={(value) => setNewRule(prev => ({ ...prev, escalate_to_level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddRule}>Create Rule</Button>
              <Button variant="outline" onClick={() => setShowAddRule(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">{rule.name}</h3>
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Condition: {getConditionLabel(rule.condition)}</span>
                    </div>
                    <div className="ml-6">
                      <span>{getTriggerDescription(rule)}</span>
                    </div>
                    <div className="ml-6">
                      <span>Escalates to Level {rule.escalate_to_level}</span>
                    </div>
                    {rule.notify_roles.length > 0 && (
                      <div className="ml-6">
                        <span>Notifies: {rule.notify_roles.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={() => handleToggleRule(rule.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Escalation Rules</h3>
              <p className="text-muted-foreground">
                Create your first escalation rule to automate ticket management
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EscalationRulesConfig;
