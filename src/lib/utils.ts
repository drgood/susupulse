import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInCalendarDays } from 'date-fns';
import { SusuGroup, Member } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the numeric days of the week that are active for a group.
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export function getActiveDays(group: SusuGroup): number[] {
  if (group.contributionSchedule === 'all_days') return [0, 1, 2, 3, 4, 5, 6];
  if (group.contributionSchedule === 'weekdays_only') return [1, 2, 3, 4, 5];
  return group.activeDays || [1, 2, 3, 4, 5];
}

/**
 * Calculates how many "contribution marks" should have occurred between the start date
 * and the reference date based on the group's schedule.
 */
export function calculateActiveDaysPassed(group: SusuGroup, referenceDate: Date = new Date()): number {
  const start = new Date(group.startDate);
  // Calculate raw calendar days difference
  const totalCalendarDays = Math.max(0, differenceInCalendarDays(referenceDate, start));
  const activeDaysList = getActiveDays(group);
  
  let count = 0;
  // We loop through every calendar day and check if it's an "active" day in the schedule
  for (let i = 0; i <= totalCalendarDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (activeDaysList.includes(d.getDay())) {
      count++;
    }
  }
  return count;
}

/**
 * Returns how many active days are in a typical week for this group.
 */
export function getWeeklyFrequency(group: SusuGroup): number {
  return getActiveDays(group).length;
}

export function completeCycle(group: SusuGroup): { members: Member[], newRotation: number, newStartDate: string } {
  const updatedMembers = group.members.map(m => ({
    ...m,
    daysPaid: 0,
    creditRemainder: 0,
    hasCashedOut: false,
    lastPaymentDate: undefined
  }));
  
  return {
    members: updatedMembers,
    newRotation: (group.currentRotation || 1) + 1,
    newStartDate: new Date().toISOString()
  };
}

export function getCashedOutCount(group: SusuGroup): number {
  return group.members.filter(m => m.hasCashedOut).length;
}

export function isCycleComplete(group: SusuGroup): boolean {
  const recipientsPerCycle = group.recipientsPerCycle || 1;
  return getCashedOutCount(group) >= recipientsPerCycle;
}

export interface CycleStats {
  totalCollectedThisCycle: number;
  adminProfitThisCycle: number;
  cashedOutCount: number;
  recipientsPerCycle: number;
}

export function getCycleStats(group: SusuGroup): CycleStats {
  const recipientsPerCycle = group.recipientsPerCycle || 1;
  const totalCollectedThisCycle = group.members.reduce((acc, m) => acc + (m.daysPaid * group.dailyContribution), 0);
  const adminProfitThisCycle = group.members.reduce((acc, m) => acc + (m.daysPaid * (group.feePerMark || 1)), 0);
  const cashedOutCount = getCashedOutCount(group);
  
  return {
    totalCollectedThisCycle,
    adminProfitThisCycle,
    cashedOutCount,
    recipientsPerCycle
  };
}

export function isMemberDefaulter(group: SusuGroup, member: Member): boolean {
  if (member.hasCashedOut) return false;
  
  const rotation = group.currentRotation || 1;
  const activeDaysPassed = calculateActiveDaysPassed(group);
  const currentCycleIndex = Math.floor(activeDaysPassed / group.daysPerCycle);
  const recipientsPerCycle = group.recipientsPerCycle || 1;
  
  const cycleStart = currentCycleIndex * group.daysPerCycle;
  const daysPaidInCurrentCycle = Math.max(0, member.daysPaid - cycleStart);
  
  return daysPaidInCurrentCycle < group.daysPerCycle;
}

export function getOtherCashedOutMembers(group: SusuGroup, excludeMemberId?: string): Member[] {
  return group.members.filter(m => m.hasCashedOut && m.id !== excludeMemberId);
}

export function hasAnyMemberCashedOut(group: SusuGroup): boolean {
  return group.members.some(m => m.hasCashedOut);
}

export function calculateActiveDaysPerWeek(group: SusuGroup): number {
  return getActiveDays(group).length;
}

export function calculateEndDate(group: SusuGroup): Date {
  const start = new Date(group.startDate);
  const totalMarks = group.maxMembers * group.daysPerCycle;
  const activeDaysPerWeek = calculateActiveDaysPerWeek(group);
  const totalWeeks = Math.ceil(totalMarks / activeDaysPerWeek);
  const end = new Date(start);
  end.setDate(end.getDate() + (totalWeeks * 7));
  return end;
}

export function calculateCashOutAmount(dailyContribution: number, daysPerCycle: number, maxMembers: number): number {
  return dailyContribution * daysPerCycle * maxMembers;
}
