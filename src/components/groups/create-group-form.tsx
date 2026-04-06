'use client';

import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { SusuGroup, ContributionSchedule } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar as CalendarIcon, Wallet, Settings2, Landmark, ListChecks, Info, Loader2, Phone, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dailyContribution: z.coerce.number().min(1, 'Minimum 1 GH¢'),
  feePerMark: z.coerce.number().min(0, 'Required'),
  maxMembers: z.coerce.number().min(2, 'At least 2 members'),
  daysPerCycle: z.coerce.number().min(1, 'Minimum 1 day'),
  recipientsPerCycle: z.coerce.number().min(1, 'Minimum 1 recipient'),
  contributionSchedule: z.enum(['all_days', 'weekdays_only', 'custom']),
  activeDays: z.array(z.number()),
  momoNumber: z.string().min(10, 'Enter valid number'),
  momoName: z.string().min(2, 'Enter account name'),
  startDate: z.date(),
  memberNames: z.string().optional(),
}).refine((data) => data.dailyContribution > data.feePerMark, {
  message: "Fee cannot be higher than contribution",
  path: ["feePerMark"],
});

interface CreateGroupFormProps {
  onSubmit: (group: SusuGroup) => void;
  onCancel: () => void;
}

type FormData = z.infer<typeof formSchema>;

export function CreateGroupForm({ onSubmit, onCancel }: CreateGroupFormProps) {
  const [mounted, setMounted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      dailyContribution: 21,
      feePerMark: 1,
      maxMembers: 20,
      daysPerCycle: 7,
      recipientsPerCycle: 1,
      contributionSchedule: 'all_days',
      activeDays: [1, 2, 3, 4, 5],
      momoNumber: '',
      momoName: '',
      startDate: new Date(),
      memberNames: '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const daily = form.watch('dailyContribution') || 0;
  const fee = form.watch('feePerMark') || 0;
  const membersCount = form.watch('maxMembers') || 0;
  const daysPerCycle = form.watch('daysPerCycle') || 0;
  const recipientsPerCycle = form.watch('recipientsPerCycle') || 1;
  const scheduleType = form.watch('contributionSchedule');
  const activeDays = form.watch('activeDays');
  const startDate = form.watch('startDate');

  const totalCashOut = daily * daysPerCycle * membersCount;
  const cashOutAmount = totalCashOut / recipientsPerCycle;
  const profitPerCycle = fee * membersCount * daysPerCycle;
  const totalRotationMarks = membersCount * daysPerCycle;

  // Calculate duration based on schedule density
  const activeDaysPerWeek = scheduleType === 'all_days' ? 7 : scheduleType === 'weekdays_only' ? 5 : activeDays.length || 1;
  const totalWeeks = Math.ceil(totalRotationMarks / activeDaysPerWeek);
  const endDate = startDate ? new Date(startDate.getTime() + (totalWeeks * 7 * 24 * 60 * 60 * 1000)) : null;

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const names = values.memberNames?.split('\n').filter(n => n.trim() !== '') || [];
      const membersList = Array.from({ length: values.maxMembers }).map((_, i) => ({
      id: `m-${Date.now()}-${i}`,
      name: names[i] || `Member ${i + 1}`,
      position: i + 1,
      daysPaid: 0,
      creditRemainder: 0,
      hasCashedOut: false,
      joinDate: values.startDate.toISOString(),
    }));

    const finalActiveDays = values.contributionSchedule === 'all_days' 
      ? [0, 1, 2, 3, 4, 5, 6] 
      : values.contributionSchedule === 'weekdays_only' 
      ? [1, 2, 3, 4, 5] 
      : values.activeDays;

    const newGroup: SusuGroup = {
      id: `group-${Date.now()}`,
      name: values.name,
      dailyContribution: values.dailyContribution,
      feePerMark: values.feePerMark,
      adminFee: profitPerCycle,
      maxMembers: values.maxMembers,
      durationInWeeks: totalWeeks,
      paymentFrequency: 'daily',
      contributionSchedule: values.contributionSchedule as ContributionSchedule,
      activeDays: finalActiveDays,
      daysPerCycle: values.daysPerCycle,
      recipientsPerCycle: values.recipientsPerCycle,
      cashOutAmount: cashOutAmount,
      momoNumber: values.momoNumber,
      momoName: values.momoName,
      startDate: values.startDate.toISOString(),
      currentRotation: 1,
      createdAt: new Date().toISOString(),
      members: membersList,
    };
    onSubmit(newGroup);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

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
              <FormField
                control={form.control}
                name="recipientsPerCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Recipients per Cycle</FormLabel>
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
                    Payout sequence is determined by the order of names provided.
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Base Schedule</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all_days">7 Days/Week</SelectItem>
                        <SelectItem value="weekdays_only">Mon-Fri Only</SelectItem>
                        <SelectItem value="custom">Custom Choice</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {scheduleType === 'custom' && (
              <FormField
                control={form.control}
                name="activeDays"
                render={() => (
                  <FormItem className="bg-muted/30 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-3 w-3 text-primary" />
                      <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Select Active Days</FormLabel>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <FormField
                          key={day.value}
                          control={form.control}
                          name="activeDays"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day.value}
                                className="flex flex-col items-center gap-1.5 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== day.value
                                            )
                                          )
                                    }}
                                    className="h-5 w-5 rounded-md"
                                  />
                                </FormControl>
                                <FormLabel className="text-[8px] font-bold uppercase">
                                  {day.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="momoNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">MoMo Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="0244..." className="pl-9 h-12 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="momoName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Recipient Name" className="h-12 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Payout Intelligence</h4>
                <Badge variant="outline" className="text-[8px] bg-white border-primary/20">{totalRotationMarks} Marks Total Rotation</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Cash Out Pot (Total):</span>
                  <span className="text-lg font-black text-primary">GH¢ {totalCashOut.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Per Recipient ({recipientsPerCycle}x):</span>
                  <span className="text-lg font-black text-primary">GH¢ {cashOutAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-primary/10">
                  <span className="text-xs text-muted-foreground font-medium">Target Cycle Profit:</span>
                  <span className="font-bold text-accent">GH¢ {profitPerCycle.toLocaleString()}</span>
                </div>
                {endDate && (
                  <div className="flex justify-between items-center pt-1 border-t border-primary/10">
                    <span className="text-xs text-muted-foreground font-medium">Est. End Date:</span>
                    <span className="font-bold text-primary">{format(endDate, 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-primary/10">
                <Info className="h-3 w-3 text-primary mt-0.5" />
                <p className="text-[9px] text-muted-foreground leading-tight italic">
                  A full rotation for all {membersCount} members will take approx. {totalWeeks} weeks based on {activeDaysPerWeek} contribution days per week.
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
