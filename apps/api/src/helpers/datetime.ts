import { TZDate } from '@date-fns/tz';

export function currentDate() {
  return new TZDate();
}

export function dateFrom(date: string | Date) {
  return typeof date === 'string' ? new TZDate(date) : new TZDate(date);
}
