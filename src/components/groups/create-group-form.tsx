
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { SusuGroup, ContributionSchedule } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar as CalendarIcon, Wallet, Settings2, Landmark, ListChecks, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dailyContribution: z.coerce.number().min(1, 'Minimum 1 GH¢'),
  feePerMark: z.coerce.number().min(0, 'Required'),
  maxMembers: z.coerce.number().min(2, 'At least 2 members'),
  daysPerCycle: z.coerce.number().min(1, 'Minimum 1 day'),
  contributionSchedule: z.enum(['all_days', 'weekdays_only']),
  momoDetails: z.string().min(5, 'Required'),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  memberNames: z.string().optional(),
}).refine((data) => data.dailyContribution > data.feePerMark, {
  message: "Fee cannot be higher than contribution",
  path: ["feePerMark"],
});

interface CreateGroupFormProps {
  onSubmit: (group: SusuGroup) => void;
  onCancel: () => void;
}

export function CreateGroupForm({ onSubmit, onCancel }: CreateGroupFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      dailyContribution: 21,
      feePerMark: 1,
      maxMembers: 20,
      daysPerCycle: 7,
      contributionSchedule: 'all_days',
      momoDetails: '0209489849 - Sung Shmair Mumuni',
      startDate: new Date(),
      memberNames: '',
    },
  });

  const daily = form.watch('dailyContribution') || 0;
  const fee = form.watch('feePerMark') || 0;
  const members = form.watch('maxMembers') || 0;
  const daysPerCycle = form.watch('daysPerCycle') || 0;

  const netDailyPerMember = Math.max(0, daily - fee);
  // Correct Cash Out Logic: (Net Daily Contribution) * (Days in one payout cycle) * (Total Members)
  const cashOutAmount = netDailyPerMember * daysPerCycle * members;
  const profitPerCycle = fee * members * daysPerCycle;
  const totalRotationDays = members * daysPerCycle;

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const names = values.memberNames?.split('\n').filter(n => n.trim() !== '') || [];
    const membersList = Array.from({ length: values.maxMembers }).map((_, i) => ({
      id: `m-${Date.now()}-${i}`,
      name: names[i] || `Member ${i + 1}`,
      position: i + 1,
      daysPaid: 0,
      hasCashedOut: false,
      joinDate: values.startDate.toISOString(),
    }));

    const newGroup: SusuGroup = {
      id: `group-${Date.now()}`,
      name: values.name,
      dailyContribution: values.dailyContribution,
      feePerMark: values.feePerMark,
      adminFee: profitPerCycle,
      durationInWeeks: Math.ceil(totalRotationDays / 7),
      paymentFrequency: 'daily',
      contributionSchedule: values.contributionSchedule as ContributionSchedule,
      daysPerCycle: values.daysPerCycle,
      cashOutAmount: cashOutAmount,
      momoDetails: values.momoDetails,
      startDate: values.startDate.toISOString(),
      createdAt: new Date().toISOString(),
      members: membersList,
    };
    onSubmit(newGroup);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-black">Configure Susu Circle</CardTitle>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Initialize Rotation Parameters</p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Circle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Daily Savings 01" className="rounded-xl h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailyContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Daily GH¢</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-3.5 h-5 w-5 text-primary" />
                        <Input type="number" className="pl-10 h-12 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="feePerMark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Admin Fee / Day</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Landmark className="absolute left-3 top-3.5 h-5 w-5 text-accent" />
                        <Input type="number" className="pl-10 h-12 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Members</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input type="number" className="pl-10 h-12 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="daysPerCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Marks per Payout</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Settings2 className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input type="number" className="pl-10 h-12 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="memberNames"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ListChecks className="h-3 w-3" /> Member List (One per line)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Safia&#10;KiNgStar&#10;Faiz..." 
                      className="rounded-xl min-h-[100px] text-sm resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    Positions will be assigned based on the order of names.
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-12 rounded-xl pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contributionSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Schedule</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all_days">7 Days/Week</SelectItem>
                        <SelectItem value="weekdays_only">Mon-Fri Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="momoDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">MoMo Payment Target</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 0244000000 - Admin Name" className="h-12 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Payout Intelligence</h4>
                <Badge variant="outline" className="text-[8px] bg-white border-primary/20">{totalRotationDays} Days Total</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Cash Out (The Pot):</span>
                  <span className="text-lg font-black text-primary">GH¢ {cashOutAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-primary/10">
                  <span className="text-xs text-muted-foreground font-medium">Profit per Cycle:</span>
                  <span className="font-bold text-accent">GH¢ {profitPerCycle.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground font-medium italic">Net per Member Daily:</span>
                  <span className="text-[10px] font-bold">GH¢ {netDailyPerMember}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-primary/10">
                <Info className="h-3 w-3 text-primary mt-0.5" />
                <p className="text-[9px] text-muted-foreground leading-tight italic">
                  One full rotation across all {members} members will take approximately {Math.ceil(totalRotationDays/7)} weeks.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1 rounded-xl h-12 font-bold" onClick={onCancel}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl h-12 font-black shadow-lg shadow-primary/20">Launch Circle</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
