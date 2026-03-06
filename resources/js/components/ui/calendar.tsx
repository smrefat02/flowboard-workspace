import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns';

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  className?: string;
}

export function Calendar({ selected, onSelect, month: controlledMonth, onMonthChange, className }: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(new Date());
  const month = controlledMonth ?? internalMonth;

  const handleMonthChange = (newMonth: Date) => {
    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setInternalMonth(newMonth);
    }
  };

  const previousMonth = () => handleMonthChange(subMonths(month, 1));
  const nextMonth = () => handleMonthChange(addMonths(month, 1));
  const previousYear = () => handleMonthChange(subMonths(month, 12));
  const nextYear = () => handleMonthChange(addMonths(month, 12));

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={cn('p-3', className)}>
      <div className="mb-4 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={previousYear}
          className="h-7 w-7 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={previousMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-semibold dark:text-slate-100">
          {format(month, 'MMMM yyyy')}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={nextYear}
          className="h-7 w-7 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {weekDays.map((weekDay) => (
              <th
                key={weekDay}
                className="p-0 pb-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                {weekDay}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                const isSelected = selected && isSameDay(day, selected);
                const isCurrentMonth = isSameMonth(day, month);
                const isToday = isSameDay(day, new Date());

                return (
                  <td key={dayIndex} className="p-0 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onSelect?.(day)}
                      className={cn(
                        'h-9 w-9 p-0 text-sm font-normal',
                        !isCurrentMonth && 'text-slate-400 dark:text-slate-600',
                        isSelected && 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white',
                        !isSelected && isToday && 'bg-slate-100 dark:bg-slate-700',
                        !isSelected && 'hover:bg-slate-100 dark:hover:bg-slate-700',
                      )}
                    >
                      {format(day, 'd')}
                    </Button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
