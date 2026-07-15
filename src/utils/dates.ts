import {
  addDays,
  differenceInCalendarDays,
  format,
  isBefore,
  parseISO,
} from "date-fns";

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function addDaysISO(days: number) {
  return format(addDays(new Date(), days), "yyyy-MM-dd");
}

export function daysUntil(date: string) {
  return differenceInCalendarDays(parseISO(date), new Date());
}

export function isDatePast(date: string) {
  return isBefore(parseISO(date), new Date());
}
