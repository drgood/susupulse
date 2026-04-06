'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { SusuGroup, ContributionSchedule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Save, AlertCircle, LogOut, Shield, Calendar, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { calculateEndDate, calculateCashOutAmount, hasAnyMemberCashedOut, getActiveDays } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GroupSettingsProps {
  group: SusuGroup;
  onUpdateGroup: (updates: Partial<SusuGroup>) => void;
  onDeleteGroup: () => void;
  onLogout: () => void;
}

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export function GroupSettings({ group, onUpdateGroup, onDeleteGroup, onLogout }: GroupSettingsProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningField, setWarningField] = useState<string>('');
  const [pendingUpdates, setPendingUpdates] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: group.name,
    dailyContribution: group.dailyContribution,
    feePerMark: group.feePerMark,
    maxMembers: group.maxMembers,
    daysPerCycle: group.daysPerCycle,
    recipientsPerCycle: group.recipientsPerCycle || 1,
    contributionSchedule: group.contributionSchedule,
    activeDays: group.activeDays || [1, 2, 3, 4, 5],
    momoNumber: group.momoNumber || '',
    momoName: group.momoName || '',
    startDate: group.startDate,
  });

  const hasCashedOut = hasAnyMemberCashedOut(group);
  const endDate = calculateEndDate(group);
  const cashOutAmount = calculateCashOutAmount(formData.dailyContribution, formData.daysPerCycle, formData.maxMembers);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check if this field change needs a warning (only after cash out started)
    const needsWarning = ['feePerMark', 'maxMembers', 'daysPerCycle', 'contributionSchedule', 'activeDays'].includes(field);
    if (needsWarning && hasCashedOut) {
      setWarningField(field);
      setPendingUpdates({ [field]: value });
      setIsWarningOpen(true);
    }
  };

  const handleStartDateChange = (newDate: Date) => {
    if (hasCashedOut) {
      toast({
        title: "Cannot Change Start Date",
        description: "Start date cannot be changed after cycle has started (first cash out).",
        variant: "destructive"
      });
      return;
    }
    
    setFormData(prev => ({ ...prev, startDate: newDate.toISOString() }));
    
    // Save immediately since this affects cycle timing
    const updates = {
      ...formData,
      startDate: newDate.toISOString(),
      cashOutAmount: calculateCashOutAmount(formData.dailyContribution, formData.daysPerCycle, formData.maxMembers),
    };
    onUpdateGroup(updates);
    toast({
      title: "Start Date Updated",
      description: "Cycle has been recalibrated based on new start date.",
    });
  };

  const confirmWarning = () => {
    if (pendingUpdates) {
      setFormData(prev => ({ ...prev, ...pendingUpdates }));
      onUpdateGroup(pendingUpdates);
      toast({
        title: "Setting Updated",
        description: `${warningField} was changed. Cycle calculations may be affected.`,
      });
    }
    setIsWarningOpen(false);
    setPendingUpdates(null);
  };

  const handleSave = () => {
    const updates = {
      ...formData,
      cashOutAmount: calculateCashOutAmount(formData.dailyContribution, formData.daysPerCycle, formData.maxMembers),
    };
    onUpdateGroup(updates);
    toast({
      title: "Settings Saved",
      description: "Group configuration has been updated.",
    });
  };

  const handleResetPin = async () => {
    if (confirm('Are you sure you want to reset your Access PIN? You will be prompted to set a new one on your next login.')) {
      await db.config.delete('app_pin');
      onLogout();
    }
  };

  if (!mounted) return null;

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
                onChange={(e) => handleFieldChange('dailyContribution', Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Fee/Day (GH¢)</Label>
              <Input 
                id="fee" 
                type="number" 
                value={formData.feePerMark} 
                onChange={(e) => handleFieldChange('feePerMark', Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="members" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Members</Label>
              <Input 
                id="members" 
                type="number" 
                value={formData.maxMembers} 
                onChange={(e) => handleFieldChange('maxMembers', Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marks" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Marks/Cycle</Label>
              <Input 
                id="marks" 
                type="number" 
                value={formData.daysPerCycle} 
                onChange={(e) => handleFieldChange('daysPerCycle', Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipients" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recipients/Cycle</Label>
              <Input 
                id="recipients" 
                type="number" 
                value={formData.recipientsPerCycle} 
                onChange={(e) => handleFieldChange('recipientsPerCycle', Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cash Out (Auto)</Label>
              <div className="h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center px-4">
                <span className="text-lg font-black text-primary">GH¢ {cashOutAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Schedule</Label>
            <div className="flex gap-2">
              {(['all_days', 'weekdays_only', 'custom'] as const).map((schedule) => (
                <Button
                  key={schedule}
                  variant={formData.contributionSchedule === schedule ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFieldChange('contributionSchedule', schedule)}
                  className="flex-1 rounded-lg text-xs font-bold"
                >
                  {schedule === 'all_days' ? 'Mon-Sun' : schedule === 'weekdays_only' ? 'Mon-Fri' : 'Custom'}
                </Button>
              ))}
            </div>
          </div>

          {formData.contributionSchedule === 'custom' && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    variant={formData.activeDays?.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = formData.activeDays || [];
                      const updated = current.includes(day.value)
                        ? current.filter(d => d !== day.value)
                        : [...current, day.value].sort();
                      handleFieldChange('activeDays', updated);
                    }}
                    className="h-10 w-12 rounded-lg text-xs font-bold"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date</Label>
              {hasCashedOut ? (
                <div className="h-12 rounded-xl bg-muted/30 border border-border flex items-center px-4">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">{format(new Date(group.startDate), 'MMM d, yyyy')}</span>
                </div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 w-full justify-start rounded-xl px-4">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">{format(new Date(formData.startDate), 'MMM d, yyyy')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarUI
                      mode="single"
                      selected={new Date(formData.startDate)}
                      onSelect={(date) => date && handleStartDateChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
              {hasCashedOut && (
                <p className="text-[10px] text-amber-600">Cannot change - cycle in progress</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est. End Date</Label>
              <div className="h-12 rounded-xl bg-accent/5 border border-accent/10 flex items-center px-4">
                <Calendar className="h-4 w-4 text-accent mr-2" />
                <span className="text-sm font-bold text-accent">{format(endDate, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="momoNum" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">MoMo Number</Label>
              <Input 
                id="momoNum" 
                value={formData.momoNumber} 
                onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="momoName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Name</Label>
              <Input 
                id="momoName" 
                value={formData.momoName} 
                onChange={(e) => setFormData({ ...formData, momoName: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full h-12 rounded-xl font-bold gap-2 mt-4">
            <Save className="h-5 w-5" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="w-full h-12 rounded-xl font-bold gap-2 border-primary/20 text-muted-foreground hover:text-primary transition-all"
          >
            <LogOut className="h-4 w-4" />
            Log Out & Lock
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleResetPin}
            className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          >
            Reset Access PIN
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

      <AlertDialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Mid-Cycle Change Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              Changing <span className="font-bold">{warningField}</span> after members have started cashing out will affect your cycle calculations.
              <br /><br />
              Current progress may become inaccurate. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWarning}>
              Yes, Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
