'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SusuGroup, ContributionSchedule } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar as CalendarIcon, Wallet, Settings2, Landmark } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dailyContribution: z.coerce.number().min(1, 'Minimum 1 GH¢'),
  feePerMark: z.coerce.number().min(0, 'Required'),
  maxMembers: z.coerce.number().min(2, 'At least 2 members'),
  daysPerCycle: z.coerce.number().min(1, 'Minimum 1 day'),
  contributionSchedule: z.enum(['all_days', 'weekdays_only']),
  momoDetails: z.string().min(5, 'Required'),
  startDate: z.string().min(1, 'Required'),
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
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const daily = form.watch('dailyContribution');
  const fee = form.watch('feePerMark');
  const members = form.watch('maxMembers');
  const daysPerCycle = form.watch('daysPerCycle');

  // Net amount per day = Daily contribution - admin fee
  const netDailyPerMember = daily - fee;
  // Cash out = Net daily * days in cycle
  const cashOutAmount = netDailyPerMember * daysPerCycle;
  
  // Total profit potential per week/cycle
  const profitPerCycle = fee * members * daysPerCycle;
  const totalPoolPerCycle = daily * members * daysPerCycle;

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const newGroup: SusuGroup = {
      id: `group-${Date.now()}`,
      name: values.name,
      dailyContribution: values.dailyContribution,
      feePerMark: values.feePerMark,
      maxMembers: values.maxMembers,
      adminFee: profitPerCycle,
      durationInWeeks: values.maxMembers,
      paymentFrequency: 'daily',
      contributionSchedule: values.contributionSchedule as ContributionSchedule,
      daysPerCycle: values.daysPerCycle,
      cashOutAmount: cashOutAmount,
      momoDetails: values.momoDetails,
      startDate: new Date(values.startDate).toISOString(),
      createdAt: new Date().toISOString(),
      members: Array.from({ length: values.maxMembers }).map((_, i) => ({
        id: `m-${Date.now()}-${i}`,
        name: `Member ${i + 1}`,
        position: i + 1,
        daysPaid: 0,
        hasCashedOut: false,
        joinDate: new Date().toISOString(),
      })),
    };
    onSubmit(newGroup);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-black">Configure Susu Circle</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Daily Circle 01" {...field} />
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
                    <FormLabel>Daily (GH¢)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-9" {...field} />
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
                    <FormLabel>Fee per Day (GH¢)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-9" {...field} />
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
                    <FormLabel>Total Members</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-9" {...field} />
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
                    <FormLabel>Days/Payout</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Settings2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contributionSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Schedule</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all_days">Mon - Sun (7 days)</SelectItem>
                      <SelectItem value="weekdays_only">Mon - Fri (5 days)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Cash Out Amount</FormLabel>
                <div className="h-10 px-3 flex items-center bg-muted rounded-md text-sm font-bold border border-input">
                  GH¢ {cashOutAmount.toLocaleString()}
                </div>
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="momoDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MoMo Payment Details</FormLabel>
                  <FormControl>
                    <Input placeholder="Number - Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
              <h4 className="text-xs font-black text-primary uppercase tracking-wider">Projected Revenue</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Pot/Cycle:</span>
                <span className="font-bold">GH¢ {totalPoolPerCycle.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Admin Profit/Cycle:</span>
                <span className="font-bold text-accent">GH¢ {profitPerCycle.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Net per Member:</span>
                <span className="text-xs font-bold">GH¢ {netDailyPerMember} / day</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
              <Button type="submit" className="flex-1">Create Circle</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
