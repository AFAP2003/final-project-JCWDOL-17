'use client';

import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { currentDate, dateFrom } from '@/lib/datetime';
import { format, isAfter } from 'date-fns';
import { useState } from 'react';

type Props = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
};

export default function DateOfBirthPicker(props: Props) {
  const [date, setDate] = useState<Date | undefined>(props.value);
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    date || currentDate(),
  );

  // Generate year options (100 years back from current year)
  const currentYear = currentDate().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Generate month options
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (props.onChange) {
      props.onChange(selectedDate);
    }
  };

  const handleYearChange = (year: string) => {
    const newDate = dateFrom(calendarMonth);
    newDate.setFullYear(Number.parseInt(year));
    setCalendarMonth(newDate);
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = dateFrom(calendarMonth);
    newDate.setMonth(Number.parseInt(monthIndex));
    setCalendarMonth(newDate);
  };

  return (
    <div>
      <div className="border-b border-neutral-200 pb-3">
        <div className="flex gap-3 w-full justify-between">
          <Select
            value={calendarMonth.getMonth().toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 w-full rounded-md border-neutral-200 bg-neutral-50 text-neutral-800">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent
              id="prevent-lenis"
              className="max-h-80 rounded-md bg-neutral-700 text-neutral-200 border-neutral-200"
            >
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={calendarMonth.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-[90px] rounded-md border-neutral-200 bg-neutral-50 text-neutral-800">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent
              id="prevent-lenis"
              align="center"
              className="max-h-80 rounded-md bg-neutral-700 text-neutral-200 border-neutral-200"
            >
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          disabled={(date) => isAfter(date, currentDate())}
          initialFocus
          classNames={{
            nav_button:
              'bg-neutral-200 text-neutral-800 size-7 rounded-md flex items-center justify-center',
            button: 'hover:bg-neutral-200',
            day_today:
              'bg-transparent aria-selected:text-neutral-800 aria-selected:bg-neutral-200',
            day_selected: 'bg-neutral-200 text-neutral-800',
          }}
          className="p-3 border-none text-neutral-200 w-full"
        />
      </div>
      <div className="p-3 border-t border-neutral-100 bg-neutral-50 rounded-b-lg">
        <p className="text-xs text-neutral-700 text-center">
          {date
            ? `Selected: ${format(date, 'MMMM d, yyyy')}`
            : 'Please select your date of birth'}
        </p>
      </div>
    </div>
  );
}
