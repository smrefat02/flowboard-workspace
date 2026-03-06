import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format, parse } from 'date-fns';

interface DatePickerModalProps {
  open: boolean;
  onClose: () => void;
  startDate?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  recurring?: 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminder?: string | null;
  onSave: (data: {
    start_date: string | null;
    due_date: string | null;
    due_time: string | null;
    recurring: 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    reminder: string | null;
  }) => void;
}

export function DatePickerModal({
  open,
  onClose,
  startDate,
  dueDate,
  dueTime,
  recurring = 'never',
  reminder,
  onSave,
}: DatePickerModalProps) {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('23:30');
  const [recurringValue, setRecurringValue] = useState<'never' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('never');
  const [reminderValue, setReminderValue] = useState('1 Day before');
  const [enableStartDate, setEnableStartDate] = useState(false);
  const [enableDueDate, setEnableDueDate] = useState(false);

  useEffect(() => {
    if (startDate) {
      try {
        setSelectedStartDate(parse(startDate, 'yyyy-MM-dd', new Date()));
        setEnableStartDate(true);
      } catch {
        // ignore
      }
    } else {
      setSelectedStartDate(undefined);
      setEnableStartDate(false);
    }

    if (dueDate) {
      try {
        setSelectedDueDate(parse(dueDate, 'yyyy-MM-dd', new Date()));
        setEnableDueDate(true);
      } catch {
        // ignore
      }
    } else {
      setSelectedDueDate(undefined);
      setEnableDueDate(false);
    }

    setTime(dueTime || '23:30');
    setRecurringValue(recurring || 'never');
    setReminderValue(reminder || '1 Day before');
  }, [startDate, dueDate, dueTime, recurring, reminder]);

  const handleSave = () => {
    onSave({
      start_date: enableStartDate && selectedStartDate ? format(selectedStartDate, 'yyyy-MM-dd') : null,
      due_date: enableDueDate && selectedDueDate ? format(selectedDueDate, 'yyyy-MM-dd') : null,
      due_time: enableDueDate ? time : null,
      recurring: recurringValue,
      reminder: enableDueDate ? reminderValue : null,
    });
    onClose();
  };

  const handleRemove = () => {
    onSave({
      start_date: null,
      due_date: null,
      due_time: null,
      recurring: 'never',
      reminder: null,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl dark:bg-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-slate-700">
          <h2 className="text-sm font-semibold">Dates</h2>
          <button
            onClick={onClose}
            className="rounded-sm p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {/* Calendar */}
          <Calendar
            selected={selectedDueDate || selectedStartDate}
            onSelect={(date) => {
              if (enableDueDate) {
                setSelectedDueDate(date);
              } else if (enableStartDate) {
                setSelectedStartDate(date);
              }
            }}
          />

          {/* Start Date */}
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start date</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableStartDate}
                onChange={(e) => {
                  setEnableStartDate(e.target.checked);
                  if (e.target.checked && !selectedStartDate) {
                    setSelectedStartDate(new Date());
                  }
                }}
                className="h-4 w-4"
              />
              <input
                type="text"
                value={enableStartDate && selectedStartDate ? format(selectedStartDate, 'MM/dd/yyyy') : ''}
                readOnly
                placeholder="MM/DD/YYYY"
                className="h-9 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Due date</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableDueDate}
                onChange={(e) => {
                  setEnableDueDate(e.target.checked);
                  if (e.target.checked && !selectedDueDate) {
                    setSelectedDueDate(new Date());
                  }
                }}
                className="h-4 w-4"
              />
              <input
                type="text"
                value={enableDueDate && selectedDueDate ? format(selectedDueDate, 'MM/dd/yyyy') : ''}
                readOnly
                placeholder="MM/DD/YYYY"
                className="h-9 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={!enableDueDate}
                className="h-9 w-24 rounded-md border border-slate-300 px-2 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Recurring <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">NEW</span>
            </label>
            <select
              value={recurringValue}
              onChange={(e) => setRecurringValue(e.target.value as any)}
              disabled={!enableDueDate}
              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Reminder */}
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Set due date reminder</label>
            <select
              value={reminderValue}
              onChange={(e) => setReminderValue(e.target.value)}
              disabled={!enableDueDate}
              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="None">None</option>
              <option value="At time of due date">At time of due date</option>
              <option value="5 Minutes before">5 Minutes before</option>
              <option value="10 Minutes before">10 Minutes before</option>
              <option value="15 Minutes before">15 Minutes before</option>
              <option value="1 Hour before">1 Hour before</option>
              <option value="2 Hours before">2 Hours before</option>
              <option value="1 Day before">1 Day before</option>
              <option value="2 Days before">2 Days before</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reminders will be sent to all members and watchers of this card.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t p-4 dark:border-slate-700">
          <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
          <Button variant="outline" onClick={handleRemove} className="flex-1">
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
