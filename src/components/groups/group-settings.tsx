'use client';

import { SusuGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Save, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GroupSettingsProps {
  group: SusuGroup;
  onUpdateGroup: (updates: Partial<SusuGroup>) => void;
  onDeleteGroup: () => void;
}

export function GroupSettings({ group, onUpdateGroup, onDeleteGroup }: GroupSettingsProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: group.name,
    dailyContribution: group.dailyContribution,
    cashOutAmount: group.cashOutAmount,
    momoDetails: group.momoDetails,
    daysPerCycle: group.daysPerCycle,
  });

  const handleSave = () => {
    onUpdateGroup(formData);
    toast({
      title: "Settings Saved",
      description: "Group configuration has been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Circle Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Circle Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daily (GH¢)</Label>
              <Input 
                id="daily" 
                type="number" 
                value={formData.dailyContribution} 
                onChange={(e) => setFormData({ ...formData, dailyContribution: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Marks/Cycle</Label>
              <Input 
                id="days" 
                type="number" 
                value={formData.daysPerCycle} 
                onChange={(e) => setFormData({ ...formData, daysPerCycle: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payout" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cash Out (GH¢)</Label>
            <Input 
              id="payout" 
              type="number" 
              value={formData.cashOutAmount} 
              onChange={(e) => setFormData({ ...formData, cashOutAmount: Number(e.target.value) })}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="momo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Details</Label>
            <Input 
              id="momo" 
              value={formData.momoDetails} 
              onChange={(e) => setFormData({ ...formData, momoDetails: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <Button onClick={handleSave} className="w-full h-12 rounded-xl font-bold gap-2 mt-4">
            <Save className="h-5 w-5" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 border-destructive/20 bg-destructive/5 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Deleting this circle will permanently remove all member records and payment history. This action cannot be undone.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (confirm('Are you sure you want to delete this group?')) onDeleteGroup();
            }}
            className="w-full h-12 rounded-xl font-bold gap-2"
          >
            <Trash2 className="h-5 w-5" />
            Delete Entire Circle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
