import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInCalendarDays } from 'date-fns';
import { SusuGroup } from './types';

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
